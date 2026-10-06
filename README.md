# Subscription Tracker — Paper & Ink Ledger

**Know what your subscriptions really cost.** A precise, private dashboard for recurring bills with optional cloud sync.

> An editorial fintech design language — warm paper, ink type, one confident viridian accent, and a receipt you can feel. Built for people who hate surprise charges.

## ✨ Experience

- **Editorial hero** — high-contrast serif display (Instrument Serif) over fine paper grid and grain, gentle scroll parallax
- **Paper & Ink design system** — warm paper surfaces, ink typography, hairlines and soft layered shadows instead of neon glass
- **Light-first with deep-ink dark theme** — both themes fully tokenized (oklch), follows the system
- **Alive interface** — cursor light (desktop), 3D tilt on the receipt, hover lifts, calm spring choreography via Framer Motion
- **Bento features** — editorial grid showcasing true monthly math, real cash-flow, private-by-design, edge sync
- **Dashboard** — paper cards, animated count-ups, interactive donut with hover states, horizon chart with tooltips
- **Accessibility** — keyboard nav, visible focus, `prefers-reduced-motion` disables ambient motion, semantic landmarks, skip link

## 🧮 What it does

- **True totals** — weekly/monthly/quarterly/yearly normalized to monthly equivalent
- **Console** — monthly spend, burn rate (day/week/month), 30-day outlook, biggest line item with smart insights
- **Receipt** — signature artifact: perforated edges, mono type, barcode, yearly total with 3D tilt
- **12-month projection** — actual payment timing, not averages. Annual spikes, weekly clusters
- **Due soon** — timeline of payments in next 30 days with urgency states
- **Where it goes** — interactive donut, category breakdown
- **Ledger** — search (`/`), filter, sort, edit, pause, delete with undo. `n` to add anywhere
- **Backups** — CSV + JSON export, import, clear
- **Cloud sync** — optional account, encrypted, edge-fast (24ms), offline-capable

## 🏗 Architecture

### Target: Vercel + Cloudflare

```
Users
  │
  ▼
Vercel — Next.js 15 Frontend (App Router, static, edge)
  │  NEXT_PUBLIC_API_URL
  │  HTTPS
  ▼
Cloudflare Worker — Hono API
  ├── D1 — users, subscriptions, audit_logs (SQLite at edge)
  ├── R2 — exports, backups (future: receipt images)
  ├── KV — cache, rate limit, session blocklist
  └── Cron / Queues — cleanup, reports (future)
```

### Frontend

```
app/
├── layout.tsx — light-first (system theme), cursor light, providers
├── page.tsx — editorial hero + bento + tracker + FAQ + CTA
├── globals.css — Paper & Ink tokens, grain, receipt system, motion
├── sitemap.ts, robots.ts, manifest.ts, opengraph-image.tsx
components/
├── cinematic-hero.tsx — editorial hero, paper grid, product preview
├── features-bento.tsx — editorial bento grid, category tints
├── tracker-app.tsx — orchestrator
├── stats-console.tsx — paper console, burn rate, insights
├── receipt-card.tsx — 3D tilt, perforated paper receipt
├── horizon-chart.tsx — animated bars, tooltips
├── spend-donut.tsx — interactive SVG, hover states
├── ledger.tsx — hairline table, search, filters
├── upcoming-payments.tsx — urgency, timeline
├── site-header.tsx — hairline nav, auth state, sync indicator
├── site-footer.tsx — operational status, trust
├── auth-dialog.tsx — paper dialog
├── subscription-dialog.tsx — premium form
├── settings-dialog.tsx — cloud sync status
├── cursor-glow.tsx — desktop-only cursor light
├── scroll-reveal.tsx — intersection + framer-motion
└── ui/* — Radix primitives, button variants
lib/
├── subscriptions.ts — pure domain logic (tested)
├── storage.ts — versioned schema + v0 migration (zod)
├── api-client.ts — Cloudflare Worker client
├── format.ts — Intl currency/dates
├── site.ts — constants
└── sample-data.ts — realistic demo
hooks/
├── use-subscriptions.ts — local reducer + persistence
├── use-auth.tsx — JWT, localStorage, /me verification
└── use-count-up.ts — animated numbers
```

### Backend (`worker/`)

```
worker/
├── src/index.ts — Hono app, CORS, health, routes
├── src/lib/
│   ├── auth.ts — bcryptjs + Web Crypto JWT
│   ├── db.ts — D1 helpers, rowToApi, computeStats
│   ├── types.ts — Env, User, SubscriptionRow
│   └── validation.ts — Zod schemas
├── src/middleware/
│   ├── auth.ts — Bearer JWT verification
│   └── cors.ts — allowlist + localhost + vercel.app
├── src/routes/
│   ├── auth.ts — register, login, me, logout
│   ├── subscriptions.ts — CRUD, toggle, import, clear
│   ├── settings.ts — currency
│   └── stats.ts — stats + export
├── migrations/0001_initial.sql — users, subscriptions, audit_logs
├── wrangler.jsonc — D1, R2, KV bindings
└── package.json — hono, bcryptjs, zod
```

## 🔐 Product Model

### Roles

- **Guest** — no account, localStorage only, private by construction, works offline
- **Authenticated** — account, D1 as source of truth, sync across devices, exports from cloud

### Happy Paths

