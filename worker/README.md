# Subscription Tracker API — Cloudflare Workers

Production-grade backend for Subscription Tracker, running on Cloudflare's edge.

## Architecture

```
Vercel (Next.js Frontend)
   │
   │ HTTPS /api/* → NEXT_PUBLIC_API_URL
   ▼
Cloudflare Worker (Hono)
   ├── D1 — users, subscriptions, audit_logs
   ├── R2 — exports, backups (future: receipt images)
   ├── KV — cache, rate limiting, session blocklist
   └── Queues / Cron — cleanup, reports (future)
```

## Stack

- **Hono** — fast, lightweight web framework for Workers
- **Cloudflare D1** — SQLite at the edge, relational, fast
- **bcryptjs** — pure JS password hashing (Workers compatible)
- **Web Crypto** — JWT signing via SubtleCrypto (HS256)
- **Zod** — validation

## Schema

```sql
users(id, email UNIQUE, password_hash, name, currency, created_at, updated_at)
subscriptions(id, user_id FK, name, cost, cycle, category, notes, start_date, paused, created_at, updated_at)
audit_logs(id, user_id, action, entity_type, entity_id, metadata, created_at)
```

## API

### Auth (public)

- `POST /api/auth/register` — {email, password, name?} → {user, token}
- `POST /api/auth/login` — {email, password} → {user, token}
- `GET /api/auth/me` — Bearer token → {user}
- `POST /api/auth/logout` — Bearer token → {message}

### Subscriptions (auth required)

- `GET /api/subscriptions` — list
- `POST /api/subscriptions` — create
- `GET /api/subscriptions/:id`
- `PUT /api/subscriptions/:id` — full update
- `PATCH /api/subscriptions/:id` — partial
- `POST /api/subscriptions/:id/toggle` — pause/resume
- `DELETE /api/subscriptions/:id`
- `DELETE /api/subscriptions` — clear all
- `POST /api/subscriptions/import` — bulk import {subscriptions: []}

### Settings (auth)

- `GET /api/settings` → {settings: {currency}}
- `PUT /api/settings` — {currency}

### Stats & Export (auth)

- `GET /api/stats` → {stats: {...}}
- `GET /api/export?format=json|csv` — full backup
- `GET /api/stats/export?format=csv` — alias

### System

- `GET /` — health + endpoint list
- `GET /health` — {status: ok}

## Local Dev

```bash
cd worker
npm install
# Create D1 local DB
npx wrangler d1 create subscription-tracker-db
# Update wrangler.jsonc with database_id
# Set secrets in .dev.vars:
# JWT_SECRET=your-long-random-secret
# FRONTEND_URL=http://localhost:3000

npm run dev
# Worker runs on http://localhost:8787
```

## Migrations

Migrations are in `migrations/`. Wrangler auto-applies them on deploy if `migrations_dir` is set.

Local:
```bash
npm run migrate:local
```

Remote:
```bash
npm run migrate:remote
```

## Deployment

```bash
# Set secrets
npx wrangler secret put JWT_SECRET
# Set vars in wrangler.jsonc or dashboard
npx wrangler deploy
```

Set `FRONTEND_URL` to your Vercel URL for CORS.

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT HS256 via Web Crypto, 7-day expiry
- Validation with Zod on all inputs
- CORS restricted to frontend origin + localhost
- D1 foreign keys + CHECK constraints
- No secrets in code, env vars only
- Rate limiting ready via KV (future)

## Cost Awareness

- D1 queries batched where possible (import uses batch)
- No N+1 — single query per list
- KV for cache (future) to reduce D1 reads
- R2 for large exports, not D1
- Minimal Worker CPU (no heavy crypto loops)
