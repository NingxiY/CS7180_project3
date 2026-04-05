# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@docs/ARCHITECTURE.md

## Project

**AI Multi-Agent Dating Assistant** — CS7180 Project 3, Northeastern University.

A multi-agent system where specialized AI agents each contribute a distinct analytical perspective (astrology, behavioral analysis, user history) to collaboratively generate dating advice. An LLM-as-judge layer evaluates and synthesizes agent outputs before presenting a final response to the user.

---

## Current Project Status

Implementation order — check off before assuming something exists:

- [x] Base agent interface (`backend/agents/base.py` — `BaseAgent` ABC)
- [x] Core schemas (`backend/agents/schemas.py` — `UserContext`, `AgentOpinion`)
- [x] First agent (`backend/agents/astrology_agent.py` — stub, no real LLM call yet)
- [x] Agent unit tests (`backend/tests/agents/test_astrology_agent.py`)
- [ ] Settings / env loading (`pydantic-settings`)
- [ ] FastAPI app skeleton
- [ ] Orchestrator and remaining agents (`behavioral_agent`, `history_agent`)
- [ ] LLM-as-judge layer
- [ ] PostgreSQL models and persistence
- [ ] Frontend (React + TypeScript)
- [ ] CI/CD pipeline and monitoring integration

When a module referenced in this file does not exist yet, create it following the conventions below.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | Python 3.11, FastAPI |
| Agent Framework | LangGraph (planned for multi-agent orchestration) |
| LLM Provider | OpenAI GPT-4o (primary), Anthropic Claude (judge) |
| Frontend | React 18, TypeScript, Vite |
| Database | PostgreSQL (user profiles, history) + Redis (session cache) |
| Testing | pytest (backend), Vitest + React Testing Library (frontend) |
| Linting | Ruff + mypy (backend), ESLint + Prettier (frontend) |
| CI/CD | GitHub Actions (to be configured) |
| Monitoring | LangSmith (LLM tracing), Prometheus + Grafana (planned) |

---

## Intended Repository Structure

This is the target layout. Create new files under these paths as work progresses.

```
backend/
  agents/          # One module per agent (astrology, behavioral, history)
  judge/           # LLM-as-judge evaluation logic
  orchestrator/    # Agent dispatch and response synthesis
  api/             # FastAPI routers and schemas
  models/          # SQLAlchemy ORM models
  tests/           # pytest tests mirroring src structure
frontend/
  src/
    components/    # Reusable UI components
    features/      # Feature-scoped modules (chat, profile, results)
    hooks/         # Custom React hooks
    api/           # Typed API client (mirrors backend schemas)
docs/
  PRD.md
  ARCHITECTURE.md
.github/workflows/ # CI pipeline definitions
```

---

## Architecture Decisions

These are firm design decisions. Follow them when implementing any new component.

- **Each agent is stateless and independently callable.** Agents receive a `UserContext` payload and return a typed `AgentOpinion`. No agent holds session state.
- **The orchestrator owns the conversation graph.** It decides which agents to invoke, merges outputs, and passes them to the judge. Agents never call each other.
- **LLM-as-judge is a required step, not optional.** The judge scores each `AgentOpinion` on relevance, safety, and coherence before the final response is assembled. Never bypass it in production flows.
- **Frontend talks only to the FastAPI backend.** No direct LLM calls from the browser. API keys never leave the backend.
- **Async throughout the backend.** All FastAPI route handlers and agent calls must be `async def`. Use `httpx.AsyncClient` for any outbound HTTP. Note: `BaseAgent.run()` is currently synchronous — when real LLM calls are added, migrate it to `async def run(...)` and update all implementations.

---

## Coding Conventions

These conventions apply from the first line of code written.

### Python / Backend

- Type-annotate all function signatures. Use `pydantic.BaseModel` for all request/response schemas.
- All agents must implement the `BaseAgent` abstract interface (to be defined in `backend/agents/base.py`). Use `astrology_agent.py` as the reference implementation once it exists.
- Name agent modules by perspective: `astrology_agent.py`, `behavioral_agent.py`, `history_agent.py`.
- Use `structlog` for all logging — no bare `print()` or `logging.basicConfig`.
- Load environment variables via `pydantic-settings`; never hardcode API keys or model names.
- LLM prompt templates belong in `backend/agents/<name>/prompts.py`, not inline in logic.

### TypeScript / Frontend

- All API response types will be generated from the backend OpenAPI schema via `npm run generate-types`. Do not hand-write types that duplicate backend schemas.
- Never use `any`. Use `unknown` and narrow with type guards when necessary.
- Feature state belongs in feature-scoped Zustand stores, not in component state.
- Chat and advice display components should be pure (no side effects, no direct API calls).

---

## Testing Strategy (TDD)

Write the test before the implementation. PRs should not introduce logic without a corresponding test.

### Backend

```bash
cd backend
pip install -r requirements-dev.txt

# Run all tests
pytest

# Run a single test
pytest tests/agents/test_astrology_agent.py::test_returns_opinion_for_valid_context

# Run with coverage
pytest --cov=. --cov-report=term-missing

# Type check
mypy .

# Lint
ruff check .
```

- Unit-test each agent in isolation by mocking the LLM call (`pytest-mock` or `respx`).
- Integration-test the orchestrator end-to-end with a real (test-tier) LLM call, guarded by `@pytest.mark.integration`.
- Judge evaluation tests must assert on structured output fields (`score`, `rationale`), not raw LLM strings.

### Frontend

```bash
cd frontend
npm install

# Run dev server
npm run dev

# Run all tests
npm test

# Run a single test file
npx vitest run src/features/chat/ChatWindow.test.tsx

# Lint + format check
npm run lint
```

- Test React components with React Testing Library. Assert on user-visible text and behavior, not component internals.
- Mock the API client module (`vi.mock('@/api/client')`) in all component tests.

---

## Do's and Don'ts

**Do:**
- Keep agent logic pure: given the same `UserContext`, an agent must return the same shape of `AgentOpinion`. Control determinism at the LLM call level via `temperature`.
- Log LLM inputs and outputs to LangSmith on every agent invocation, including in dev.
- Version prompt templates with a `PROMPT_VERSION` constant so regressions are traceable.
- Plan for a Prometheus counter on every agent invocation and judge evaluation (implement when monitoring is wired up).

**Don't:**
- Don't add a new agent without also adding it to the orchestrator's agent registry and writing a unit test.
- Don't change `UserContext` or `AgentOpinion` schemas without updating all affected tests and (once it exists) the frontend generated types.
- Don't use `gpt-3.5-turbo` for the judge — it must use the model specified in `settings.JUDGE_MODEL`.
- Don't merge directly to `main`. All changes go through a PR; once CI is configured, it must pass.
- Don't store raw PII (names, photos, contact info) in logs or LangSmith traces.

---

## CI/CD (Planned)

The intended GitHub Actions pipeline on every PR:
1. `ruff check` + `mypy` (backend)
2. `pytest` (backend, excluding `@pytest.mark.integration`)
3. `eslint` + `vitest` (frontend)
4. Docker build smoke test

Integration tests are intended to run nightly on `main` against live LLM endpoints once the pipeline is established.
