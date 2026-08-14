# AdCreate.AI Frontend

TanStack Start + React + Tailwind v4 frontend for AdCreate.AI.

## Setup

```bash
bun install
cp .env.example .env  # fill in your Supabase project + backend URL
bun run dev
```

## Environment variables

See `.env.example`. `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` come from your Supabase project settings. `VITE_API_BASE` points at the backend (defaults to `http://localhost:8000` for local dev against `adcreate-ai-backend`).

## Deploy

Deployed to Vercel — import the repo, set the env vars above as project environment variables, auto-deploy on push to `main`.
