import { useState, useEffect, useRef, useCallback } from 'react';
import { RoomState, CardDirection, VocabularyItem } from '../types';
import { vocabularyItems } from '../data/vocabulary';
import { getStoredUsername, getStoredAvatarColor, getClientId } from '../services/username';

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
  const bcRef = useRef<BroadcastChannel | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const failedAttemptsRef = useRef<number>(0);

  // Clear transient error after a delay
  const showError = useCallback((msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => {
      setErrorMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  }, []);

  // Broadcast helper for local/Vercel fallback
  const broadcastLocal = useCallback((action: any) => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      if (!bcRef.current) {
        bcRef.current = new BroadcastChannel('esho_arabi_room_sync');
      }
      bcRef.current.postMessage(action);
    }
  }, []);

  // Initialize BroadcastChannel listener for fallback mode
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;

    const bc = new BroadcastChannel('esho_arabi_room_sync');
    bcRef.current = bc;

    bc.onmessage = (e) => {
      const data = e.data;
      if (!data) return;

      if (data.type === 'SYNC_STATE') {
        setRoomState(data.state);
        sessionStorage.setItem('last_room_code', data.code);
      } else if (data.type === 'REQUEST_STATE' && roomState && roomState.code === data.roomCode) {
        // Reply with current state
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
  }, [roomState]);

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

        // If server connection fails (such as on Vercel serverless / static hosting where /ws does not exist)
        if (failedAttemptsRef.current >= 2) {
          setIsFallbackMode(true);
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('disconnected');
          // Attempt reconnect after 3 seconds
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, 3000);
        }
      };

      socket.onerror = () => {
        failedAttemptsRef.current += 1;
        setIsFallbackMode(true);
        setConnectionStatus('connected');
        socket.close();
      };
    } catch {
      failedAttemptsRef.current += 1;
      setIsFallbackMode(true);
      setConnectionStatus('connected');
    }
  }, [clientId, showError]);

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

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'CREATE_ROOM',
            username: activeName,
            avatarColor: activeColor,
            clientId,
          })
        );
      } else {
        // Fallback Client-side / Vercel Room Generation
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
              type: 'system',
              timestamp: Date.now(),
            },
          ],
        };

        setRoomState(newState);
        sessionStorage.setItem('last_room_code', code);
        localStorage.setItem(`esho_room_${code}`, JSON.stringify(newState));
        broadcastLocal({ type: 'SYNC_STATE', code, state: newState });
        setIsFallbackMode(true);
        setConnectionStatus('connected');
      }
    },
    [username, avatarColor, clientId, broadcastLocal]
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

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
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
        // Fallback Client-side / Vercel Room Join
        const saved = localStorage.getItem(`esho_room_${cleanCode}`);
        if (!saved) {
          showError(`রুম কোড "${cleanCode}" পাওয়া যায়নি`);
          return;
        }

        try {
          const parsed: RoomState = JSON.parse(saved);
          const alreadyIn = parsed.participants.some((p) => p.id === clientId);
          const updatedParticipants = alreadyIn
            ? parsed.participants
            : [
                ...parsed.participants,
                {
                  id: clientId,
                  username: activeName,
                  avatarColor: activeColor,
                  isHost: false,
                  joinedAt: Date.now(),
                },
              ];

          const updatedState: RoomState = {
            ...parsed,
            participants: updatedParticipants,
            messages: [
              ...parsed.messages,
              {
                id: `msg-${Date.now()}`,
                senderId: 'system',
                senderName: 'সিস্টেম',
                text: `${activeName} রুমে যুক্ত হয়েছেন`,
                type: 'system',
                timestamp: Date.now(),
              },
            ].slice(-50),
          };

          setRoomState(updatedState);
          sessionStorage.setItem('last_room_code', cleanCode);
          localStorage.setItem(`esho_room_${cleanCode}`, JSON.stringify(updatedState));
          broadcastLocal({ type: 'SYNC_STATE', code: cleanCode, state: updatedState });
          setIsFallbackMode(true);
          setConnectionStatus('connected');
        } catch {
          showError('রুম ডাটা লোড করতে ব্যর্থ হয়েছে');
        }
      }
    },
    [username, avatarColor, clientId, showError, broadcastLocal]
  );

  const putCard = useCallback(
    (cardId: string, mode: CardDirection = 'photo') => {
      if (!roomState) return;

      // RULE: when one flip card is putten until its flipped by the user who put the card cannot put any other card at the same time
      if (roomState.activeCard && !roomState.activeCard.isFlipped) {
        showError(
          `বর্তমান কার্ডটি এখনো উল্টানো হয়নি! ${roomState.activeCard.putByUsername} এটি উল্টানোর পর পরবর্তী কার্ড রাখা যাবে।`
        );
        return;
      }

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'PUT_CARD',
            cardId,
            mode,
          })
        );
      } else {
        // Fallback update
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
              type: 'system',
              timestamp: Date.now(),
            },
          ].slice(-50),
        };

        setRoomState(updatedState);
        localStorage.setItem(`esho_room_${roomState.code}`, JSON.stringify(updatedState));
        broadcastLocal({ type: 'SYNC_STATE', code: roomState.code, state: updatedState });
      }
    },
    [roomState, username, clientId, showError, broadcastLocal]
  );

  const flipCard = useCallback(() => {
    if (!roomState || !roomState.activeCard) return;

    // RULE: others cannot flip it except the user who put it!
    if (roomState.activeCard.putByUserId !== clientId) {
      showError(`শুধুমাত্র ${roomState.activeCard.putByUsername} যিনি কার্ডটি রেখেছেন তিনিই এটি উল্টাতে পারবেন!`);
      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
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
            type: 'system',
            timestamp: Date.now(),
          },
        ].slice(-50),
      };

      setRoomState(updatedState);
      localStorage.setItem(`esho_room_${roomState.code}`, JSON.stringify(updatedState));
      broadcastLocal({ type: 'SYNC_STATE', code: roomState.code, state: updatedState });
    }
  }, [roomState, clientId, showError, broadcastLocal]);

  const clearCard = useCallback(() => {
    if (!roomState || !roomState.activeCard) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
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
      localStorage.setItem(`esho_room_${roomState.code}`, JSON.stringify(updatedState));
      broadcastLocal({ type: 'SYNC_STATE', code: roomState.code, state: updatedState });
    }
  }, [roomState, broadcastLocal]);

  const sendMessage = useCallback(
    (text: string, messageType: 'chat' | 'reaction' = 'chat') => {
      if (!roomState || !text.trim()) return;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
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
        localStorage.setItem(`esho_room_${roomState.code}`, JSON.stringify(updatedState));
        broadcastLocal({ type: 'SYNC_STATE', code: roomState.code, state: updatedState });
      }
    },
    [roomState, username, clientId, broadcastLocal]
  );

  const leaveRoom = useCallback(() => {
    sessionStorage.removeItem('last_room_code');
    setRoomState(null);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'LEAVE_ROOM',
        })
      );
    }
  }, []);

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
