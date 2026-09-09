# এসো আরবী শিখি — Arabic Bangla Flashcards

An interactive Arabic-Bangla vocabulary learning platform and collaborative multiplayer study application based on the authentic textbook **"এসো আরবী শিখি"** (Esho Arabi Shikhi).

Designed for students, teachers, and self-learners, the app combines visual flashcards, interactive quizzes, textbook chapter navigation, audio pronunciations, and real-time synchronized study rooms.

---

## 🌟 Key Features

### 1. 📇 Interactive Flip Flashcards
- Authentic Arabic vocabulary with full vowel marks (Harakat / Tashkeel) paired with Bengali meanings and phonetic transliteration.
- Example sentences and contextual phrases demonstrating practical grammatical usage.
- Audio pronunciation buttons for both Arabic and Bengali via the Web Speech API.
- Lesson-based filtering matching the chapters of the *Esho Arabi Shikhi* textbook.

### 2. 🖼️ Visual Photo Cards
- Categorized cards featuring bespoke vector illustrations for objects, animals, classroom tools, household items, and descriptive adjectives.
- Visual association designed to accelerate memory retention and rapid vocabulary recall.

### 3. 📝 Interactive Practice Quiz
- Multiple-choice quiz generator adapting to selected chapters.
- Instant feedback with explanation notes and score summaries to assess learning progress.

### 4. 📚 Comprehensive Vocabulary Directory
- Complete searchable dictionary of all textbook vocabulary items.
- Filter by category, lesson, or search directly by Arabic word, Bengali translation, or phonetic spelling.

### 5. 👥 Real-Time Collaborative Practice Room
- **Multiplayer Study Table**: Practice with classmates or teachers over the internet in private rooms identified by 6-character room codes (e.g. `AR8K29`) or direct share links.
- **Turn-Taking & Flip Locking**: Any participant can place a card on the virtual table. The card's answer remains concealed and can only be flipped by the player who placed it, encouraging verbal guessing and interactive quizzing.
- **Live Chat & Emoji Reactions**: Quick encouragement stickers and real-time message exchange during study sessions.
- **No Sign-In Required**: Join instantly with an avatar color and display name stored locally.

---

## ⚡ Real-Time Architecture & State Synchronization

The application features a hybrid real-time synchronization engine designed to function across both container servers and serverless static hosting environments:

- **Primary WebSocket Layer (Node/Express)**: Used in container environments (such as Docker and Google Cloud Run) for direct bidirectional communication with sub-50ms latency.
- **Serverless Cloud Relay (MQTT over WebSockets)**: Automatically engages when deployed on serverless or static hosts (like Vercel or GitHub Pages). Uses secure public MQTT brokers with retained topic messages (`esho_arabi_v3/room_{CODE}`) so new participants receive the latest table state immediately.
- **Monotonic Version Sequencing**: Every card action, flip, or clear increments a monotonic version number to prevent out-of-order state overwrites.
- **Tie-Break Conflict Resolution**: If two participants place different cards concurrently, the action with the earlier timestamp automatically wins and synchronizes to all connected devices.
- **Balanced 15-Second Keepalive**: Background heartbeat pings maintain open socket connections without draining mobile device batteries or exceeding broker rate limits.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)
- **Backend & WebSockets**: Node.js, [Express](https://expressjs.com/), `ws`
- **Cloud Relay**: [Eclipse Paho JavaScript Client](https://eclipse.dev/paho/clients/js/) (MQTT over WSS)
- **Audio Engine**: Web Speech Synthesis API

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd arabic-bangla-flashcards

# Install dependencies
npm install
```

### Running Locally

```bash
# Start the full-stack development server (Express + Vite)
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### Building for Production

```bash
# Build the client and compile the server bundle
npm run build

# Start the production server
npm start
```

---

## 📦 Deployment Options

1. **Docker / Cloud Run (Full-Stack)**:
   Runs the compiled Express + WebSocket server (`server.ts` bundled to `dist/server.cjs`) on port `3000`.
2. **Vercel / Netlify / GitHub Pages (Static SPA)**:
   Outputs the static client to `dist/`. The client automatically detects the serverless environment and seamlessly routes collaborative rooms through the secure MQTT Cloud Relay.

---

## 📖 Curriculum Attribution

The vocabulary, translations, and pedagogical structure in this project are based on the classical Islamic curriculum textbook **"এসো আরবী শিখি"** (Esho Arabi Shikhi) by **Hazrat Maulana Abu Taher Misbah**.
