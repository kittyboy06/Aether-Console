# Aether Console 🌌

Aether Console is the premium, high-fidelity reference client for the Aether Chat cognitive ecosystem. Built with a stunning dark glassmorphic design system, it provides a seamless developer-centric environment to interact with Aether's underlying reasoning pipeline, diagnose cognitive events, and manage knowledge graph memories.

---

## ✨ Features

### 🎨 Premium Glassmorphic UI/UX
* **High-Fidelity Aesthetics**: Deep, rich dark backgrounds, sleek border gradients, blurred backdrops, and glowing micro-animations.
* **Responsive Sidebar Layout**: Dynamic navigation pane with chat history grouped intelligently by time (Today, Yesterday, Last Week) and diagnostic panel links.

### 🧠 Collapsible Reasoning Drawer
* **Inline Pipeline Insights**: Peek into Aether's mind. Each message bubble features an expandable drawer showing details of the multi-stage cognitive process.
* **Performance Metrics**: View provider parameters, latency, token count, cost calculation, and specific tool calls made during inference.

### 🛠️ Interactive Developer Toolbar
* **Environment Switcher**: Dynamically toggle between `Mock`, `Local`, and `Live` API connections.
* **Model Router**: Select active intelligence engines (e.g. `Gemini`, `Claude`, `OpenRouter`, `Local Deno`).
* **Instant Diagnostic Actions**: Re-index the Memory Cache, reload the Knowledge Graph, or reset the conversation thread with one-click actions.

### 📊 Comprehensive Diagnostics Panels
* **Health & Latency Dashboard**: Real-time ping rates, environment validation, database status, and memory node count indicators.
* **Knowledge Graph Visualizer**: A visual view mapping Aether's active memory nodes and conceptual connections.
* **Event Logs Console**: Stream backend Deno log outputs and pipeline stages directly into the client.

### 🔄 Offline-First Persistence Queue
* **Supabase Primary Sync**: Real-time read/write syncing with Supabase Database and Edge Functions versioned under `/api/v1/`.
* **Reliable Offline Fallback**: Failsafe messaging pipeline. If connection drops, messages are queued locally in `localStorage` and synchronized automatically when online status is restored.

---

## 🛠️ Tech Stack

* **Frontend Framework**: React + Vite + TypeScript
* **Styling**: Tailwind CSS v4 & custom CSS glassmorphism
* **Routing**: React Router DOM (v6+)
* **Backend Platform**: Supabase Edge Functions & Deno Orchestration

---

## 📂 Project Architecture

```
aether-console/
├── src/
│   ├── api/               # API clients (chat, graph, health, conversations)
│   ├── components/        # UI components (ChatWindow, Sidebar, DevToolbar, etc.)
│   ├── layouts/           # Main Layout wrapping the sidebar and header
│   ├── pages/             # Dynamic views (Chat, GraphView, LogsView, Settings)
│   ├── hooks/             # Custom hooks (useChat, useSync for offline queueing)
│   ├── types/             # Common TypeScript interfaces
│   ├── index.css          # Tailwind CSS configuration and dark theme styling
│   ├── App.tsx            # Routes configuration
│   └── main.tsx           # Application entry point
├── public/                # Static assets
├── vite.config.ts         # Vite configuration
└── tsconfig.json          # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and npm installed.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/kittyboy06/Aether-Console.git
   cd Aether-Console
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment:
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:8091
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## 🔒 Verification & API Integration
The client is fully integrated with versioned REST endpoints (`/api/v1/`) on the Deno-based backend:
* `POST /api/v1/chat` — Submits messages and parses structured cognitive/reasoning payloads.
* `GET /api/v1/conversations` — Retrieves complete list of past sessions.
* `PUT /api/v1/conversations/:id` — Renames metadata titles.
* `DELETE /api/v1/conversations/:id` — Clears db records and events associated with the session.
