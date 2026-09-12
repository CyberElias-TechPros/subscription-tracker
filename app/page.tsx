import { TrackerApp } from "@/components/tracker-app"
import { FAQ, FAQ_ITEMS } from "@/components/faq"
import { SITE_NAME, SITE_URL } from "@/lib/site"

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
        "Free, private, local-first subscription tracker. See your true monthly spend, upcoming payments and yearly total — your data never leaves your browser.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Track weekly, monthly, quarterly and yearly subscriptions",
        "True monthly and yearly spend totals",
        "Upcoming payments for the next 30 days",
        "12-month payment forecast",
        "Category breakdown with charts",
        "CSV and JSON export",
        "100% local, private data storage",
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
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero — server-rendered for instant paint + SEO. */}
      <section className="relative overflow-hidden">
        <div className="aurora" aria-hidden="true" />
        <div
          className="bg-graph absolute inset-0 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_0%,black,transparent)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-10 pt-14 text-center sm:px-6 sm:pt-20">
          <p className="font-num animate-rise inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3.5 py-1.5 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            Free · Private · Local-first
          </p>

          <h1 className="animate-rise mx-auto mt-6 max-w-3xl text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl" style={{ animationDelay: "70ms" }}>
            Know what your subscriptions{" "}
            <span className="relative inline-block text-accent">
              really&nbsp;cost
              <svg
                className="absolute -bottom-1.5 left-0 w-full"
                viewBox="0 0 200 9"
                fill="none"
                aria-hidden="true"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 7C40 2 80 2 120 5c30 2 55 1 78-2"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              </svg>
            </span>
            .
          </h1>

          <p className="animate-rise mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg" style={{ animationDelay: "140ms" }}>
            Add your recurring bills once and see the true monthly total, what’s due next, and the
            honest yearly number. No account, no cloud — your data stays in this browser.
          </p>
        </div>

        {/* The application itself (client island, SSR-rendered shell). */}
        <div id="tracker" className="relative mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-6 sm:px-6">
          <TrackerApp />
        </div>
      </section>

      <FAQ />
    </>
  )
}
