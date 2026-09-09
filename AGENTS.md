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

### 1. Collaborative Practice Room Rules
1. **Anyone can put a card on the table** if the table is empty or the previous card has been flipped.
2. **Only the participant who put the card can flip it**. Others see it locked with the owner's name.
3. Once flipped, **anyone in the room** can place the next card or clear the table.
4. Rooms are identified by a 6-character code (e.g. `AR8K29`) and shareable link (`?room=AR8K29`).
5. When a user opens a link without having a username configured, the username modal opens and automatically connects them to the room once saved.

### 2. Multi-Device Synchronization (Vercel Friendly)
- `MqttRoomRelay` publishes retained state messages to MQTT topics `esho_arabi_v3/room_{CODE}` on HiveMQ Public WSS broker.
- Both mobile and desktop devices subscribe to the topic to sync room state, active cards, flips, and chat.
- Mobile heartbeat keepalive ensures mobile cellular carriers do not terminate idle connections.
