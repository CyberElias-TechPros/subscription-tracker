# Production architecture

The current product is a privacy-first, client-only subscription tracker: data is stored in the browser and never sent to a server. This is safe to deploy as a static Next.js application on Vercel, but it is not multi-device or multi-user functionality.

## Cloudflare path
When accounts/sync are required, add a Cloudflare Worker API behind `NEXT_PUBLIC_API_URL`, with D1 tables for users and subscriptions and HttpOnly, Secure, SameSite cookies for sessions. Enforce ownership in every Worker query. Use D1 migrations checked into the repository; use R2 only for future user-uploaded assets. KV is appropriate for short-lived cache/rate-limit state, not subscriptions. Queues/Cron are unnecessary until reminders or scheduled processing are introduced.

Do not put D1 credentials or session signing secrets in Vercel client variables. Configure secrets with `wrangler secret put` and keep `NEXT_PUBLIC_API_URL` as the only browser-visible backend setting.

## Current limitations
No authentication, server API, D1 schema, reminders, or cross-device sync existed in the repository, so inventing a fake Cloudflare backend would reduce reliability. The UI explicitly remains local-first until those product requirements and production credentials are available.
