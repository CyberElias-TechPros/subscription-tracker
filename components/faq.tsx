import { SITE_URL } from "@/lib/site"

export const FAQ_ITEMS = [
  {
    q: "Is my data really private?",
    a: "Yes. Everything you enter is stored in your browser's local storage on your own device. There is no account, no server-side database and no analytics on your data. The app works entirely on your machine.",
  },
  {
    q: "How do I back up my subscriptions or move to a new device?",
    a: 'Open Settings & data and export a JSON backup (or a CSV for spreadsheets). On the new device, import the JSON file and your full list is restored in one click.',
  },
  {
    q: "Which billing cycles are supported, and how are they compared?",
    a: "Weekly, monthly, quarterly and yearly. Each subscription is normalized into a monthly equivalent — a yearly plan is divided by 12, a weekly one is multiplied by 52/12 — so your totals are always apples-to-apples.",
  },
  {
    q: "Why do yearly subscriptions look 'spiky' in the 12-month chart?",
    a: "That chart shows when money actually leaves your account: annual plans renew in a single month, quarterly plans every third month, weekly ones four or five times a month. It's your real cash flow, not a smoothed average.",
  },
  {
    q: "Does it work offline? What does it cost?",
    a: `It's a free, static web app — after the first load it keeps working offline, and your data persists locally. There is no paid tier and nothing to sign up for. Visit ${SITE_URL.replace(/^https?:\/\//, "")} any time.`,
  },
] as const

export function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <h2 id="faq-heading" className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
        Questions, answered
      </h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        The short version of everything people ask before trusting an app with their money.
      </p>

      <div className="mt-8 space-y-3">
        {FAQ_ITEMS.map((item, i) => (
          <details
            key={item.q}
            className="group rounded-xl border border-border bg-card px-5 py-4 transition-colors open:border-accent/35 open:bg-accent-soft/40"
            open={i === 0}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium marker:hidden [&::-webkit-details-marker]:hidden">
              {item.q}
              <span
                aria-hidden="true"
                className="grid size-6 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-transform duration-300 group-open:rotate-45"
              >
                <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M6 1.5v9M1.5 6h9" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
