# RankPilot — AI SEO Analyzer

A full-stack SEO audit tool: paste a URL, get a scored on-page SEO breakdown across 11 factors, an AI-generated plain-English report, and track keyword rankings for a domain over time.

**Stack:** React (Vite) · Node.js/Express · PostgreSQL + Prisma · JWT auth

---

## Why this project

Built as a portfolio piece to demonstrate a real full-stack SaaS pattern: authentication, a REST API, a relational Postgres schema, an external-data integration (scraping + optional AI/search APIs), and a fully deployable frontend and backend.

## Features

- **Email/password auth** — JWT-based sessions with bcrypt-hashed passwords
- **SEO Analyzer** — fetches any URL server-side and checks title tag, meta description, H1 usage, heading structure, image alt text, canonical tag, viewport tag, Open Graph tags, HTTPS, content length, internal linking, and response time, producing a 0–100 score
- **AI report summaries** — a plain-English verdict with a prioritized fix list. Uses an LLM when `OPENAI_API_KEY` is set, and falls back to a rule-based summary otherwise, so the feature works with zero external keys
- **Keyword rank tracking** — tracks a domain's ranking for a keyword over time. Uses SerpApi for real Google results when `SERPAPI_KEY` is set, and falls back to a deterministic simulated ranking otherwise, so the full flow is demoable without a paid search API
- **Report history** — every scan is saved per-user and viewable later

## Project structure

```
rankpilot/
  backend/     Express API + Prisma schema
  frontend/    React (Vite) SPA
```

## Local Setup

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

## Deployment

- **Backend → Railway** — create a Postgres plugin, set `DATABASE_URL`, `JWT_SECRET`, and `CLIENT_ORIGIN` (your Vercel URL) as environment variables, deploy the `backend` folder, then run `npx prisma migrate deploy` once via Railway's shell.
- **Frontend → Vercel** — deploy the `frontend` folder and set `VITE_API_URL` to your Railway API URL + `/api`.
