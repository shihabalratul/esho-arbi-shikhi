import { useState, useEffect, useRef, useCallback } from 'react';
import { RoomState, RoomParticipant, RoomMessage, CardDirection, VocabularyItem } from '../types';
import { vocabularyItems } from '../data/vocabulary';
import { getStoredUsername, getStoredAvatarColor, getClientId } from '../services/username';
import { MqttRoomRelay } from '../services/mqttRelay';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export function useRoomSocket() {
  const isVercel =
    typeof window !== 'undefined' &&
    (window.location.hostname.endsWith('vercel.app') || window.location.hostname.includes('vercel'));

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [isFallbackMode, setIsFallbackMode] = useState<boolean>(isVercel);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [username, setUsernameState] = useState<string>(() => getStoredUsername());
  const [avatarColor, setAvatarColorState] = useState<string>(() => getStoredAvatarColor());
  const clientId = useRef<string>(getClientId()).current;

  const wsRef = useRef<WebSocket | null>(null);
  const mqttRelayRef = useRef<MqttRoomRelay | null>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const joinIntentRef = useRef<{ code: string; isExplicit: boolean } | null>(null);

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
  const broadcastLocal = useCallback((action: { type: string; code?: string; state?: RoomState }) => {
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
      if (!prev) {
        sessionStorage.setItem('last_room_code', incoming.code);
        try {
          localStorage.setItem(`esho_room_${incoming.code}`, JSON.stringify(incoming));
        } catch {}
        return incoming;
      }

      if (prev.code !== incoming.code) {
        return prev;
      }

      // Check version order: if incoming packet is older than current local state, do not overwrite card
      const prevVersion = prev.version ?? 0;
      const incomingVersion = incoming.version ?? 0;
      const isIncomingNewerOrEqual = incomingVersion >= prevVersion;

      // Always merge participants to reflect all joined peers
      const participantMap = new Map<string, RoomParticipant>();
      (prev.participants || []).forEach((p) => participantMap.set(p.id, p));
      (incoming.participants || []).forEach((p) => participantMap.set(p.id, p));
      const mergedParticipants = Array.from(participantMap.values());

      // Always merge messages by ID so no peer's chat or reactions are lost
      const msgMap = new Map<string, RoomMessage>();
      (prev.messages || []).forEach((m) => msgMap.set(m.id, m));
      (incoming.messages || []).forEach((m) => msgMap.set(m.id, m));
      const mergedMessages = Array.from(msgMap.values())
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(-50);

      // Determine activeCard:
      let resolvedCard = prev.activeCard;
      let shouldRebroadcastWinner = false;

      // Check if both refer to the exact same card instance
      const isSameCardInstance =
        Boolean(prev.activeCard &&
        incoming.activeCard &&
        prev.activeCard.cardId === incoming.activeCard.cardId &&
        prev.activeCard.putAt === incoming.activeCard.putAt);

      if (isSameCardInstance && prev.activeCard && incoming.activeCard) {
        // Same card instance: once flipped by anyone, it stays flipped!
        const isFlipped = prev.activeCard.isFlipped || incoming.activeCard.isFlipped;
        resolvedCard = {
          ...(isIncomingNewerOrEqual ? incoming.activeCard : prev.activeCard),
          isFlipped,
          flippedAt: prev.activeCard.flippedAt || incoming.activeCard.flippedAt,
        };
      } else if (incomingVersion > prevVersion) {
        // Incoming is strictly NEWER sequential action (new card placed, card cleared, or flipped)
        resolvedCard = incoming.activeCard;
      } else if (prevVersion > incomingVersion) {
        // Local state is strictly newer
        resolvedCard = prev.activeCard;
        shouldRebroadcastWinner = true;
      } else {
        // Exact same version! (True concurrent action race)
        if (!prev.activeCard && incoming.activeCard) {
          resolvedCard = incoming.activeCard;
        } else if (prev.activeCard && !incoming.activeCard) {
          resolvedCard = null;
        } else if (prev.activeCard && incoming.activeCard) {
          // If the previous card was already flipped (round finished) and incoming is an un-flipped new card:
          if (prev.activeCard.isFlipped && !incoming.activeCard.isFlipped) {
            resolvedCard = incoming.activeCard;
          } else if (!prev.activeCard.isFlipped && incoming.activeCard.isFlipped) {
            resolvedCard = incoming.activeCard;
          } else {
            // Both un-flipped different cards placed concurrently:
            // The earlier action (earliest putAt timestamp) strictly wins!
            const prevPutAt = prev.activeCard.putAt || 0;
            const incomingPutAt = incoming.activeCard.putAt || 0;

            if (incomingPutAt < prevPutAt) {
              resolvedCard = incoming.activeCard;
            } else if (prevPutAt < incomingPutAt) {
              resolvedCard = prev.activeCard;
              shouldRebroadcastWinner = true;
            } else {
              // Tie-break deterministically
              if (prev.activeCard.putByUserId <= incoming.activeCard.putByUserId) {
                resolvedCard = prev.activeCard;
                shouldRebroadcastWinner = true;
              } else {
                resolvedCard = incoming.activeCard;
              }
            }
          }
        } else {
          resolvedCard = null;
        }
      }

      // Guard: If card is the same instance and was already flipped locally, don't let un-flipped state revert it
      if (
        prev.activeCard &&
        resolvedCard &&
        prev.activeCard.cardId === resolvedCard.cardId &&
        prev.activeCard.putAt === resolvedCard.putAt &&
        prev.activeCard.isFlipped &&
        !resolvedCard.isFlipped
      ) {
        resolvedCard = {
          ...resolvedCard,
          isFlipped: true,
          flippedAt: prev.activeCard.flippedAt || Date.now(),
        };
      }

      const mergedVersion = Math.max(prevVersion, incomingVersion) + (shouldRebroadcastWinner ? 1 : 0);

      const mergedState: RoomState = {
        code: prev.code,
        createdAt: Math.min(prev.createdAt, incoming.createdAt),
        participants: mergedParticipants,
        activeCard: resolvedCard,
        historyCount: Math.max(prev.historyCount, incoming.historyCount),
        messages: mergedMessages,
        version: mergedVersion,
        lastUpdatedAt: Math.max(prev.lastUpdatedAt ?? 0, incoming.lastUpdatedAt ?? 0, Date.now()),
      };

      if (shouldRebroadcastWinner) {
        setTimeout(() => {
          if (mqttRelayRef.current) {
            mqttRelayRef.current.publishState(mergedState);
          }
        }, 50);
      }

      sessionStorage.setItem('last_room_code', mergedState.code);
      try {
        localStorage.setItem(`esho_room_${mergedState.code}`, JSON.stringify(mergedState));
      } catch {}
      return mergedState;
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
      (newStatus: ConnectionStatus) => {
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
            // Silently clean up stale room code without triggering error popup
            sessionStorage.removeItem('last_room_code');
          }
        );
      }
    });
  }, [roomState, applyIncomingState]);

  // Robust multi-channel fallback join: HTTP REST API -> LocalStorage -> MQTT Cloud Relay
  const attemptFallbackJoin = useCallback(
    async (code: string, customName?: string, customColor?: string) => {
      const cleanCode = code.trim().toUpperCase();
      if (!cleanCode) return;
      const activeName = customName || username || getStoredUsername() || 'শিক্ষার্থী';
      const activeColor = customColor || avatarColor || getStoredAvatarColor();

      // 1. Try REST API endpoint on the server (/api/rooms/:code)
      try {
        const res = await fetch(`/api/rooms/${cleanCode}`);
        if (res.ok) {
          const data = await res.json();
          if (data.exists && data.state) {
            // Register join on server
            fetch('/api/rooms/join', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                roomCode: cleanCode,
                username: activeName,
                avatarColor: activeColor,
                clientId,
              }),
            }).catch(() => {});

            applyIncomingState(data.state);
            sessionStorage.setItem('last_room_code', cleanCode);
            try {
              localStorage.setItem(`esho_room_${cleanCode}`, JSON.stringify(data.state));
            } catch {}
            broadcastLocal({ type: 'SYNC_STATE', code: cleanCode, state: data.state });
            mqttRelayRef.current?.subscribeToRoom(cleanCode).then(() => {
              mqttRelayRef.current?.publishState(data.state);
            });
            setConnectionStatus('connected');
            setErrorMessage(null);
            return;
          }
        }
      } catch {}

      // 2. Check LocalStorage for recent room state
      const saved = localStorage.getItem(`esho_room_${cleanCode}`);
      if (saved) {
        try {
          const parsed: RoomState = JSON.parse(saved);
          // Sync with server in background
          fetch('/api/rooms/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state: parsed }),
          }).catch(() => {});

          applyIncomingState(parsed);
          sessionStorage.setItem('last_room_code', cleanCode);
          setConnectionStatus('connected');
          setErrorMessage(null);
          return;
        } catch {}
      }

      // 3. Fallback to MQTT Cloud Relay (works across separate networks and serverless deploys)
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

          // Sync with server
          fetch('/api/rooms/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state: updatedState }),
          }).catch(() => {});

          applyIncomingState(updatedState);
          sessionStorage.setItem('last_room_code', cleanCode);
          try {
            localStorage.setItem(`esho_room_${cleanCode}`, JSON.stringify(updatedState));
          } catch {}
          broadcastLocal({ type: 'SYNC_STATE', code: cleanCode, state: updatedState });
          setIsFallbackMode(true);
          setConnectionStatus('connected');
          setErrorMessage(null);

          // Publish state update to peer MQTT clients
          mqttRelayRef.current?.publishState(updatedState);
        },
        () => {
          // All layers exhausted, clean URL param to avoid refresh loop
          if (typeof window !== 'undefined' && window.location.search.includes('room=')) {
            const url = new URL(window.location.href);
            url.searchParams.delete('room');
            window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
          }
          setConnectionStatus('connected');
          showError(`রুম কোড "${cleanCode}" পাওয়া যায়নি। দয়া করে কোডটি পুনরায় চেক করুন।`);
        }
      );
    },
    [clientId, username, avatarColor, applyIncomingState, broadcastLocal, showError]
  );

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    // On Vercel, server.ts does not run, so skip /ws immediately
    if (isVercel) {
      activateCloudRelay();
      return;
    }

    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setConnectionStatus('connecting');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    // Fast-fail timeout for WebSocket if local server does not answer
    const connectionTimeout = window.setTimeout(() => {
      if (wsRef.current && wsRef.current.readyState !== WebSocket.OPEN) {
        try {
          wsRef.current.close();
        } catch {}
        activateCloudRelay();
      }
    }, 2000);

    try {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        window.clearTimeout(connectionTimeout);
        setConnectionStatus('connected');
        setIsFallbackMode(false);

        // Start ping heartbeat every 15 seconds (recommended balance)
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = window.setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'PING' }));
          }
        }, 15000);

        // If we were previously in a room, re-join seamlessly (background attempt)
        const lastRoom = sessionStorage.getItem('last_room_code');
        if (lastRoom) {
          joinIntentRef.current = { code: lastRoom, isExplicit: false };
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
            joinIntentRef.current = null;
            setRoomState(data.state);
            sessionStorage.setItem('last_room_code', data.code);
            try {
              localStorage.setItem(`esho_room_${data.code}`, JSON.stringify(data.state));
            } catch {}
            setErrorMessage(null);
            mqttRelayRef.current?.subscribeToRoom(data.code).then(() => {
              mqttRelayRef.current?.publishState(data.state);
            });
            return;
          }

          if (data.type === 'ROOM_STATE') {
            applyIncomingState(data.state);
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
            if (data.code === 'ROOM_NOT_FOUND') {
              const intent = joinIntentRef.current;
              joinIntentRef.current = null;
              sessionStorage.removeItem('last_room_code');

              // If this was an implicit background session restore, cleanly reset without scaring user
              if (!intent?.isExplicit) {
                setRoomState(null);
                return;
              }

              // Explicit join request: attempt REST and MQTT recovery before showing error
              if (intent.code) {
                attemptFallbackJoin(intent.code);
              }
              return;
            }
            showError(data.message || 'একটি ত্রুটি ঘটেছে');
            return;
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      socket.onclose = () => {
        window.clearTimeout(connectionTimeout);
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        activateCloudRelay();
      };

      socket.onerror = () => {
        window.clearTimeout(connectionTimeout);
        activateCloudRelay();
        try {
          socket.close();
        } catch {}
      };
    } catch {
      window.clearTimeout(connectionTimeout);
      activateCloudRelay();
    }
  }, [clientId, showError, activateCloudRelay, isVercel, applyIncomingState, attemptFallbackJoin]);

  useEffect(() => {
    connect();
    return () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Actions
  const createRoom = useCallback(
    async (customName?: string, customColor?: string) => {
      const activeName = customName || username || getStoredUsername() || 'শিক্ষার্থী';
      const activeColor = customColor || avatarColor || getStoredAvatarColor();

      // If connected via WebSocket, send create request
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
        // First try creating via REST API on server
        try {
          const res = await fetch('/api/rooms/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: activeName,
              avatarColor: activeColor,
              clientId,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.state) {
              setRoomState(data.state);
              sessionStorage.setItem('last_room_code', data.code);
              try {
                localStorage.setItem(`esho_room_${data.code}`, JSON.stringify(data.state));
              } catch {}
              broadcastLocal({ type: 'SYNC_STATE', code: data.code, state: data.state });
              setConnectionStatus('connected');
              mqttRelayRef.current?.subscribeToRoom(data.code).then(() => {
                mqttRelayRef.current?.publishState(data.state);
              });
              return;
            }
          }
        } catch {}

        // Cloud Relay / Static hosting room generation fallback
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
          version: 1,
          lastUpdatedAt: Date.now(),
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

      // Track explicit user join intent
      joinIntentRef.current = { code: cleanCode, isExplicit: true };
      setConnectionStatus('connecting');

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
        attemptFallbackJoin(cleanCode, activeName, activeColor);
      }
    },
    [username, avatarColor, clientId, isFallbackMode, showError, attemptFallbackJoin]
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

      const myName = username || getStoredUsername() || 'শিক্ষার্থী';
      const nextVersion = (roomState.version || 0) + 1;
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
        version: nextVersion,
        lastUpdatedAt: Date.now(),
        lastSenderId: clientId,
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

      // 1. Instant optimistic local update (0ms UI latency)
      setRoomState(updatedState);
      try {
        localStorage.setItem(`esho_room_${roomState.code}`, JSON.stringify(updatedState));
      } catch {}
      broadcastLocal({ type: 'SYNC_STATE', code: roomState.code, state: updatedState });

      // 2. High-speed MQTT dispatch to all peers (<150ms)
      mqttRelayRef.current?.publishState(updatedState);

      // 3. Keep WebSocket server synced if connected
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(
            JSON.stringify({
              type: 'PUT_CARD',
              cardId,
              mode,
              version: nextVersion,
            })
          );
        } catch {}
      }
    },
    [roomState, username, clientId, showError, broadcastLocal]
  );

  const refreshCard = useCallback(
    (cardId?: string, mode?: CardDirection) => {
      if (!roomState) return;

      // Select a card (different from current if possible)
      let chosenCardId = cardId;
      if (!chosenCardId) {
        const otherCards = vocabularyItems.filter((v) => v.id !== roomState.activeCard?.cardId);
        const pool = otherCards.length > 0 ? otherCards : vocabularyItems;
        const randomItem = pool[Math.floor(Math.random() * pool.length)];
        chosenCardId = randomItem.id;
      }

      const cardMode = mode || roomState.activeCard?.mode || 'photo';
      const myName = username || getStoredUsername() || 'শিক্ষার্থী';
      const nextVersion = (roomState.version || 0) + 1;

      const updatedState: RoomState = {
        ...roomState,
        activeCard: {
          cardId: chosenCardId,
          putByUserId: clientId,
          putByUsername: myName,
          putAt: Date.now(),
          isFlipped: false,
          mode: cardMode,
        },
        version: nextVersion,
        lastUpdatedAt: Date.now(),
        lastSenderId: clientId,
        messages: [
          ...roomState.messages,
          {
            id: `msg-${Date.now()}`,
            senderId: 'system',
            senderName: 'সিস্টেম',
            text: `${myName} নতুন কার্ড দিয়ে টেবিল রিফ্রেশ করেছেন`,
            type: 'system' as const,
            timestamp: Date.now(),
          },
        ].slice(-50),
      };

      // 1. Instant optimistic local update
      setRoomState(updatedState);
      try {
        localStorage.setItem(`esho_room_${roomState.code}`, JSON.stringify(updatedState));
      } catch {}
      broadcastLocal({ type: 'SYNC_STATE', code: roomState.code, state: updatedState });

      // 2. High-speed MQTT dispatch to all peers
      mqttRelayRef.current?.publishState(updatedState);

      // 3. Keep WebSocket server synced if connected
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(
            JSON.stringify({
              type: 'REFRESH_CARD',
              cardId: chosenCardId,
              mode: cardMode,
              version: nextVersion,
            })
          );
        } catch {}
      }
    },
    [roomState, username, clientId, broadcastLocal]
  );

  const flipCard = useCallback(() => {
    if (!roomState || !roomState.activeCard) return;

    // RULE: others cannot flip it except the user who put it!
    if (roomState.activeCard.putByUserId !== clientId) {
      showError(`শুধুমাত্র ${roomState.activeCard.putByUsername} যিনি কার্ডটি রেখেছেন তিনিই এটি উল্টাতে পারবেন!`);
      return;
    }

    const nextVersion = (roomState.version || 0) + 1;
    const updatedState: RoomState = {
      ...roomState,
      activeCard: {
        ...roomState.activeCard,
        isFlipped: true,
        flippedAt: Date.now(),
      },
      historyCount: roomState.historyCount + 1,
      version: nextVersion,
      lastUpdatedAt: Date.now(),
      lastSenderId: clientId,
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

    // 1. Instant optimistic local update (card starts 3D rotating immediately)
    setRoomState(updatedState);
    try {
      localStorage.setItem(`esho_room_${roomState.code}`, JSON.stringify(updatedState));
    } catch {}
    broadcastLocal({ type: 'SYNC_STATE', code: roomState.code, state: updatedState });

    // 2. High-speed MQTT dispatch to all peers (<150ms)
    mqttRelayRef.current?.publishState(updatedState);

    // 3. Keep WebSocket server synced if connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(
          JSON.stringify({
            type: 'FLIP_CARD',
            version: nextVersion,
          })
        );
      } catch {}
    }
  }, [roomState, clientId, showError, broadcastLocal]);

  const clearCard = useCallback(() => {
    if (!roomState || !roomState.activeCard) return;

    const nextVersion = (roomState.version || 0) + 1;
    const updatedState: RoomState = {
      ...roomState,
      activeCard: null,
      version: nextVersion,
      lastUpdatedAt: Date.now(),
      lastSenderId: clientId,
    };

    // 1. Instant optimistic local update
    setRoomState(updatedState);
    try {
      localStorage.setItem(`esho_room_${roomState.code}`, JSON.stringify(updatedState));
    } catch {}
    broadcastLocal({ type: 'SYNC_STATE', code: roomState.code, state: updatedState });

    // 2. High-speed MQTT dispatch to all peers (<150ms)
    mqttRelayRef.current?.publishState(updatedState);

    // 3. Keep WebSocket server synced if connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(
          JSON.stringify({
            type: 'CLEAR_CARD',
            version: nextVersion,
          })
        );
      } catch {}
    }
  }, [roomState, broadcastLocal, clientId]);

  const sendMessage = useCallback(
    (text: string, messageType: 'chat' | 'reaction' = 'chat') => {
      if (!roomState || !text.trim()) return;

      const myName = username || getStoredUsername() || 'শিক্ষার্থী';
      const nextVersion = (roomState.version || 0) + 1;
      const updatedState: RoomState = {
        ...roomState,
        version: nextVersion,
        lastUpdatedAt: Date.now(),
        lastSenderId: clientId,
        messages: [
          ...roomState.messages,
          {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            senderId: clientId,
            senderName: myName,
            text: text.trim(),
            type: messageType,
            timestamp: Date.now(),
          },
        ].slice(-50),
      };

      // 1. Instant optimistic local update
      setRoomState(updatedState);
      try {
        localStorage.setItem(`esho_room_${roomState.code}`, JSON.stringify(updatedState));
      } catch {}
      broadcastLocal({ type: 'SYNC_STATE', code: roomState.code, state: updatedState });

      // 2. High-speed MQTT dispatch to all peers (<150ms)
      mqttRelayRef.current?.publishState(updatedState);

      // 3. Keep WebSocket server synced if connected
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(
            JSON.stringify({
              type: 'SEND_MESSAGE',
              text: text.trim(),
              messageType,
              version: nextVersion,
            })
          );
        } catch {}
      }
    },
    [roomState, username, clientId, broadcastLocal]
  );

  const syncRoom = useCallback(async () => {
    if (!roomState) return;

    // 0. Query server REST endpoint for immediate authoritative snapshot
    try {
      const res = await fetch(`/api/rooms/${roomState.code}`);
      if (res.ok) {
        const data = await res.json();
        if (data.exists && data.state) {
          applyIncomingState(data.state);
        }
      }
    } catch {}

    // 1. Request latest snapshot from WebSocket server
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(
          JSON.stringify({
            type: 'SYNC_ROOM',
          })
        );
      } catch {}
    }

    // 2. Request latest retained snapshot from MQTT
    mqttRelayRef.current?.requestSync(roomState.code);

    // 3. Check BroadcastChannel for active peers
    if (bcRef.current) {
      bcRef.current.postMessage({
        type: 'REQUEST_STATE',
        roomCode: roomState.code,
      });
    }

    // 4. Check localStorage fallback
    try {
      const stored = localStorage.getItem(`esho_room_${roomState.code}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.code === roomState.code) {
          applyIncomingState(parsed);
        }
      }
    } catch {}
  }, [roomState, applyIncomingState]);

  const leaveRoom = useCallback(() => {
    if (!roomState) return;
    const currentCode = roomState.code;

    if (isFallbackMode) {
      const remainingParticipants = roomState.participants.filter((p) => p.id !== clientId);
      if (remainingParticipants.length > 0) {
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
    refreshCard,
    syncRoom,
    flipCard,
    clearCard,
    sendMessage,
    leaveRoom,
  };
}
