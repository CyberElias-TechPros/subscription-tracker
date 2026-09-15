import { SITE_URL } from "@/lib/site";
import { ScrollReveal } from "@/components/scroll-reveal";

export const FAQ_ITEMS = [
  {
    q: "Is my data really private?",
    a: "Yes. By default everything is stored in your browser's local storage. When you create an account, data syncs encrypted to Cloudflare's edge (D1 + R2). No analytics on your financial data, no selling, no ads. You can export or delete everything in one click.",
  },
  {
    q: "How does cloud sync work?",
    a: "Create an account and your subscriptions sync automatically across devices via Cloudflare Workers + D1. Local-first still — if the API is unreachable, you keep working offline. Guest mode (no account) remains fully functional with local storage only.",
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
    a: `It's free and works offline after first load. Guest mode has no account or server. With an account, you get cross-device sync via Cloudflare's global edge — still free. Visit ${SITE_URL.replace(/^https?:\/\//, "")} any time. Open source, MIT licensed.`,
  },
  {
    q: "What stack powers this?",
    a: "Frontend on Vercel (Next.js 15, React 19, Tailwind v4, Framer Motion). Backend on Cloudflare Workers with D1 (SQLite at the edge), R2 for storage, and KV for cache. Type-safe, fast, global, and cheap to run — so it can stay free.",
  },
] as const;

export function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="relative mx-auto w-full max-w-[1280px] px-5 py-24 sm:px-8 sm:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/[0.04] blur-[100px]" />
      </div>

      <div className="relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
              <div className="size-1.5 rounded-full bg-emerald-300 animate-pulse" />
              <span className="text-[11px] font-medium uppercase tracking-wide text-white/50">Questions, answered</span>
            </div>
            <h2 id="faq-heading" className="mt-6 text-balance text-[32px] font-semibold leading-[1.1] tracking-tight text-white sm:text-[40px]">
              We built this for people who hate{" "}
              <span className="bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">surprise charges.</span>
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/40">
              The short version of everything people ask before trusting an app with their money. No marketing fluff, just how it works.
            </p>
          </ScrollReveal>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <ScrollReveal key={item.q} delay={i * 0.06}>
              <details className="group rounded-[16px] border border-white/[0.06] bg-white/[0.02] p-1 backdrop-blur transition-all duration-300 open:border-white/10 open:bg-white/[0.04] hover:border-white/10 hover:bg-white/[0.03]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-[12px] px-5 py-4 text-[14px] font-medium text-white/80 transition-colors marker:hidden hover:text-white group-open:text-white [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/40 transition-all duration-300 group-open:rotate-45 group-open:bg-white group-open:text-black">
                    <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M6 1.5v9M1.5 6h9" />
                    </svg>
                  </span>
                </summary>
                <div className="px-5 pb-4">
                  <p className="text-[13px] leading-relaxed text-white/50">{item.a}</p>
                </div>
              </details>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
