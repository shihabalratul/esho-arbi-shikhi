import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

interface RoomParticipant {
  id: string;
  username: string;
  avatarColor: string;
  isHost: boolean;
  joinedAt: number;
}

interface PlacedCard {
  cardId: string;
  putByUserId: string;
  putByUsername: string;
  putAt: number;
  isFlipped: boolean;
  flippedAt?: number;
  mode: 'photo' | 'bn_to_ar' | 'ar_to_bn';
  revealedSentenceIndices?: number[];
}

interface RoomMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  type: 'chat' | 'reaction' | 'system';
  timestamp: number;
}

interface Room {
  code: string;
  createdAt: number;
  lastActivity: number;
  version: number;
  participants: Map<string, { ws: WebSocket; info: RoomParticipant }>;
  activeCard: PlacedCard | null;
  historyCount: number;
  messages: RoomMessage[];
}

const rooms = new Map<string, Room>();

// Helper to generate unique room code (e.g. 6 digits)
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  if (rooms.has(code)) {
    return generateRoomCode();
  }
  return code;
}

// Clean up stale empty rooms periodically
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (room.participants.size === 0 && now - room.lastActivity > 1000 * 60 * 30) {
      rooms.delete(code);
    }
  }
}, 1000 * 60 * 5);

function getRoomStateDTO(room: Room) {
  const participants: RoomParticipant[] = Array.from(room.participants.values()).map(
    (p) => p.info
  );
  return {
    code: room.code,
    createdAt: room.createdAt,
    participants,
    activeCard: room.activeCard,
    historyCount: room.historyCount,
    messages: room.messages.slice(-50), // keep latest 50 messages
    version: room.version || 1,
    lastUpdatedAt: room.lastActivity || Date.now(),
  };
}

