import { SITE_URL } from "@/lib/site";
import { ScrollReveal } from "@/components/scroll-reveal";

export const FAQ_ITEMS = [
  {
    q: "Is my data really private?",
    a: "Yes. By default everything is stored in your browser's local storage. When you create an account, data syncs encrypted to the edge (D1 + R2). No analytics on your financial data, no selling, no ads. You can export or delete everything in one click.",
  },
  {
    q: "How does cloud sync work?",
    a: "Create an account and your subscriptions sync automatically across devices. Local-first still — if the API is unreachable, you keep working offline. Guest mode (no account) remains fully functional with local storage only.",
  },
  {
    q: "Which billing cycles are supported, and how are they compared?",
    a: "Weekly, monthly, quarterly and yearly. Each subscription is normalized into a monthly equivalent — a yearly plan is divided by 12, a weekly one is multiplied by 52/12 — so your totals are always apples-to-apples. The 12-month projection shows actual cash-flow timing.",
  },
  {
    q: "Why do yearly subscriptions look 'spiky' in the 12-month chart?",
    a: "That chart shows when money actually leaves your account: annual plans renew in a single month, quarterly plans every third month, weekly ones four or five times a month. It's your real cash flow, not a smoothed average. That's what makes it useful for budgeting.",
  },
  {
    q: "Does it work offline? What does it cost?",
    a: `It's free and works offline after first load. Guest mode has no account or server. With an account, you get cross-device sync via the global edge — still free. Visit ${SITE_URL.replace(/^https?:\/\//, "")} any time. Open source, MIT licensed.`,
  },
  {
    q: "What stack powers this?",
    a: "Frontend on Vercel (Next.js 15, React 19, Tailwind v4, Framer Motion). Backend on Cloudflare Workers with D1 (SQLite at the edge), R2 for storage, and KV for cache. Type-safe, fast, global, and cheap to run — so it can stay free.",
  },
] as const;

export function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="relative mx-auto w-full max-w-[1200px] px-5 py-24 sm:px-8 sm:py-32">
      <div className="relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 shadow-xs">
              <span className="size-1.5 rounded-full bg-accent" />
              <span className="label-caps text-muted-foreground">Questions, answered</span>
            </div>
            <h2 id="faq-heading" className="font-display mt-6 text-[34px] text-foreground sm:text-[46px]">
              Built for people who hate{" "}
              <em className="text-accent">surprise charges.</em>
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              The short version of everything people ask before trusting an app with their
              money. No marketing fluff, just how it works.
            </p>
          </ScrollReveal>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <ScrollReveal key={item.q} delay={i * 0.05}>
              <details className="group rounded-xl border border-border bg-card p-1 shadow-xs transition-all duration-300 open:shadow-sm hover:border-border-strong">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-4 py-3.5 text-[14px] font-medium text-foreground marker:hidden hover:[&::-webkit-details-marker]:hidden [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <span
                    aria-hidden="true"
                    className="grid size-6 shrink-0 place-items-center rounded-full border border-border bg-surface-2 text-muted-foreground transition-all duration-300 group-open:rotate-45 group-open:border-primary group-open:bg-primary group-open:text-primary-foreground"
                  >
                    <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M6 1.5v9M1.5 6h9" />
                    </svg>
                  </span>
                </summary>
                <div className="px-4 pb-4">
                  <p className="text-[13px] leading-relaxed text-muted-foreground">{item.a}</p>
                </div>
              </details>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
