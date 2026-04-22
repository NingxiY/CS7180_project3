# 🌌 Cosmic Council — Multi-Agent AI Decision System

A production-style full-stack AI application that simulates a “council of advisors” to help users reason through complex personal decisions.

This project demonstrates modern AI engineering practices including multi-agent orchestration, persistent memory, test-driven development, and CI/CD integration.

---

## 🚀 Live Demo

👉 https://your-vercel-url.vercel.app

---

## 🧠 What This Project Does

Users describe a situation, and three distinct AI advisors provide perspectives:

* **Astrology Agent** — abstract, reflective, metaphor-driven
* **Behavioral Agent** — practical, action-oriented advice
* **History Agent** — pattern-based reasoning using past interactions

A **Judge Agent** synthesizes these into a final recommendation with tradeoff analysis.

---

## 🏗️ Architecture

### Frontend

* Next.js (App Router)
* Interactive UI with dynamic advisor cards

### Backend (Serverless)

* Next.js API Route (`/api/v1/advice`)
* Parallel agent execution (`Promise.all`)
* Structured synthesis layer

### Authentication

* Clerk (user sessions, protected API)

### Database

* Neon Postgres

Stores:

* user sessions
* agent opinions
* per-agent memory

### Memory System

Each agent maintains a rolling memory of past advice:

* Last 3 decisions are retained
* Injected into future prompts
* Enables personalized reasoning over time

---

## 🤖 AI Design

### Multi-Agent Pattern

Each agent produces structured output:

```
ADVICE
REASONING
CONFIDENCE
```

### Synthesis (Judge)

Produces:

* Final recommendation
* Rationale
* Tradeoffs between alternatives

---

## 🧪 Testing Strategy

### Unit Tests

* Memory logic (rolling window behavior)

### Integration Tests

* `/api/v1/advice` route
* Auth guard (401)
* Response shape validation

### E2E Tests (Playwright)

* UI rendering
* User interaction flow
* Error handling

---

## 🔁 CI/CD Pipeline

GitHub Actions pipeline includes:

* Install dependencies
* Build (`next build`)
* Unit + integration tests (Vitest)
* Coverage report
* E2E tests (Playwright)
* Security audit (`npm audit`)

---

## 🧩 Claude Code Integration

### Skills

* `/update-claude-md` — maintains project documentation

### Hooks

* Detect structural changes → suggest documentation updates
* Detect code changes → suggest build/test validation

### Agent Workflow

* Prompt engineering for multi-agent reasoning
* Controlled output structure
* Safe fallback (stub mode)

---

## 📦 Tech Stack

* Next.js
* React
* Clerk (Auth)
* Neon Postgres
* Vitest
* Playwright
* GitHub Actions

---

## ⚙️ Running Locally

```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Running Tests

```bash
npm test
npm run test:coverage
npm run test:e2e
```

---

## 🔐 Environment Variables

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
DATABASE_URL=...
ANTHROPIC_API_KEY=... (optional)
```

---

## 🎯 Key Engineering Decisions

* Next.js full-stack for simple deployment (Vercel)
* Serverless API instead of separate backend
* Lightweight DB layer (no ORM)
* Rolling memory instead of embeddings
* Stub mode fallback for reliability

---

## 📸 Demo Highlights

* Multi-agent reasoning in real time
* Persistent user memory
* Structured AI outputs
* Fully tested and CI-validated pipeline

---

## ✨ Future Improvements

* Richer memory modeling (LLM summarization)
* User history UI
* More specialized agents

---

## 📄 License

MIT
