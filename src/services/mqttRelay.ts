import Paho from 'paho-mqtt';
import { RoomState } from '../types';

interface BrokerConfig {
  host: string;
  port: number;
  path: string;
}

const BROKERS: BrokerConfig[] = [
  { host: 'broker.emqx.io', port: 8084, path: '/mqtt' },
  { host: 'broker.hivemq.com', port: 8884, path: '/mqtt' },
];

export class MqttRoomRelay {
  private client: Paho.Client | null = null;
  private currentBrokerIndex = 0;
  private currentRoomCode: string | null = null;
  private clientId: string;
  private isConnecting = false;
  private isConnected = false;
  private onStateCallback: ((state: RoomState) => void) | null = null;
  private onStatusChangeCallback: ((status: 'connected' | 'connecting' | 'disconnected') => void) | null = null;
  private joinTimeoutRef: number | null = null;
  private pendingPublishState: RoomState | null = null;

  constructor(clientId: string) {
    this.clientId = `esho_${clientId.slice(-8)}_${Math.random().toString(36).slice(2, 6)}`;
  }

  public setCallbacks(
    onState: (state: RoomState) => void,
    onStatusChange: (status: 'connected' | 'connecting' | 'disconnected') => void
  ) {
    this.onStateCallback = onState;
    this.onStatusChangeCallback = onStatusChange;
  }

  private getTopic(roomCode: string): string {
    return `esho_arabi_shikhi_v2/room_${roomCode.toUpperCase().trim()}`;
  }

  public connect(): Promise<boolean> {
    if (this.isConnected && this.client?.isConnected()) {
      return Promise.resolve(true);
    }

    if (this.isConnecting) {
      return new Promise((resolve) => {
        const check = setInterval(() => {
          if (!this.isConnecting) {
            clearInterval(check);
            resolve(this.isConnected);
          }
        }, 100);
      });
    }

    this.isConnecting = true;
    this.onStatusChangeCallback?.('connecting');

    return new Promise((resolve) => {
      const broker = BROKERS[this.currentBrokerIndex % BROKERS.length];
      
      try {
        const client = new Paho.Client(broker.host, broker.port, broker.path, this.clientId);
        this.client = client;

        client.onConnectionLost = (responseObject) => {
          this.isConnected = false;
          this.isConnecting = false;
          this.onStatusChangeCallback?.('disconnected');
          if (responseObject.errorCode !== 0) {
            console.warn('[MQTT Relay] Connection lost:', responseObject.errorMessage);
            // Try next broker on failure
            this.currentBrokerIndex = (this.currentBrokerIndex + 1) % BROKERS.length;
          }
        };

        client.onMessageArrived = (message) => {
          this.handleIncomingMessage(message);
        };

        client.connect({
          useSSL: true,
          timeout: 5,
          keepAliveInterval: 30,
          cleanSession: true,
          onSuccess: () => {
            this.isConnected = true;
            this.isConnecting = false;
            this.onStatusChangeCallback?.('connected');
            console.log(`[MQTT Relay] Connected to ${broker.host}`);

            // If we have an active room code, re-subscribe
            if (this.currentRoomCode) {
              const topic = this.getTopic(this.currentRoomCode);
              client.subscribe(topic, { qos: 1 });
            }

            // If there was a pending state to publish, send it
            if (this.pendingPublishState && this.currentRoomCode) {
              this.publishState(this.pendingPublishState);
              this.pendingPublishState = null;
            }

            resolve(true);
          },
          onFailure: (err) => {
            console.warn(`[MQTT Relay] Failed to connect to ${broker.host}:`, err.errorMessage);
            this.isConnected = false;
            this.isConnecting = false;
            this.currentBrokerIndex = (this.currentBrokerIndex + 1) % BROKERS.length;
            
            // Try next broker once
            if (this.currentBrokerIndex !== 0) {
              this.connect().then(resolve);
            } else {
              this.onStatusChangeCallback?.('disconnected');
              resolve(false);
            }
          },
        });
      } catch (err) {
        console.error('[MQTT Relay] Initialization error:', err);
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

      // Clear search timeout if waiting for room
      if (this.joinTimeoutRef) {
        window.clearTimeout(this.joinTimeoutRef);
        this.joinTimeoutRef = null;
      }

      // If room was closed or cleared
      if (data._closed) {
        return;
      }

      const roomState: RoomState = {
        code: data.code,
        createdAt: data.createdAt || Date.now(),
        participants: Array.isArray(data.participants) ? data.participants : [],
        activeCard: data.activeCard || null,
        historyCount: typeof data.historyCount === 'number' ? data.historyCount : 0,
        messages: Array.isArray(data.messages) ? data.messages : [],
      };

      this.onStateCallback?.(roomState);
    } catch (e) {
      console.error('[MQTT Relay] Failed to parse message payload:', e);
    }
  }

  public async createRoom(initialState: RoomState): Promise<boolean> {
    this.currentRoomCode = initialState.code;
    const connected = await this.connect();
    if (!connected || !this.client) {
      this.pendingPublishState = initialState;
      return false;
    }

    const topic = this.getTopic(initialState.code);
    this.client.subscribe(topic, {
      qos: 1,
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

    const topic = this.getTopic(cleanCode);

    // Timeout: if no retained message arrives in 3.5 seconds, consider room not found
    if (this.joinTimeoutRef) {
      window.clearTimeout(this.joinTimeoutRef);
    }

    let resolved = false;

    this.joinTimeoutRef = window.setTimeout(() => {
      if (!resolved) {
        resolved = true;
        this.joinTimeoutRef = null;
        onNotFound();
      }
    }, 3500);

    // Temporarily listen for the initial state
    const originalCallback = this.onStateCallback;
    this.onStateCallback = (state: RoomState) => {
      if (state.code === cleanCode) {
        if (!resolved) {
          resolved = true;
          if (this.joinTimeoutRef) {
            window.clearTimeout(this.joinTimeoutRef);
            this.joinTimeoutRef = null;
          }
          onFound(state);
        }
      }
      originalCallback?.(state);
    };

    this.client.subscribe(topic, {
      qos: 1,
      onFailure: () => {
        if (!resolved) {
          resolved = true;
          if (this.joinTimeoutRef) {
            window.clearTimeout(this.joinTimeoutRef);
            this.joinTimeoutRef = null;
          }
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
      const message = new Paho.Message(payload);
      message.destinationName = topic;
      message.retained = true; // Retain message so new joiners get it immediately
      message.qos = 1;
      this.client.send(message);
    } catch (e) {
      console.error('[MQTT Relay] Failed to publish state:', e);
    }
  }

  public leaveRoom(roomCode: string, isLastUser = false) {
    if (this.joinTimeoutRef) {
      window.clearTimeout(this.joinTimeoutRef);
      this.joinTimeoutRef = null;
    }

    const topic = this.getTopic(roomCode);

    if (isLastUser && this.client && this.isConnected && this.client.isConnected()) {
      // Clear retained message for room when last participant leaves
      try {
        const emptyMsg = new Paho.Message(JSON.stringify({ code: roomCode, _closed: true }));
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

    if (this.currentRoomCode === roomCode) {
      this.currentRoomCode = null;
    }
  }

  public disconnect() {
    if (this.joinTimeoutRef) {
      window.clearTimeout(this.joinTimeoutRef);
      this.joinTimeoutRef = null;
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
