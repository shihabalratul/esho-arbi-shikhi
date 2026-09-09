import { useState, useEffect, useRef, useCallback } from 'react';
import { RoomState, RoomMessage, CardDirection, VocabularyItem } from '../types';
import { vocabularyItems } from '../data/vocabulary';
import { getStoredUsername, getStoredAvatarColor, getClientId } from '../services/username';
import { MqttRoomRelay } from '../services/mqttRelay';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export function useRoomSocket() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [isFallbackMode, setIsFallbackMode] = useState<boolean>(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [username, setUsernameState] = useState<string>(() => getStoredUsername());
  const [avatarColor, setAvatarColorState] = useState<string>(() => getStoredAvatarColor());
  const clientId = useRef<string>(getClientId()).current;

  const wsRef = useRef<WebSocket | null>(null);
  const mqttRelayRef = useRef<MqttRoomRelay | null>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const failedAttemptsRef = useRef<number>(0);

  // Initialize MQTT Relay instance
  if (!mqttRelayRef.current) {
    mqttRelayRef.current = new MqttRoomRelay(clientId);
  }

  // Clear transient error after a delay
  const showError = useCallback((msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => {
      setErrorMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  }, []);

  // Broadcast helper for local fallback between tabs
  const broadcastLocal = useCallback((action: any) => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      if (!bcRef.current) {
        bcRef.current = new BroadcastChannel('esho_arabi_room_sync');
      }
      try {
        bcRef.current.postMessage(action);
      } catch {}
    }
  }, []);

  // Sync state received from MQTT or local broadcast
  const applyIncomingState = useCallback((incoming: RoomState) => {
    setRoomState((prev) => {
      // If we don't have a room state yet or it's for the same room code, apply it
      if (!prev || prev.code === incoming.code) {
        sessionStorage.setItem('last_room_code', incoming.code);
        try {
          localStorage.setItem(`esho_room_${incoming.code}`, JSON.stringify(incoming));
        } catch {}
        return incoming;
      }
      return prev;
    });
  }, []);

  // Attach callback to MQTT relay
  useEffect(() => {
    const relay = mqttRelayRef.current;
    if (!relay) return;

    relay.setCallbacks(
      (newState: RoomState) => {
        applyIncomingState(newState);
      },
      (newStatus: 'connected' | 'connecting' | 'disconnected') => {
        if (isFallbackMode) {
          setConnectionStatus(newStatus);
        }
      }
    );
  }, [applyIncomingState, isFallbackMode]);

  // Initialize BroadcastChannel listener
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;

    const bc = new BroadcastChannel('esho_arabi_room_sync');
    bcRef.current = bc;

    bc.onmessage = (e) => {
      const data = e.data;
      if (!data) return;

      if (data.type === 'SYNC_STATE' && data.state) {
        applyIncomingState(data.state);
      } else if (data.type === 'REQUEST_STATE' && roomState && roomState.code === data.roomCode) {
        bc.postMessage({
          type: 'SYNC_STATE',
          code: roomState.code,
          state: roomState,
        });
      }
    };

    return () => {
      bc.close();
    };
  }, [roomState, applyIncomingState]);

  // Switch to cloud relay (for Vercel / serverless / static hosting)
  const activateCloudRelay = useCallback(() => {
    setIsFallbackMode(true);
    setConnectionStatus('connecting');
    const relay = mqttRelayRef.current;
    if (!relay) return;

    relay.connect().then((connected) => {
      setConnectionStatus(connected ? 'connected' : 'disconnected');
      // If we had a saved room code, reconnect via cloud relay
      const lastRoom = sessionStorage.getItem('last_room_code');
      if (lastRoom && !roomState) {
        relay.joinRoom(
          lastRoom,
          (state) => {
            applyIncomingState(state);
          },
          () => {
            // Room might have expired; clear last code
            sessionStorage.removeItem('last_room_code');
          }
        );
      }
    });
  }, [roomState, applyIncomingState]);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setConnectionStatus('connecting');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    try {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setConnectionStatus('connected');
        setIsFallbackMode(false);
        failedAttemptsRef.current = 0;

        // Start ping heartbeat every 25 seconds
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = window.setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'PING' }));
          }
        }, 25000);

        // If we were previously in a room, re-join seamlessly
        const lastRoom = sessionStorage.getItem('last_room_code');
        if (lastRoom) {
          socket.send(
            JSON.stringify({
              type: 'JOIN_ROOM',
              roomCode: lastRoom,
              username: getStoredUsername() || 'শিক্ষার্থী',
              avatarColor: getStoredAvatarColor(),
              clientId,
            })
          );
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'PONG') {
            return;
          }

          if (data.type === 'ROOM_CREATED' || data.type === 'ROOM_JOINED') {
            setRoomState(data.state);
            sessionStorage.setItem('last_room_code', data.code);
            setErrorMessage(null);
            return;
          }

          if (data.type === 'ROOM_STATE') {
            setRoomState(data.state);
            return;
          }

          if (data.type === 'NEW_MESSAGE') {
            setRoomState((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                messages: [...prev.messages, data.message].slice(-50),
              };
            });
            return;
          }

          if (data.type === 'ROOM_LEFT') {
            setRoomState(null);
            sessionStorage.removeItem('last_room_code');
            return;
          }

          if (data.type === 'ERROR') {
            showError(data.message || 'একটি ত্রুটি ঘটেছে');
            if (data.code === 'ROOM_NOT_FOUND') {
              sessionStorage.removeItem('last_room_code');
              setRoomState(null);
            }
            return;
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      socket.onclose = () => {
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        failedAttemptsRef.current += 1;

        // If local server connection fails (such as on Vercel / static hosting where /ws does not exist)
        activateCloudRelay();
      };

      socket.onerror = () => {
        failedAttemptsRef.current += 1;
        activateCloudRelay();
        try {
          socket.close();
        } catch {}
      };
    } catch {
      failedAttemptsRef.current += 1;
      activateCloudRelay();
    }
  }, [clientId, showError, activateCloudRelay]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Actions
  const createRoom = useCallback(
    (customName?: string, customColor?: string) => {
      const activeName = customName || username || getStoredUsername() || 'শিক্ষার্থী';
      const activeColor = customColor || avatarColor || getStoredAvatarColor();

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !isFallbackMode) {
        wsRef.current.send(
          JSON.stringify({
            type: 'CREATE_ROOM',
            username: activeName,
            avatarColor: activeColor,
            clientId,
          })
        );
      } else {
        // Cloud Relay / Vercel Room Generation
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const newState: RoomState = {
          code,
          createdAt: Date.now(),
          participants: [
            {
              id: clientId,
              username: activeName,
              avatarColor: activeColor,
              isHost: true,
              joinedAt: Date.now(),
            },
          ],
          activeCard: null,
          historyCount: 0,
          messages: [
            {
              id: `msg-${Date.now()}`,
              senderId: 'system',
              senderName: 'সিস্টেম',
              text: `${activeName} রুম তৈরি করেছেন`,
              type: 'system' as const,
              timestamp: Date.now(),
            },
          ],
        };

        setRoomState(newState);
        sessionStorage.setItem('last_room_code', code);
        try {
          localStorage.setItem(`esho_room_${code}`, JSON.stringify(newState));
        } catch {}
        broadcastLocal({ type: 'SYNC_STATE', code, state: newState });
        setIsFallbackMode(true);
        setConnectionStatus('connected');

        // Publish to Cloud Relay so other devices & browsers immediately see it
        mqttRelayRef.current?.createRoom(newState);
      }
    },
    [username, avatarColor, clientId, isFallbackMode, broadcastLocal]
  );

  const joinRoom = useCallback(
    (code: string, customName?: string, customColor?: string) => {
      const cleanCode = code.trim().toUpperCase();
      if (!cleanCode) {
        showError('দয়া করে রুম কোড লিখুন');
        return;
      }

      const activeName = customName || username || getStoredUsername() || 'শিক্ষার্থী';
      const activeColor = customColor || avatarColor || getStoredAvatarColor();

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !isFallbackMode) {
        wsRef.current.send(
          JSON.stringify({
            type: 'JOIN_ROOM',
            roomCode: cleanCode,
            username: activeName,
            avatarColor: activeColor,
            clientId,
          })
        );
      } else {
        setConnectionStatus('connecting');

        // First check cloud relay (works across different devices/browsers on Vercel)
        mqttRelayRef.current?.joinRoom(
          cleanCode,
          (foundState: RoomState) => {
            const alreadyIn = foundState.participants.some((p) => p.id === clientId);
            const updatedParticipants = alreadyIn
              ? foundState.participants
              : [
                  ...foundState.participants,
                  {
                    id: clientId,
                    username: activeName,
                    avatarColor: activeColor,
                    isHost: false,
                    joinedAt: Date.now(),
                  },
                ];

            const updatedState: RoomState = {
              ...foundState,
              participants: updatedParticipants,
              messages: alreadyIn
                ? foundState.messages
                : [
                    ...foundState.messages,
                    {
                      id: `msg-${Date.now()}`,
                      senderId: 'system',
                      senderName: 'সিস্টেম',
                      text: `${activeName} রুমে যুক্ত হয়েছেন`,
                      type: 'system' as const,
                      timestamp: Date.now(),
                    },
                  ].slice(-50),
            };

            setRoomState(updatedState);
            sessionStorage.setItem('last_room_code', cleanCode);
            try {
              localStorage.setItem(`esho_room_${cleanCode}`, JSON.stringify(updatedState));
            } catch {}
            broadcastLocal({ type: 'SYNC_STATE', code: cleanCode, state: updatedState });
            setIsFallbackMode(true);
            setConnectionStatus('connected');

            // Publish our joined state to other participants
            mqttRelayRef.current?.publishState(updatedState);
          },
          () => {
            // Check if available in local storage as final fallback
            const saved = localStorage.getItem(`esho_room_${cleanCode}`);
            if (saved) {
              try {
                const parsed: RoomState = JSON.parse(saved);
                setRoomState(parsed);
                sessionStorage.setItem('last_room_code', cleanCode);
                setConnectionStatus('connected');
                return;
              } catch {}
            }
            setConnectionStatus('connected');
            showError(`রুম কোড "${cleanCode}" পাওয়া যায়নি। দয়া করে কোডটি পুনরায় চেক করুন।`);
          }
        );
      }
    },
    [username, avatarColor, clientId, isFallbackMode, showError, broadcastLocal]
  );

  const putCard = useCallback(
    (cardId: string, mode: CardDirection = 'photo') => {
      if (!roomState) return;

      // RULE: when one flip card is put until its flipped by the user who put the card cannot put any other card at the same time
      if (roomState.activeCard && !roomState.activeCard.isFlipped) {
        showError(
          `বর্তমান কার্ডটি এখনো উল্টানো হয়নি! ${roomState.activeCard.putByUsername} এটি উল্টানোর পর পরবর্তী কার্ড রাখা যাবে।`
        );
        return;
      }

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !isFallbackMode) {
        wsRef.current.send(
          JSON.stringify({
            type: 'PUT_CARD',
            cardId,
            mode,
          })
        );
      } else {
        const myName = username || getStoredUsername() || 'শিক্ষার্থী';
        const updatedState: RoomState = {
          ...roomState,
          activeCard: {
            cardId,
            putByUserId: clientId,
            putByUsername: myName,
            putAt: Date.now(),
            isFlipped: false,
            mode,
          },
          messages: [
            ...roomState.messages,
            {
              id: `msg-${Date.now()}`,
              senderId: 'system',
              senderName: 'সিস্টেম',
              text: `${myName} একটি কার্ড টেবিলে রেখেছেন`,
              type: 'system' as const,
              timestamp: Date.now(),
            },
          ].slice(-50),
        };

        setRoomState(updatedState);
        try {
          localStorage.setItem(`esho_room_${roomState.code}`, JSON.stringify(updatedState));
        } catch {}
        broadcastLocal({ type: 'SYNC_STATE', code: roomState.code, state: updatedState });
        mqttRelayRef.current?.publishState(updatedState);
      }
    },
    [roomState, username, clientId, isFallbackMode, showError, broadcastLocal]
  );

  const flipCard = useCallback(() => {
    if (!roomState || !roomState.activeCard) return;

    // RULE: others cannot flip it except the user who put it!
    if (roomState.activeCard.putByUserId !== clientId) {
      showError(`শুধুমাত্র ${roomState.activeCard.putByUsername} যিনি কার্ডটি রেখেছেন তিনিই এটি উল্টাতে পারবেন!`);
      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !isFallbackMode) {
      wsRef.current.send(
        JSON.stringify({
          type: 'FLIP_CARD',
        })
      );
    } else {
      const updatedState: RoomState = {
        ...roomState,
        activeCard: {
          ...roomState.activeCard,
          isFlipped: true,
          flippedAt: Date.now(),
        },
        historyCount: roomState.historyCount + 1,
        messages: [
          ...roomState.messages,
          {
            id: `msg-${Date.now()}`,
            senderId: 'system',
            senderName: 'সিস্টেম',
            text: `${roomState.activeCard.putByUsername} কার্ডটি উল্টে সঠিক উত্তর দেখিয়েছেন`,
            type: 'system' as const,
            timestamp: Date.now(),
          },
        ].slice(-50),
      };

      setRoomState(updatedState);
      try {
        localStorage.setItem(`esho_room_${roomState.code}`, JSON.stringify(updatedState));
      } catch {}
      broadcastLocal({ type: 'SYNC_STATE', code: roomState.code, state: updatedState });
      mqttRelayRef.current?.publishState(updatedState);
    }
  }, [roomState, clientId, isFallbackMode, showError, broadcastLocal]);

  const clearCard = useCallback(() => {
    if (!roomState || !roomState.activeCard) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !isFallbackMode) {
      wsRef.current.send(
        JSON.stringify({
          type: 'CLEAR_CARD',
        })
      );
    } else {
      const updatedState: RoomState = {
        ...roomState,
        activeCard: null,
      };
      setRoomState(updatedState);
      try {
        localStorage.setItem(`esho_room_${roomState.code}`, JSON.stringify(updatedState));
      } catch {}
      broadcastLocal({ type: 'SYNC_STATE', code: roomState.code, state: updatedState });
      mqttRelayRef.current?.publishState(updatedState);
    }
  }, [roomState, isFallbackMode, broadcastLocal]);

  const sendMessage = useCallback(
    (text: string, messageType: 'chat' | 'reaction' = 'chat') => {
      if (!roomState || !text.trim()) return;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !isFallbackMode) {
        wsRef.current.send(
          JSON.stringify({
            type: 'SEND_MESSAGE',
            text: text.trim(),
            messageType,
          })
        );
      } else {
        const myName = username || getStoredUsername() || 'শিক্ষার্থী';
        const updatedState: RoomState = {
          ...roomState,
          messages: [
            ...roomState.messages,
            {
              id: `msg-${Date.now()}`,
              senderId: clientId,
              senderName: myName,
              text: text.trim(),
              type: messageType,
              timestamp: Date.now(),
            },
          ].slice(-50),
        };
        setRoomState(updatedState);
        try {
          localStorage.setItem(`esho_room_${roomState.code}`, JSON.stringify(updatedState));
        } catch {}
        broadcastLocal({ type: 'SYNC_STATE', code: roomState.code, state: updatedState });
        mqttRelayRef.current?.publishState(updatedState);
      }
    },
    [roomState, username, clientId, isFallbackMode, broadcastLocal]
  );

  const leaveRoom = useCallback(() => {
    const currentCode = roomState?.code;
    sessionStorage.removeItem('last_room_code');

    if (roomState && isFallbackMode) {
      const remainingParticipants = roomState.participants.filter((p) => p.id !== clientId);
      if (remainingParticipants.length > 0) {
        if (!remainingParticipants.some((p) => p.isHost)) {
          remainingParticipants[0].isHost = true;
        }
        const updatedState: RoomState = {
          ...roomState,
          participants: remainingParticipants,
          messages: [
            ...roomState.messages,
            {
              id: `msg-${Date.now()}`,
              senderId: 'system',
              senderName: 'সিস্টেম',
              text: `${username || 'একজন শিক্ষার্থী'} রুম থেকে প্রস্থান করেছেন`,
              type: 'system' as const,
              timestamp: Date.now(),
            },
          ].slice(-50),
        };
        mqttRelayRef.current?.publishState(updatedState);
      } else if (currentCode) {
        mqttRelayRef.current?.leaveRoom(currentCode, true);
      }
    }

    setRoomState(null);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !isFallbackMode) {
      wsRef.current.send(
        JSON.stringify({
          type: 'LEAVE_ROOM',
        })
      );
    }
  }, [roomState, clientId, username, isFallbackMode]);

  // Derived information
  const activeCardItem: VocabularyItem | null = roomState?.activeCard
    ? vocabularyItems.find((v) => v.id === roomState.activeCard?.cardId) || null
    : null;

  const isMyCard = !!(roomState?.activeCard && roomState.activeCard.putByUserId === clientId);
  const canFlip = isMyCard && !!(roomState?.activeCard && !roomState.activeCard.isFlipped);
  const canPutCard = !roomState?.activeCard || !!roomState.activeCard.isFlipped;

  return {
    connectionStatus,
    isFallbackMode,
    roomState,
    errorMessage,
    showError,
    username,
    setUsernameState,
    avatarColor,
    setAvatarColorState,
    clientId,
    activeCardItem,
    isMyCard,
    canFlip,
    canPutCard,
    createRoom,
    joinRoom,
    putCard,
    flipCard,
    clearCard,
    sendMessage,
    leaveRoom,
  };
}
