import Paho from 'paho-mqtt';
import { RoomState } from '../types';

interface PendingJoin {
  onFound: (state: RoomState) => void;
  onNotFound: () => void;
  timer: number;
}

interface BrokerConfig {
  name: string;
  host: string;
  port: number;
  path: string;
}

const BROKERS: BrokerConfig[] = [
  { name: 'EMQX Edge (High Speed)', host: 'broker.emqx.io', port: 8084, path: '/mqtt' },
  { name: 'HiveMQ (Backup)', host: 'broker.hivemq.com', port: 8884, path: '/mqtt' },
];

export class MqttRoomRelay {
  private client: Paho.Client | null = null;
  private currentRoomCode: string | null = null;
  private clientId: string;
  private isConnecting = false;
  private isConnected = false;
  private activeBrokerIndex = 0;
  private onStateCallback: ((state: RoomState) => void) | null = null;
  private onStatusChangeCallback: ((status: 'connected' | 'connecting' | 'disconnected') => void) | null = null;
  private pendingPublishState: RoomState | null = null;
  private pendingJoins = new Map<string, PendingJoin>();
  private pingInterval: number | null = null;
  private lastMessageTimestamp = 0;

  constructor(clientId: string) {
    this.clientId = `esho_${clientId.replace(/[^a-zA-Z0-9]/g, '').slice(-8)}_${Math.random().toString(36).slice(2, 7)}`;
  }

  public setCallbacks(
    onState: (state: RoomState) => void,
    onStatusChange: (status: 'connected' | 'connecting' | 'disconnected') => void
  ) {
    this.onStateCallback = onState;
    this.onStatusChangeCallback = onStatusChange;
  }

  private getTopic(roomCode: string): string {
    return `esho_arabi_v3/room_${roomCode.toUpperCase().trim()}`;
  }

  public connect(): Promise<boolean> {
    if (this.isConnected && this.client?.isConnected()) {
      return Promise.resolve(true);
    }

    if (this.isConnecting) {
      return new Promise((resolve) => {
        let attempts = 0;
        const check = window.setInterval(() => {
          attempts += 1;
          if (!this.isConnecting) {
            window.clearInterval(check);
            resolve(this.isConnected);
          } else if (attempts > 40) {
            window.clearInterval(check);
            resolve(false);
          }
        }, 100);
      });
    }

    this.isConnecting = true;
    this.onStatusChangeCallback?.('connecting');

    const broker = BROKERS[this.activeBrokerIndex];

    return new Promise((resolve) => {
      try {
        const client = new Paho.Client(broker.host, broker.port, broker.path, this.clientId);
        this.client = client;

        client.onConnectionLost = (responseObject) => {
          this.isConnected = false;
          this.isConnecting = false;
          this.onStatusChangeCallback?.('disconnected');
          if (this.pingInterval) {
            window.clearInterval(this.pingInterval);
            this.pingInterval = null;
          }
          if (responseObject.errorCode !== 0) {
            console.warn(`[MQTT Relay] Connection lost on ${broker.name}:`, responseObject.errorMessage);
            // Reconnect after brief delay
            window.setTimeout(() => {
              this.connect();
            }, 2000);
          }
        };

        client.onMessageArrived = (message) => {
          this.handleIncomingMessage(message);
        };

        client.connect({
          useSSL: true,
          timeout: 4,
          keepAliveInterval: 30,
          cleanSession: true,
          onSuccess: () => {
            this.isConnected = true;
            this.isConnecting = false;
            this.onStatusChangeCallback?.('connected');

            // Keepalive ping for mobile cellular networks
            if (this.pingInterval) window.clearInterval(this.pingInterval);
            this.pingInterval = window.setInterval(() => {
              if (this.client?.isConnected() && this.currentRoomCode) {
                try {
                  const pTopic = `esho_arabi_v3/ping_${this.clientId}`;
                  const pMsg = new Paho.Message('1');
                  pMsg.destinationName = pTopic;
                  pMsg.qos = 0;
                  this.client.send(pMsg);
                } catch {}
              }
            }, 25000);

            // Re-subscribe if we already have an active room
            if (this.currentRoomCode) {
              const topic = this.getTopic(this.currentRoomCode);
              client.subscribe(topic, { qos: 0 });
            }

            // Flush pending state publish
            if (this.pendingPublishState) {
              this.publishState(this.pendingPublishState);
              this.pendingPublishState = null;
            }

            resolve(true);
          },
          onFailure: (err) => {
            console.warn(`[MQTT Relay] Failed to connect to ${broker.name}:`, err.errorMessage);
            this.isConnected = false;
            this.isConnecting = false;

            // Try fallback broker if primary failed
            if (this.activeBrokerIndex < BROKERS.length - 1) {
              this.activeBrokerIndex += 1;
              console.log(`[MQTT Relay] Switching to ${BROKERS[this.activeBrokerIndex].name}...`);
              this.connect().then(resolve);
            } else {
              this.activeBrokerIndex = 0;
              this.onStatusChangeCallback?.('disconnected');
              resolve(false);
            }
          },
        });
      } catch (err) {
        console.error('[MQTT Relay] Init error:', err);
        this.isConnecting = false;
        this.isConnected = false;
        this.onStatusChangeCallback?.('disconnected');
        resolve(false);
      }
    });
  }

