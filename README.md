# Research Agent

An AI-powered research agent that breaks down complex questions, searches the web, and synthesizes comprehensive cited answers — with every reasoning step streamed to the UI in real time.

## What it does

1. **Plan** — LLM decomposes your question into targeted sub-queries
2. **Search** — Tavily fetches top results for each sub-query in parallel
3. **Synthesize** — LLM writes a structured, cited answer (streamed token-by-token)
4. **Reflect** — Agent evaluates completeness and loops back if needed

## Architecture

```
User Question
      │
      ▼
┌─────────────────────────────────────────────────────┐
│                     LangGraph                       │
│                                                     │
│  ┌──────┐   ┌────────┐   ┌───────────┐   ┌───────┐ │
│  │ Plan │──▶│ Search │──▶│ Synthesize│──▶│Reflect│ │
│  └──────┘   └────────┘   └───────────┘   └───┬───┘ │
│                 ▲                             │     │
│                 └──────── (if incomplete) ────┘     │
└─────────────────────────────────────────────────────┘
          │
          │  SSE stream (real-time)
          ▼
    React Frontend
    ├── Thought steps panel (live agent reasoning)
    ├── Streaming answer (token-by-token)
    └── Source cards (with favicons + citations)
```

## Tech Stack

| Layer | Technology |
|---|---|
| Orchestration | LangGraph |
| LLM | Groq (`llama-3.3-70b-versatile`) |
| Search | Tavily API |
| Backend | FastAPI + SSE streaming |
| Frontend | React + Vite + Tailwind CSS |

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- [Groq API key](https://console.groq.com/) — free
- [Tavily API key](https://app.tavily.com/) — free tier: 1,000 searches/month

### Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt

cp .env.example .env
# Open .env and add your API keys

uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Project Structure

```
ResearchAgent/
├── backend/
│   ├── app/
│   │   ├── agent/
│   │   │   ├── state.py        # AgentState TypedDict
│   │   │   ├── nodes.py        # plan, search, synthesize, reflect node functions
│   │   │   └── graph.py        # LangGraph StateGraph definition
│   │   ├── api/
│   │   │   └── research.py     # POST /api/research — SSE streaming endpoint
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    └── src/
        ├── components/
        │   ├── SearchBar.tsx
        │   ├── ThoughtSteps.tsx   # Live agent reasoning panel
        │   ├── ResearchOutput.tsx # Streaming markdown answer
        │   └── SourceCard.tsx     # Cited source card
        ├── hooks/
        │   └── useResearch.ts     # SSE client + state management
        └── App.tsx
```

## How the streaming works

The backend uses LangGraph's `astream_events(version="v2")` to intercept events at every level:

- `on_chain_start/end` for each node → emits `node_start` and `thought_step` SSE events
- `on_chat_model_stream` within the synthesize node → emits `token` SSE events

The React frontend reads the SSE stream via the Fetch API (`ReadableStream`) and updates state incrementally — no WebSockets needed.
