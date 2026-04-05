# CS7180 Project 3 — AI Multi-Agent Dating Assistant

A multi-agent system where specialized AI agents each contribute a distinct analytical perspective (astrology, behavioral analysis, user history) to collaboratively generate dating advice. An LLM-as-judge layer evaluates and synthesizes agent outputs before presenting a final response.

**Course:** CS7180 — Northeastern University

---

## Architecture Overview

```
User Request
     │
     ▼
FastAPI Backend
     │  UserContext
     ▼
Orchestrator (LangGraph)
     ├──► AstrologyAgent  ──► AgentOpinion
     ├──► BehavioralAgent ──► AgentOpinion
     └──► HistoryAgent    ──► AgentOpinion
                │
                ▼ List[AgentOpinion]
          LLM-as-Judge (Claude)
                │
                ▼
          Final Advice Response
```

Each agent is stateless and independently callable. The orchestrator owns the conversation graph — agents never call each other. The judge scores every `AgentOpinion` on relevance, safety, and coherence before the final response is assembled.

---

## Project Structure

```
backend/
  agents/
    base.py              # BaseAgent abstract interface
    schemas.py           # UserContext, AgentOpinion (Pydantic)
    astrology_agent.py   # Reference agent implementation
  tests/
    agents/
      test_astrology_agent.py
docs/
  PRD.md
  ARCHITECTURE.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | Python 3.11, FastAPI |
| Agent Framework | LangGraph |
| LLM Provider | OpenAI GPT-4o (agents), Anthropic Claude (judge) |
| Frontend | React 18, TypeScript, Vite |
| Database | PostgreSQL + Redis |
| Testing | pytest, Vitest + React Testing Library |

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+ (for frontend, once implemented)

### Backend setup

```bash
# Install dependencies (from project root)
pip install -r backend/requirements-dev.txt

# Copy and fill in environment variables
cp .env.example .env
```

### Running tests

```bash
# All backend tests
pytest backend/tests/

# Single test class
pytest backend/tests/agents/test_astrology_agent.py::TestAstrologyAgent

# With coverage
pytest backend/tests/ --cov=backend --cov-report=term-missing
```

### Linting and type checks

```bash
ruff check backend/
mypy backend/
```

---

## Implementation Status

- [x] `BaseAgent` abstract interface
- [x] `UserContext` and `AgentOpinion` schemas
- [x] `AstrologyAgent` (stub — no live LLM call yet)
- [ ] Settings / env loading (`pydantic-settings`)
- [ ] FastAPI app and `/api/advice` endpoint
- [ ] `BehavioralAgent`, `HistoryAgent`
- [ ] Orchestrator (LangGraph `StateGraph`)
- [ ] LLM-as-judge layer
- [ ] PostgreSQL models
- [ ] Frontend (React + TypeScript)
- [ ] CI/CD (GitHub Actions)
