# DeepScout — Autonomous Research Engineered For Truth

<div align="center">

![DeepScout](public/deepscout-logo.jpg)

**Autonomous multi-agent research engine that searches the live web, synthesizes cross-domain evidence, and builds publication-grade intelligence reports with verifiable citations.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Live Demo](#) · [Features](#-features) · [Architecture](#-architecture) · [Quick Start](#-quick-start)

</div>

---

## ✨ Features

- **🤖 3-Agent Autonomous Pipeline** — Researcher → Summarizer → Report Writer work in sequence with zero human intervention
- **🔍 Live Web Search** — Tavily-powered real-time web extraction with 5+ verified sources per query
- **📊 Interactive Charts** — Auto-generated bar, line, area, and pie charts embedded directly in reports
- **🧠 Multi-Provider LLM** — NVIDIA NIM, Google Gemini, and AgentRouter (DeepSeek, Claude, GPT) with automatic failover
- **📄 PDF Export** — Publication-grade PDF reports with styled headers, source citations, and visual formatting
- **⚡ Real-Time Streaming** — SSE-based streaming with debounced 60fps rendering for buttery-smooth output
- **🎯 Tool Call Visualization** — Live agent pipeline showing each tool invocation (search, extract, synthesize, write)
- **📱 Responsive Design** — Full mobile + desktop experience with collapsible sidebar and adaptive layouts
- **🔐 Secure Key Management** — Rotating API key pool with automatic failover and rate limit handling

---

## 🏗️ Architecture

```
User Query
    │
    ▼
┌─────────────────────────────────────────────┐
│            /api/research (SSE Stream)        │
│                                             │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐│
│  │ Agent 1  │──▶│ Agent 2  │──▶│ Agent 3  ││
│  │Researcher│   │Summarizer│   │Report    ││
│  │          │   │          │   │Writer    ││
│  └────┬─────┘   └────┬─────┘   └────┬─────┘│
│       │              │              │       │
│  Tavily Web     Cross-Source    Streaming   │
│  Search API     JSON Synthesis  Markdown    │
│  (5 sources)    + Trends        + Charts    │
└─────────────────────────────────────────────┘
    │
    ▼
Interactive Report with Citations [1], [2]...
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3.4 |
| **LLM Providers** | NVIDIA NIM, Google Gemini, AgentRouter |
| **Web Search** | Tavily Search API |
| **Charts** | Recharts |
| **PDF Export** | jsPDF + html2canvas |
| **Streaming** | Server-Sent Events (SSE) |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- API keys for at least one LLM provider

### 1. Clone the repository

```bash
git clone https://github.com/Gowrav-M/deepscout.git
cd deepscout
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```env
# Required: At least one LLM provider
NVIDIA_API_KEY_1=your_nvidia_api_key
GEMINI_API_KEY=your_gemini_api_key

# Optional: AgentRouter for multi-model access
AGENTROUTER_API_KEY=your_agentrouter_key
AGENTROUTER_BASE_URL=https://agentrouter.org/v1

# Required: Web search
TAVILY_API_KEY=your_tavily_api_key
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start researching!

---

## 🧪 How It Works

1. **Enter any topic** — "Impact of 5G on global telecommunications", "Latest advances in quantum computing", etc.
2. **Watch the agents work** — Real-time pipeline visualization shows each agent's progress
3. **Get your report** — Full executive report with sections, charts, and numbered citations
4. **Export** — Download as PDF or Markdown

### Agent Pipeline

| Agent | Role | Output |
|-------|------|--------|
| 🔍 **Researcher** | Searches live web via Tavily API | 5+ verified sources with extracted content |
| 🧠 **Summarizer** | Cross-references sources, extracts key findings | Structured JSON: findings, trends, challenges |
| ✍️ **Report Writer** | Generates publication-grade markdown report | Sections, charts, inline citations [1], [2] |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/research/     # SSE streaming API endpoint
│   ├── api/chat/         # Follow-up chat endpoint
│   ├── layout.tsx        # Root layout with metadata
│   └── page.tsx          # Entry point
├── components/
│   ├── chat/             # Chat UI (ResearchChatView, ChatSidebar, ChartRenderer)
│   ├── landing/          # Landing page (Hero, AgentVisualizer, BentoGrid, FAQ)
│   ├── ui/               # Shared UI components (prompt box, tool calls)
│   └── Header.tsx        # Navigation header
├── lib/
│   ├── agents/           # Agent implementations (researcher, summarizer, report-writer)
│   ├── llm/              # LLM providers (nvidia, agentrouter, key management)
│   ├── workflow/          # Orchestrator (agent pipeline coordination)
│   └── utils.ts          # Shared utilities
└── types/                # TypeScript type definitions
```

---

## 🔑 API Keys Setup

| Provider | Get Key | Models Available |
|----------|---------|-----------------|
| **NVIDIA NIM** | [build.nvidia.com](https://build.nvidia.com) | Llama 3.2, DeepSeek R1, Mistral |
| **Google Gemini** | [aistudio.google.com](https://aistudio.google.com) | Gemini 2.0 Flash |
| **AgentRouter** | [agentrouter.org](https://agentrouter.org) | Claude, GPT-4, DeepSeek (unified API) |
| **Tavily** | [tavily.com](https://tavily.com) | Web Search API |

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**DeepScout** — Autonomous Research Engineered For Truth

Made with 🧠 by Manojgowda12

</div>