1. **Guest adds subscription** → local reducer → localStorage → instant UI update → stats recalc
2. **Guest creates account** → register → JWT stored → option to sync local to cloud → import → remote list
3. **Authenticated adds** → POST /api/subscriptions → optimistic UI → D1 → toast
4. **Edit** → PUT /api/subscriptions/:id → update
5. **Pause/resume** → POST /:id/toggle → toggle
6. **Delete with undo** → DELETE → toast with Undo → POST to restore
7. **Search/filter/sort** → client-side querySubscriptions (same logic as backend)
8. **Export** → GET /api/export?format=json|csv (or local fallback)
9. **Import** → parse + validate → POST /import or replaceAll
10. **Currency change** → PUT /api/settings + local dispatch

### Security

- Passwords bcrypt 12 rounds
- JWT HS256 via SubtleCrypto, 7-day expiry
- Zod validation on all inputs (frontend + backend)
- CORS: frontend origin + localhost + *.vercel.app
- D1 CHECK constraints, FK, indexes
- No secrets in client, env only
- Rate limiting ready via KV

## 🚀 Getting Started

### Frontend

```bash
pnpm install # or npm install --legacy-peer-deps
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL to your Worker URL (or http://localhost:8787 for local)
pnpm dev # http://localhost:3000
```

### Backend (Cloudflare Workers)

```bash
cd worker
npm install
# Create D1 DB
npx wrangler d1 create subscription-tracker-db
# Update wrangler.jsonc database_id
# Create .dev.vars:
# JWT_SECRET=your-long-random-secret-32-chars-min
# FRONTEND_URL=http://localhost:3000

npm run dev # http://localhost:8787
npm run migrate:local
```

### Full Local Stack

Terminal 1: `cd worker && npm run dev`
Terminal 2: `pnpm dev`

Set `NEXT_PUBLIC_API_URL=http://localhost:8787` in frontend `.env.local`.

## 📦 Deployment

### Frontend → Vercel

1. Push to main or connect repo in Vercel
2. Set env vars:
   - `NEXT_PUBLIC_SITE_URL` = your custom domain
   - `NEXT_PUBLIC_API_URL` = your Workers URL (e.g. https://subscription-tracker-api.xxx.workers.dev)
3. Deploy — static Next.js, no serverless functions needed for core

### Backend → Cloudflare Workers

```bash
cd worker
npx wrangler secret put JWT_SECRET # long random string
# Set FRONTEND_URL in wrangler.jsonc vars to your Vercel URL
npx wrangler d1 create subscription-tracker-db # if not exists
npx wrangler d1 execute subscription-tracker-db --remote --file=./migrations/0001_initial.sql
npx wrangler deploy
```

Configure bindings in Cloudflare dashboard:

- D1: `subscription-tracker-db`
- R2: `subscription-tracker-storage` (create bucket)
- KV: `CACHE` (create namespace)

## 🧪 Testing

```bash
pnpm test # Vitest — 50 tests for domain logic
pnpm typecheck # tsc --noEmit
pnpm lint # ESLint
pnpm build # production build
```

Backend:

```bash
cd worker
npm run dev # local with --persist
npx tsc --noEmit # typecheck
```

## 🎨 Design System — "Paper & Ink Ledger"

An editorial fintech language: warm paper, ink type, one confident viridian
accent, hairlines and soft shadows. Light-first with a deep-ink dark theme;
both are fully tokenized in `app/globals.css`.

### Tokens

| Role | Light | Dark |
| --- | --- | --- |
| Background / paper | `oklch(0.981 0.006 90)` | `oklch(0.175 0.014 200)` |
| Card | white | `oklch(0.215 0.015 200)` |
| Ink / foreground | `oklch(0.23 0.018 200)` | `oklch(0.93 0.008 160)` |
| Primary (buttons) | ink | paper |
| Accent (viridian) | `oklch(0.52 0.11 163)` | `oklch(0.80 0.12 163)` |
| Border (hairline) | `oklch(0.905 0.008 90)` | `oklch(0.29 0.013 200)` |
| Warning / destructive | deep amber / red | light amber / red |

- **Radius** — 0.75rem base, pills for actions, 16–24px for cards
- **Typography** — Instrument Serif (display), Geist Sans (UI), Geist Mono (numerals, tabular)
- **Shadows** — five layered steps (`--shadow-xs` → `--shadow-xl`), deeper in dark
- **Motion** — `[0.22, 1, 0.36, 1]` — smooth, spring-like, 150–900ms

### Effects

- Paper grid + paper dots (masked radial fades)
- Grain via SVG turbulence (multiply on light, soft-light on dark)
- Hairline borders + soft shadow lifts on hover
- Cursor light — accent-tinted glow (desktop, respects reduced-motion)
- Scroll reveals with blur → sharp
- 3D tilt on the paper receipt (preserve-3d, reduced-motion aware)
- Perforated receipt: zigzag tear tabs, tear lines, barcode — always paper, in both themes

### Data-viz palette

Nine category colors (`lib/subscriptions.ts`), tuned for contrast on both
paper and ink surfaces; the accent marks the heaviest month and key states.

## 🔍 SEO

- Metadata: title template, description, keywords, canonical, OpenGraph, Twitter
- Structured data: WebApplication + FAQPage
- Sitemap, robots, manifest, OG image (next/og)
- Semantic HTML, heading hierarchy, alt text
- Performance: static, optimized images, code-split dialogs, ~255kB first load
- Internal linking, no orphan pages, indexation control

## ♿ Accessibility

- Skip link, landmarks, heading hierarchy
- Keyboard: `n` add, `/` search, dialog focus trap, visible focus ring
- `prefers-reduced-motion` disables ambient motion, tilt and the cursor light
- Touch targets 44px+, no hover dependency for critical info
- Contrast AAA for numerals, AA for body

## 📝 License

MIT — do whatever you like. No warranty. Your data is your responsibility — export backups.

---

Built as a premium, production-grade product — not a demo. Every interaction considered, every edge handled, every path happy.
