import Link from "next/link"
import { LogoMark } from "@/components/logo"
import { SITE_TAGLINE } from "@/lib/site"

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-background" data-print="hide">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5 text-foreground">
            <LogoMark className="size-6" />
            <span className="font-semibold tracking-tight">Subscription Tracker</span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {SITE_TAGLINE} A free, local-first tool — your subscriptions are stored in your
            browser and never uploaded.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Explore
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/#tracker" className="text-muted-foreground transition-colors hover:text-foreground">
                The tracker
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="text-muted-foreground transition-colors hover:text-foreground">
                FAQ
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/CyberElias-TechPros/subscription-tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Source code
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Your data
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Lives in this browser only. Clearing site data deletes it — export a JSON backup from
            Settings first.
          </p>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Subscription Tracker. Free to use, forever.</p>
          <p className="font-num">No accounts · No tracking · No server</p>
        </div>
      </div>
    </footer>
  )
}
