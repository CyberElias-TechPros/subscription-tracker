import { TrackerApp } from "@/components/tracker-app";
import { FAQ, FAQ_ITEMS } from "@/components/faq";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { CinematicHero } from "@/components/cinematic-hero";
import { FeaturesBento } from "@/components/features-bento";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Any (web browser)",
      description:
        "Free, private subscription tracker with cloud sync. See your true monthly spend, upcoming payments and yearly total — local-first by default, encrypted sync when you want it.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Track weekly, monthly, quarterly and yearly subscriptions",
        "True monthly and yearly spend totals",
        "Upcoming payments for the next 30 days",
        "12-month cash-flow forecast",
        "Category breakdown with interactive charts",
        "CSV and JSON export",
        "Cloud sync via Cloudflare Workers + D1",
        "Local-first, private by design",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* Cinematic Hero */}
      <CinematicHero />

      {/* Features Bento — premium showcase */}
      <FeaturesBento />

      {/* The actual tracker application */}
      <section id="tracker" className="relative scroll-mt-20">
        {/* Section intro */}
        <div className="mx-auto w-full max-w-[1280px] px-5 pb-8 pt-16 sm:px-8 sm:pt-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                <div className="size-1.5 rounded-full bg-emerald-300 animate-pulse" />
                <span className="text-[11px] font-medium uppercase tracking-wide text-white/50">Live dashboard</span>
              </div>
              <h2 className="mt-4 text-balance text-[28px] font-semibold leading-[1.1] tracking-tight text-white sm:text-[36px]">
                Your money, <br className="hidden sm:block" />
                <span className="bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">finally legible.</span>
              </h2>
            </div>
            <p className="max-w-md text-[14px] leading-relaxed text-white/40">
              Add what you pay for. We normalize every cycle, project real cash flow, and print your year as a receipt you can actually feel.
            </p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[1280px] px-5 pb-16 sm:px-8">
          <TrackerApp />
        </div>
      </section>

      <FAQ />

      {/* Bottom CTA */}
      <section className="relative overflow-hidden border-t border-white/[0.06] py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-400/[0.06] to-transparent" />
          <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
          <h2 className="text-balance text-[28px] font-semibold leading-[1.1] tracking-tight text-white sm:text-[42px]">
            Stop guessing.
            <br />
            <span className="bg-gradient-to-br from-emerald-200 to-teal-300 bg-clip-text text-transparent">Know your number.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/40">
            Free forever. Private by default. Sync when you want it. No ads, no dark patterns, no surprise charges.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <a href="#tracker" className="inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-[14px] font-semibold text-black shadow-lg transition-all hover:bg-white/90 hover:scale-[1.02]">
              Open tracker
            </a>
            <a href="https://github.com/CyberElias-TechPros/subscription-tracker" target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 text-[14px] font-medium text-white transition-colors hover:bg-white/[0.08]">
              View source
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
