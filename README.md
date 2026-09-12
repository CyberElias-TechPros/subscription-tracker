# Subscription Tracker

**Know what your subscriptions really cost.**

A fast, free, private dashboard for recurring bills. Add your subscriptions once and see your true monthly spend, upcoming payments, and the honest yearly total — with no account, no server, and no tracking. Your data lives in your browser, and never leaves it.

## What it does

- **True totals** — every billing cycle (weekly / monthly / quarterly / yearly) is normalized into a monthly equivalent, so mixed plans compare apples-to-apples.
- **The console** — one glance at monthly spend, burn rate (per day / week / month), the 30-day outlook, and your biggest line item.
- **Your year as a receipt** — the signature view: a printed receipt of your yearly subscription spend, perforated edges and all.
- **The next 12 months** — real cash-flow projection. Annual plans spike in their renewal month; weekly ones hit four or five times a month.
- **Due soon** — a timeline of every payment landing in the next 30 days.
- **Where it goes** — category breakdown with a hand-built donut chart.
- **A real ledger** — search (`/`), filter, sort, edit, pause, and delete with undo. Press `n` to add a subscription from anywhere.
- **Backups** — export CSV (spreadsheet-ready) or JSON (full backup), import on any device.
- **Sample data** — explore the full product in one click before entering anything.

## Privacy model

This is a **local-first** application by design:

- All data is stored in the browser's `localStorage` (`subscription-tracker:v1`).
- There is no backend, no database, no analytics, and no account system.
- Financial data staying on-device is a feature, not a limitation: it makes the tool private by construction, free to run, and instantly fast.
- Clearing site data deletes everything — export a JSON backup first (Settings & data).

If you previously used the original v0 version of this app, your data is **migrated automatically** on first load.

## Architecture

```text
Next.js 15 (App Router, static) ── deployed on Vercel
│
├── app/                     # Layout, page, robots, sitemap, manifest,
│                            # favicon, code-generated OG image (next/og)
├── components/              # UI + bespoke SVG charts (no chart library)
├── hooks/                   # State reducer + persistence (useSubscriptions)
└── lib/                     # Pure domain logic (tested with Vitest)
     ├── subscriptions.ts    # Cycles, payment scheduling, stats, projections
     ├── storage.ts          # Versioned schema + v0 migration (zod-validated)
     ├── export.ts           # CSV / JSON / share
     ├── format.ts           # Currency + date formatting (Intl)
     └── sample-data.ts      # Realistic demo dataset
```

**Why no backend?** The product is a single-user, single-device tool; a server would add accounts, auth, hosting cost, and privacy exposure with zero user benefit at this scope. The domain layer (`lib/`) is deliberately pure and framework-free, so if multi-device sync is ever needed, the same logic can be lifted into a Cloudflare Workers + D1 API without touching the UI. That evolution path is intentionally left open — but not built speculatively.

## Tech stack

- [Next.js 15.5](https://nextjs.org) (App Router, static output, strict builds)
- [React 19](https://react.dev), TypeScript (strict, `tsc --noEmit` in CI)
- [Tailwind CSS v4](https://tailwindcss.com) with a bespoke token system (dark-first "Midnight Ledger" + light "Paper Ledger")
- [Radix UI](https://www.radix-ui.com) primitives (dialog, select, switch, label)
- [react-hook-form](https://react-hook-form.com) + [Zod 4](https://zod.dev) for form validation
- [sonner](https://sonner.emilkowal.ski) toasts, [next-themes](https://github.com/pacocoursey/next-themes) theming
- Charts are hand-built SVG/CSS — no chart library, minimal JS
- [Vitest](https://vitest.dev) for the domain logic (50 tests)

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

### Scripts

| Command             | What it does                                  |
| ------------------- | --------------------------------------------- |
| `pnpm dev`          | Dev server                                    |
| `pnpm build`        | Production build (type-checks and lints)      |
| `pnpm start`        | Serve the production build                    |
| `pnpm test`         | Run the test suite (Vitest)                   |
| `pnpm typecheck`    | `tsc --noEmit`                                |
| `pnpm lint`         | ESLint (next/core-web-vitals + typescript)    |
| `node scripts/generate-icons.mjs` | Regenerate PNG icons from `app/icon.svg` |

### Environment

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to your deployed URL (used for canonicals, sitemap, robots, and Open Graph). Defaults to the Vercel URL.

## Deployment (Vercel)

The app is a static Next.js build — no serverless functions, no database:

1. Push to `main` (or connect the repo in Vercel).
2. Vercel auto-detects Next.js and installs with pnpm.
3. Set `NEXT_PUBLIC_SITE_URL` in project environment variables for a custom domain.

## Data schema

```ts
interface Subscription {
  id: string
  name: string
  cost: number          // per billing cycle
  cycle: "weekly" | "monthly" | "quarterly" | "yearly"
  category: string      // streaming | music | software | ai | gaming | news | fitness | food | other
  notes?: string
  startDate?: string    // yyyy-MM-dd — anchors the payment schedule
  paused: boolean       // paused subs stay listed but leave all totals
  createdAt: number
  updatedAt: number
}
```

Stored as `{ version: 1, subscriptions: Subscription[], settings: { currency: string } }`. The single app-level currency keeps arithmetic honest (no silent FX conversion). Payment dates anchor to the original start date, so month-end plans behave like real billing (Jan 31 → Feb 28 → Mar 31).

## Accessibility & performance

- Semantic landmarks, skip link, visible focus states, labeled controls, `aria-live` toasts.
- Full keyboard support (dialogs trap focus, `/` focuses search, `n` adds a subscription).
- `prefers-reduced-motion` disables all ambient animation.
- Static HTML with server-rendered content; dialog code (forms, validation libs) is lazy-loaded; first load ≈ 195 kB JS.

## License

MIT — do whatever you like. No warranty; it's a client-side tool, your data is your responsibility (that's why exports exist).
