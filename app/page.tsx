import { TrackerApp } from "@/components/tracker-app";
import { FAQ, FAQ_ITEMS } from "@/components/faq";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { CinematicHero } from "@/components/cinematic-hero";
import { FeaturesBento } from "@/components/features-bento";
import { ArrowRight } from "lucide-react";

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

      {/* Hero */}
      <CinematicHero />

      {/* Features Bento */}
      <FeaturesBento />

      {/* The tracker application */}
      <section id="tracker" className="relative scroll-mt-20">
        {/* Section intro */}
        <div className="mx-auto w-full max-w-[1200px] px-5 pb-8 pt-16 sm:px-8 sm:pt-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 shadow-xs">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent/60 opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
                </span>
                <span className="label-caps text-muted-foreground">Live dashboard</span>
              </div>
              <h2 className="font-display mt-5 text-[32px] text-foreground sm:text-[44px]">
                Your money, <em className="text-accent">finally legible.</em>
              </h2>
            </div>
            <p className="max-w-md text-[14px] leading-relaxed text-muted-foreground sm:text-right">
              Add what you pay for. We normalize every cycle, project real cash flow, and print
              your year as a receipt you can actually feel.
            </p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[1200px] px-5 pb-16 sm:px-8">
          <TrackerApp />
        </div>
      </section>

      <FAQ />

      {/* Bottom CTA */}
      <section className="relative overflow-hidden border-t border-border py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="paper-dots absolute inset-0 [mask-image:radial-gradient(ellipse_60%_70%_at_50%_100%,black,transparent)] opacity-50" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-[radial-gradient(ellipse_50%_100%_at_50%_120%,var(--accent-soft),transparent_70%)]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
          <h2 className="font-display text-[34px] text-foreground sm:text-[48px]">
            Stop guessing. <em className="text-accent">Know your number.</em>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Free forever. Private by default. Sync when you want it. No ads, no dark patterns,
            no surprise charges.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <a
              href="#tracker"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-[14px] font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
            >
              Open tracker
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="https://github.com/CyberElias-TechPros/subscription-tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-card px-7 text-[14px] font-medium text-foreground shadow-xs transition-colors hover:border-border-strong hover:bg-secondary"
            >
              View source
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
