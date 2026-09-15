/**
 * Site-wide constants.
 * SITE_URL is overridable via NEXT_PUBLIC_SITE_URL so previews / custom
 * domains get correct canonicals, sitemap and Open Graph URLs.
 * API_URL is overridable via NEXT_PUBLIC_API_URL for Cloudflare Workers backend.
 */
export const SITE_NAME = "Subscription Tracker"
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://v0-subscription-tracker.vercel.app"
).replace(/\/$/, "")

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787"
).replace(/\/$/, "")

export const SITE_TAGLINE = "Know what your subscriptions really cost."
export const SITE_DESCRIPTION =
  "A fast, private subscription tracker with optional cloud sync. See your true monthly spend, upcoming payments and yearly total — free, local-first by default, encrypted sync via Cloudflare edge when you want it. No ads, no tracking."
