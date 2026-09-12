/**
 * Site-wide constants.
 *
 * SITE_URL is overridable via NEXT_PUBLIC_SITE_URL so previews / custom
 * domains get correct canonicals, sitemap and Open Graph URLs.
 */
export const SITE_NAME = "Subscription Tracker"
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://v0-subscription-tracker.vercel.app"
).replace(/\/$/, "")

export const SITE_TAGLINE = "Know what your subscriptions really cost."
export const SITE_DESCRIPTION =
  "A fast, private, local-first dashboard for your recurring bills. See your true monthly spend, upcoming payments and yearly total — free, no account, and your data never leaves your browser."