  private handleIncomingMessage(message: Paho.Message) {
    try {
      const payloadStr = message.payloadString;
      if (!payloadStr) return;

      const data = JSON.parse(payloadStr);
      if (!data || !data.code) return;

      const cleanCode = String(data.code).toUpperCase().trim();

      // Check if room was closed
      if (data._closed) {
        return;
      }

      const roomState: RoomState = {
        code: cleanCode,
        createdAt: data.createdAt || Date.now(),
        participants: Array.isArray(data.participants) ? data.participants : [],
        activeCard: data.activeCard || null,
        historyCount: typeof data.historyCount === 'number' ? data.historyCount : 0,
        messages: Array.isArray(data.messages) ? data.messages : [],
      };

      // 1. Resolve any pending joinRoom caller waiting for this code
      const pendingJoin = this.pendingJoins.get(cleanCode);
      if (pendingJoin) {
        window.clearTimeout(pendingJoin.timer);
        this.pendingJoins.delete(cleanCode);
        pendingJoin.onFound(roomState);
      }

      // 2. Broadcast immediately to UI state handler
      this.onStateCallback?.(roomState);
    } catch (e) {
      console.error('[MQTT Relay] Failed to parse message:', e);
    }
  }

  public async createRoom(initialState: RoomState): Promise<boolean> {
    const cleanCode = initialState.code.toUpperCase().trim();
    this.currentRoomCode = cleanCode;

    const connected = await this.connect();
    if (!connected || !this.client) {
      this.pendingPublishState = initialState;
      return false;
    }

    const topic = this.getTopic(cleanCode);
    this.client.subscribe(topic, {
      qos: 0,
      onSuccess: () => {
        this.publishState(initialState);
      },
    });

    return true;
  }

  public async joinRoom(
    roomCode: string,
    onFound: (state: RoomState) => void,
    onNotFound: () => void
  ): Promise<void> {
    const cleanCode = roomCode.toUpperCase().trim();
    this.currentRoomCode = cleanCode;

    const connected = await this.connect();
    if (!connected || !this.client) {
      onNotFound();
      return;
    }

    const existing = this.pendingJoins.get(cleanCode);
    if (existing) {
      window.clearTimeout(existing.timer);
      this.pendingJoins.delete(cleanCode);
    }

    const timer = window.setTimeout(() => {
      this.pendingJoins.delete(cleanCode);
      onNotFound();
    }, 6000);

    this.pendingJoins.set(cleanCode, {
      onFound,
      onNotFound,
      timer,
    });

    const topic = this.getTopic(cleanCode);
    this.client.subscribe(topic, {
      qos: 0,
      onFailure: () => {
        const pending = this.pendingJoins.get(cleanCode);
        if (pending) {
          window.clearTimeout(pending.timer);
          this.pendingJoins.delete(cleanCode);
          onNotFound();
        }
      },
    });
  }

  public publishState(state: RoomState) {
    if (!this.client || !this.isConnected || !this.client.isConnected()) {
      this.pendingPublishState = state;
      return;
    }

    try {
      const topic = this.getTopic(state.code);
      const payload = JSON.stringify(state);

      // 1. Lightning-fast in-memory dispatch to currently active players (<150ms roundtrip)
      const instantMsg = new Paho.Message(payload);
      instantMsg.destinationName = topic;
      instantMsg.retained = false;
      instantMsg.qos = 0;
      this.client.send(instantMsg);

      // 2. Retained snapshot for new players who join the room later
      const retainedMsg = new Paho.Message(payload);
      retainedMsg.destinationName = topic;
      retainedMsg.retained = true;
      retainedMsg.qos = 1;
      this.client.send(retainedMsg);
    } catch (e) {
      console.error('[MQTT Relay] Failed to publish state:', e);
    }
  }

  public leaveRoom(roomCode: string, isLastUser = false) {
    const cleanCode = roomCode.toUpperCase().trim();
    const pending = this.pendingJoins.get(cleanCode);
    if (pending) {
      window.clearTimeout(pending.timer);
      this.pendingJoins.delete(cleanCode);
    }

    const topic = this.getTopic(cleanCode);

    if (isLastUser && this.client && this.isConnected && this.client.isConnected()) {
      try {
        const emptyMsg = new Paho.Message(JSON.stringify({ code: cleanCode, _closed: true }));
        emptyMsg.destinationName = topic;
        emptyMsg.retained = true;
        emptyMsg.qos = 1;
        this.client.send(emptyMsg);
      } catch {}
    }

    if (this.client && this.isConnected && this.client.isConnected()) {
      try {
        this.client.unsubscribe(topic);
      } catch {}
    }

    if (this.currentRoomCode === cleanCode) {
      this.currentRoomCode = null;
    }
  }

  public disconnect() {
    this.pendingJoins.forEach((p) => window.clearTimeout(p.timer));
    this.pendingJoins.clear();

    if (this.pingInterval) {
      window.clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.client && this.isConnected && this.client.isConnected()) {
      try {
        this.client.disconnect();
      } catch {}
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.currentRoomCode = null;
  }
}
