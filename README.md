# RankPilot — AI SEO Analyzer

A full-stack SEO audit tool: paste a URL, get a scored on-page SEO breakdown
across 11 factors, an AI-generated plain-English report, and track keyword
rankings for a domain over time.

**Stack:** React (Vite) · Node.js/Express · PostgreSQL + Prisma · JWT auth 


## Why this project

Built as a portfolio piece to demonstrate a real full-stack SaaS pattern:
auth, a REST API, a Postgres schema with relations, an external-data
integration (scraping + optional AI/search APIs), and a deployable frontend.

## Features

- **Email/password auth** (JWT, bcrypt-hashed passwords)
- **SEO Analyzer** — fetches any URL server-side and checks: title tag,
  meta description, H1 usage, heading structure, image alt text, canonical
  tag, viewport tag, Open Graph tags, HTTPS, content length, internal
  linking, and response time. Produces a 0–100 score.
- **AI report summaries** — a plain-English verdict + prioritized fix list.
  Uses an LLM if `OPENAI_API_KEY` is set; otherwise falls back to a
  rule-based summary so the feature works with zero external keys.
- **Keyword rank tracking** — track a domain's ranking for a keyword over
  time. Uses SerpApi if `SERPAPI_KEY` is set for real Google results;
  otherwise falls back to a deterministic simulated ranking so the flow is
  fully demoable without a paid search API.
- **Report history** — every scan is saved per-user and viewable later.

## Project structure

```
rankpilot/
  backend/     Express API + Prisma schema
  frontend/    React (Vite) SPA
```

## Local setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env: set DATABASE_URL to a Postgres instance, and JWT_SECRET
npm install
npx prisma migrate dev --name init
npm run dev
```

API runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App runs on `http://localhost:5173`.

## Deploying (matches the Orbit deployment pattern)

- **Backend → Railway**: create a Postgres plugin, set `DATABASE_URL`,
  `JWT_SECRET`, `CLIENT_ORIGIN` (your Vercel URL) as env vars, deploy the
  `backend` folder, run `npx prisma migrate deploy` once via Railway's shell.
- **Frontend → Vercel**: deploy the `frontend` folder, set `VITE_API_URL`
  to your Railway API URL + `/api`.

## Notes on the two "optional" integrations

The tutorial this was scoped from (GreatStack's MERN SEO tracker) uses
Browserbase for scraping and Gemini for AI reports. This build swaps those
for:

- **Scraping**: plain `fetch` + `cheerio` server-side — no headless browser
  needed for static on-page checks, so no Browserbase dependency/cost.
- **AI**: any OpenAI-compatible endpoint via `OPENAI_API_KEY`, with a
  rule-based fallback so the app is fully functional and demoable with
  zero paid API keys. Swap in Gemini by pointing `generateAiSummary()` in
  `backend/src/lib/aiReport.js` at Gemini's REST endpoint instead.
- **Rank tracking**: real ranks via SerpApi if you add a key, otherwise a
  deterministic simulated position — so the keyword-tracking flow (add →
  check → history) is demoable end-to-end without a paid search API.

This also means the DB is **Postgres/Prisma** instead of MongoDB, to stay
consistent with the rest of your portfolio work.