function broadcastToRoom(room: Room, messageObj: any) {
  const data = JSON.stringify(messageObj);
  for (const { ws } of room.participants.values()) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  }
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  app.use(express.json());

  // API endpoints
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', roomsActive: rooms.size });
  });

  app.get('/api/rooms/check/:code', (req, res) => {
    const code = req.params.code?.toUpperCase().trim();
    const room = rooms.get(code);
    if (!room) {
      return res.status(404).json({ exists: false, error: 'রুম পাওয়া যায়নি' });
    }
    return res.json({
      exists: true,
      code: room.code,
      participantCount: room.participants.size,
      hasActiveCard: !!room.activeCard,
    });
  });

  // WebSocket Server setup on /ws
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    let currentRoomCode: string | null = null;
    let currentClientId: string | null = null;

    const leaveCurrentRoom = () => {
      if (!currentRoomCode || !currentClientId) return;
      const room = rooms.get(currentRoomCode);
      if (room) {
        const participant = room.participants.get(currentClientId);
        room.participants.delete(currentClientId);
        room.lastActivity = Date.now();

        if (participant) {
          const systemMsg: RoomMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            senderId: 'system',
            senderName: 'সিস্টেম',
            text: `${participant.info.username} রুম থেকে প্রস্থান করেছেন`,
            type: 'system',
            timestamp: Date.now(),
          };
          room.messages.push(systemMsg);
        }

        // If host left and there are other participants, assign host to first remaining participant
        if (room.participants.size > 0) {
          const remaining = Array.from(room.participants.values());
          if (!remaining.some((p) => p.info.isHost)) {
            remaining[0].info.isHost = true;
          }
          broadcastToRoom(room, {
            type: 'ROOM_STATE',
            state: getRoomStateDTO(room),
          });
        } else {
          // Room empty, mark lastActivity
          room.lastActivity = Date.now();
        }
      }
      currentRoomCode = null;
      currentClientId = null;
    };

    ws.on('message', (rawData: string) => {
      try {
        const msg = JSON.parse(rawData.toString());
        const { type } = msg;

        if (type === 'PING') {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'PONG' }));
          }
          return;
        }

        if (type === 'CREATE_ROOM') {
          leaveCurrentRoom();
          const { username, avatarColor, clientId } = msg;
          const code = generateRoomCode();
          const newRoom: Room = {
            code,
            createdAt: Date.now(),
            lastActivity: Date.now(),
            version: 1,
            participants: new Map(),
            activeCard: null,
            historyCount: 0,
            messages: [
              {
                id: `msg-${Date.now()}`,
                senderId: 'system',
                senderName: 'সিস্টেম',
                text: `রুম তৈরি হয়েছে (কোড: ${code})। ${username || 'ব্যবহারকারী'} যোগ দিয়েছেন।`,
                type: 'system',
                timestamp: Date.now(),
              },
            ],
          };

          const participantInfo: RoomParticipant = {
            id: clientId || `client-${Date.now()}`,
            username: username?.trim() || 'শিক্ষার্থী',
            avatarColor: avatarColor || '#059669',
            isHost: true,
            joinedAt: Date.now(),
          };

          newRoom.participants.set(participantInfo.id, { ws, info: participantInfo });
          rooms.set(code, newRoom);

          currentRoomCode = code;
          currentClientId = participantInfo.id;

          ws.send(
            JSON.stringify({
              type: 'ROOM_CREATED',
              code,
              clientId: participantInfo.id,
              state: getRoomStateDTO(newRoom),
            })
          );
          return;
        }

        if (type === 'JOIN_ROOM') {
          leaveCurrentRoom();
          const { roomCode, username, avatarColor, clientId } = msg;
          const cleanCode = (roomCode || '').toUpperCase().trim();
          const room = rooms.get(cleanCode);

          if (!room) {
            ws.send(
              JSON.stringify({
                type: 'ERROR',
                code: 'ROOM_NOT_FOUND',
                message: `রুম কোড "${cleanCode}" পাওয়া যায়নি। দয়া করে কোডটি পুনরায় চেক করুন।`,
              })
            );
            return;
          }

          const participantInfo: RoomParticipant = {
            id: clientId || `client-${Date.now()}`,
            username: username?.trim() || 'শিক্ষার্থী',
            avatarColor: avatarColor || '#2563eb',
            isHost: room.participants.size === 0,
            joinedAt: Date.now(),
          };

          room.participants.set(participantInfo.id, { ws, info: participantInfo });
          room.lastActivity = Date.now();

          const joinMsg: RoomMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            senderId: 'system',
            senderName: 'সিস্টেম',
            text: `${participantInfo.username} রুমে প্রবেশ করেছেন`,
            type: 'system',
            timestamp: Date.now(),
          };
          room.messages.push(joinMsg);

          currentRoomCode = cleanCode;
          currentClientId = participantInfo.id;

          // Notify joined client
          ws.send(
            JSON.stringify({
              type: 'ROOM_JOINED',
              code: cleanCode,
              clientId: participantInfo.id,
              state: getRoomStateDTO(room),
            })
          );

          // Broadcast to everyone else in the room
          broadcastToRoom(room, {
            type: 'ROOM_STATE',
            state: getRoomStateDTO(room),
          });
          return;
        }

        // Room-specific operations
        if (!currentRoomCode || !currentClientId) {
          return;
        }

        const room = rooms.get(currentRoomCode);
        if (!room) {
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              message: 'রুমটি আর বিদ্যমান নেই।',
            })
          );
          return;
        }

        const participant = room.participants.get(currentClientId);
        if (!participant) return;

        room.lastActivity = Date.now();

        // 0. SYNC ROOM
        if (type === 'SYNC_ROOM' || type === 'GET_ROOM_STATE') {
          ws.send(
            JSON.stringify({
              type: 'ROOM_STATE',
              state: getRoomStateDTO(room),
            })
          );
          return;
        }

        // 1. PUT CARD
        // RULE: Any person can put a card. BUT when one flip card is put,
        // until it is flipped by the user who put it, NO ONE can put any other card at the same time,
        // unless forceRefresh is explicitly requested.
        if (type === 'PUT_CARD') {
          if (room.activeCard && !room.activeCard.isFlipped && !msg.forceRefresh) {
            ws.send(
              JSON.stringify({
                type: 'ERROR',
                code: 'CARD_LOCKED',
                message: `বর্তমান কার্ডটি এখনো উল্টানো হয়নি! ${room.activeCard.putByUsername} এটি উল্টানোর পর পরবর্তী কার্ড রাখা যাবে।`,
              })
            );
            return;
          }

          const { cardId, mode } = msg;
          if (!cardId) return;

          room.version = Math.max((room.version || 0) + 1, Number(msg.version) || 0);
          room.activeCard = {
            cardId,
            putByUserId: participant.info.id,
            putByUsername: participant.info.username,
            putAt: Date.now(),
            isFlipped: false,
            mode: mode || 'photo',
            revealedSentenceIndices: [],
          };

          const sysMsg: RoomMessage = {
            id: `msg-${Date.now()}`,
            senderId: 'system',
            senderName: 'সিস্টেম',
            text: `${participant.info.username} একটি নতুন কার্ড রেখেছেন। আপনারা উত্তর চিন্তা করুন!`,
            type: 'system',
            timestamp: Date.now(),
          };
          room.messages.push(sysMsg);

          broadcastToRoom(room, {
            type: 'ROOM_STATE',
            state: getRoomStateDTO(room),
          });
          return;
        }

        // 2. REFRESH CARD (Explicitly replace card on the table with a new one)
        if (type === 'REFRESH_CARD') {
          const { cardId, mode } = msg;
          if (!cardId) return;

          room.version = Math.max((room.version || 0) + 1, Number(msg.version) || 0);
          room.activeCard = {
            cardId,
            putByUserId: participant.info.id,
            putByUsername: participant.info.username,
            putAt: Date.now(),
            isFlipped: false,
            mode: mode || 'photo',
            revealedSentenceIndices: [],
          };

          const sysMsg: RoomMessage = {
            id: `msg-${Date.now()}`,
            senderId: 'system',
            senderName: 'সিস্টেম',
            text: `${participant.info.username} টেবিলের কার্ডটি রিফ্রেশ করে নতুন কার্ড এনেছেন!`,
            type: 'system',
            timestamp: Date.now(),
          };
          room.messages.push(sysMsg);

          broadcastToRoom(room, {
            type: 'ROOM_STATE',
            state: getRoomStateDTO(room),
          });
          return;
        }

        // 2.5 REVEAL PASSAGE SENTENCE (Toggle sentence translation for passage card by owner)
        if (type === 'REVEAL_PASSAGE_SENTENCE') {
          if (!room.activeCard) {
            return;
          }

          if (room.activeCard.putByUserId !== participant.info.id) {
            ws.send(
              JSON.stringify({
                type: 'ERROR',
                code: 'NOT_AUTHORIZED_TO_REVEAL',
                message: `শুধুমাত্র ${room.activeCard.putByUsername} যিনি কার্ডটি রেখেছেন তিনিই বাক্যের অর্থ উন্মোচন করতে পারবেন!`,
              })
            );
            return;
          }

          const index = Number(msg.index);
          if (isNaN(index) || index < 0) return;

          const currentIndices = new Set(room.activeCard.revealedSentenceIndices || []);
          if (currentIndices.has(index)) {
            currentIndices.delete(index);
          } else {
            currentIndices.add(index);
          }
          room.activeCard.revealedSentenceIndices = Array.from(currentIndices).sort((a, b) => a - b);
          room.version = Math.max((room.version || 0) + 1, Number(msg.version) || 0);

          broadcastToRoom(room, {
            type: 'ROOM_STATE',
            state: getRoomStateDTO(room),
          });
          return;
        }

        // 3. FLIP CARD
        // RULE: Others CANNOT flip it except the user who put it!
        if (type === 'FLIP_CARD') {
          if (!room.activeCard) {
            return;
          }

          if (room.activeCard.putByUserId !== participant.info.id) {
            ws.send(
              JSON.stringify({
                type: 'ERROR',
                code: 'NOT_AUTHORIZED_TO_FLIP',
                message: `শুধুমাত্র ${room.activeCard.putByUsername} যিনি কার্ডটি রেখেছেন তিনিই এটি উল্টাতে পারবেন!`,
              })
            );
            return;
          }

          if (!room.activeCard.isFlipped) {
            room.version = Math.max((room.version || 0) + 1, Number(msg.version) || 0);
            room.activeCard.isFlipped = true;
            room.activeCard.flippedAt = Date.now();
            room.historyCount += 1;

            const sysMsg: RoomMessage = {
              id: `msg-${Date.now()}`,
              senderId: 'system',
              senderName: 'সিস্টেম',
              text: `${participant.info.username} কার্ডটি উল্টে দিয়েছেন এবং উত্তর প্রকাশ করেছেন!`,
              type: 'system',
              timestamp: Date.now(),
            };
            room.messages.push(sysMsg);

            broadcastToRoom(room, {
              type: 'ROOM_STATE',
              state: getRoomStateDTO(room),
            });
          }
          return;
        }

        // 4. CLEAR CARD
        // If flipped, any participant or the host can clear it to prepare table
        if (type === 'CLEAR_CARD') {
          if (room.activeCard) {
            if (!room.activeCard.isFlipped && room.activeCard.putByUserId !== participant.info.id && !participant.info.isHost && !msg.forceRefresh) {
              ws.send(
                JSON.stringify({
                  type: 'ERROR',
                  message: 'কার্ডটি উল্টানোর পূর্বে শুধুমাত্র প্রদানকারী বা হোস্ট এটি সরাতে পারবেন।',
                })
              );
              return;
            }

            room.version = Math.max((room.version || 0) + 1, Number(msg.version) || 0);
            room.activeCard = null;
            broadcastToRoom(room, {
              type: 'ROOM_STATE',
              state: getRoomStateDTO(room),
            });
          }
          return;
        }

        // 5. SEND MESSAGE / REACTION
        if (type === 'SEND_MESSAGE') {
          const { text, messageType } = msg;
          if (!text || typeof text !== 'string') return;

          const chatMsg: RoomMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            senderId: participant.info.id,
            senderName: participant.info.username,
            text: text.slice(0, 200),
            type: messageType === 'reaction' ? 'reaction' : 'chat',
            timestamp: Date.now(),
          };

          room.messages.push(chatMsg);
          broadcastToRoom(room, {
            type: 'NEW_MESSAGE',
            message: chatMsg,
          });
          return;
        }

        // 5. LEAVE ROOM
        if (type === 'LEAVE_ROOM') {
          leaveCurrentRoom();
          ws.send(
            JSON.stringify({
              type: 'ROOM_LEFT',
            })
          );
          return;
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    });

    ws.on('close', () => {
      leaveCurrentRoom();
    });

    ws.on('error', (err) => {
      console.error('WebSocket connection error:', err);
      leaveCurrentRoom();
    });
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Arabic Bangla Flashcards server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
