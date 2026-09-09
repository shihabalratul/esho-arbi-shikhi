# Repository Mapping & Developer Guidelines

## Overview
**Esho Arabi Shikhi (এসো আরবী শিখি)** is an interactive Arabic-Bangla vocabulary learning and collaborative flashcard app based on the textbook "এসো আরবী শিখি" (Esho Arabi Shikhi).

## Core Architecture & Hosting Strategy
- **Deployment Platform**: Vercel (Single-repository static SPA deployment) or Cloud Run / Docker.
- **Frontend Stack**: React 19 + TypeScript + Vite + Tailwind CSS + Lucide React.
- **Real-Time Collaboration**:
  - In local development / container environments: Node/Express + WebSocket server (`/server.ts`).
  - In serverless / static hosting (e.g. Vercel): Client-to-client cloud relay via secure MQTT over WebSockets (`src/services/mqttRelay.ts`).
  - Automatic environment detection activates Cloud Relay instantly when deployed to Vercel without hanging on non-existent `/ws`.
  - Retained messages allow new participants to immediately join rooms across mobile networks and browsers.

---

## Directory & File Map

```
/
├── AGENTS.md                  # This developer & architecture guide
├── index.html                 # Main entry HTML
├── metadata.json              # Applet metadata
├── package.json               # Dependencies & scripts
├── server.ts                  # Local Express/WebSocket server (for dev & node hosting)
├── tsconfig.json              # TypeScript configuration
├── vercel.json                # Vercel SPA routing rewrite configuration
├── vite.config.ts             # Vite build & plugin configuration
└── src/
    ├── main.tsx               # Application bootstrap
    ├── App.tsx                # Primary view switcher (Flashcards, Photo Cards, Quiz, Vocabulary, Room)
    ├── types.ts               # Core TypeScript interfaces & types (VocabularyItem, RoomState, RoomParticipant, etc.)
    ├── index.css              # Tailwind CSS imports & animations
    ├── data/
    │   ├── chapters.ts        # Lesson and chapter index definitions
    │   └── vocabulary.ts      # Structured vocabulary item database (Arabic, Bangla, transliteration, sentences, illustrations)
    ├── components/
    │   ├── CardSelectorModal.tsx   # Modal for selecting a specific card to put on the room table
    │   ├── CollaborativeRoom.tsx   # Live multiplayer collaborative room UI (lobby, table, flip card, chat)
    │   ├── Flashcard.tsx           # Single-player flashcard mode
    │   ├── PhotoCardGrid.tsx       # Visual photo flashcard grid
    │   ├── Quiz.tsx                # Practice quizzes
    │   ├── UsernameModal.tsx       # Quick name & avatar color picker (no login required)
    │   ├── VocabularyTable.tsx     # Full vocabulary list & search table
    │   └── illustrations.tsx       # Vector illustrations for vocabulary items
    ├── hooks/
    │   └── useRoomSocket.ts        # Unified collaborative room state management hook (handles WebSockets + MQTT fallback)
    ├── services/
    │   ├── mqttRelay.ts            # Paho MQTT broker connection & retained message room state synchronization
    │   └── username.ts             # Local storage helpers for user identity & avatar color
    └── utils/
        └── audio.ts                # Arabic & Bangla speech synthesis (Web Speech API)
```

---

## Key Feature Logic & Rules

### 1. Collaborative Practice Room Rules & Workflow
1. **Putting Cards**: Anyone can put a card on the table if the table is empty or the previous card has been flipped.
2. **Card Ownership & Flip Locking**: Only the participant who put the card can flip it (`putByUserId === clientId`). Other participants see the card locked with the owner's name to foster active turn-taking and verbal quizzing.
3. **Open Round Completion**: Once flipped, the correct answer and example sentences are revealed to everyone. Anyone in the room can then place the next card, pick a random card, or clear the table.
4. **Earlier Action Conflict Resolution**: If two participants perform an action concurrently (such as putting different cards simultaneously), the earlier action (earliest `putAt` timestamp) strictly wins the conflict, and that winning state is automatically synchronized to everyone's side.
5. **Room Codes & Direct Links**: Rooms are identified by a 6-character code (e.g. `AR8K29`) and shareable link (`?room=AR8K29`). Opening a share link automatically opens the username prompt if not set and joins the session.

### 2. Multi-Device Synchronization & Zero-Latency State Engine
- **Sequence Versioning (`version`)**: Every room state mutation (card placement, flip, message, clear) increments a monotonic `version` number. Incoming packets with older versions are automatically rejected to prevent out-of-order rollbacks.
- **Manual State Sync (`syncRoom`)**: A dedicated **"সিঙ্ক"** button in the room header forces an immediate re-subscription to the broker's retained snapshot and requests an updated state from the server.
- **Flip Protection Guard**: An already flipped card on a client will never be flipped back to un-flipped by a delayed packet.
- **Echo Suppression**: Self-published MQTT messages are identified via `_senderId` and ignored to prevent overwriting optimistic local state.
- **Message Union Merging**: Chat and reaction messages are merged by unique IDs across both clients so no messages are lost.
- **Single Retained MQTT Publish**: Eliminates duplicate packets and broker congestion by sending a single retained message (`qos: 0, retained: true`) on topic `esho_arabi_v3/room_{CODE}`.
- **2-Second Keepalive Ping**: A high-frequency background heartbeat ping runs every 2 seconds across WebSockets and MQTT to keep real-time sockets warm and responsive against mobile cellular idle timeouts.

### 3. Textbook Vocabulary Data Integrity
- All vocabulary items, transliterations, Bangla translations, example phrases, and categories are strictly derived from the authentic "এসো আরবী শিখি" textbook curriculum.
- No dummy or mock placeholder datasets exist; all items are fully searchable, audibly playable via Web Speech API, and usable in solo and multiplayer study modes.
