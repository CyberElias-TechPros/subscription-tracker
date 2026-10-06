import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { SITE_TAGLINE } from "@/lib/site";
import { Shield, Zap, Heart, ExternalLink } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-border bg-surface-2/50" data-print="hide">
      <div className="mx-auto grid w-full max-w-[1200px] gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5 text-foreground">
            <LogoMark className="size-8" />
            <span className="text-[15px] font-semibold tracking-tight">Subscription Tracker</span>
          </div>
          <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            {SITE_TAGLINE} A free, privacy-first tool. Your subscriptions are stored locally, or
            encrypted in the cloud when you sign in. No ads, no tracking, no dark patterns.
          </p>
          <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent-soft px-2.5 py-1">
            <span className="size-1.5 rounded-full bg-accent" />
            <span className="text-[11px] font-medium text-accent">All systems operational</span>
          </div>
        </div>

        <nav aria-label="Footer product">
          <h2 className="label-caps text-muted-foreground/70">Product</h2>
          <ul className="mt-4 space-y-2.5 text-[13px]">
            <li><Link href="/#tracker" className="text-muted-foreground transition-colors hover:text-foreground">The tracker</Link></li>
            <li><Link href="/#features" className="text-muted-foreground transition-colors hover:text-foreground">Features</Link></li>
            <li><Link href="/#faq" className="text-muted-foreground transition-colors hover:text-foreground">FAQ</Link></li>
            <li><span className="inline-flex items-center gap-1.5 text-muted-foreground/60"><Zap className="size-3" /> Free forever</span></li>
          </ul>
        </nav>

        <nav aria-label="Footer resources">
          <h2 className="label-caps text-muted-foreground/70">Resources</h2>
          <ul className="mt-4 space-y-2.5 text-[13px]">
            <li>
              <a href="https://github.com/CyberElias-TechPros/subscription-tracker" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground">
                <ExternalLink className="size-3.5" /> Source code
              </a>
            </li>
            <li><span className="text-muted-foreground/60">MIT Licensed</span></li>
            <li><span className="inline-flex items-center gap-1.5 text-muted-foreground/60"><Shield className="size-3" /> Private by design</span></li>
          </ul>
        </nav>

        <div>
          <h2 className="label-caps text-muted-foreground/70">Your data</h2>
          <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
            Lives in this browser by default. When you create an account, it syncs encrypted to
            the edge. You can export or delete everything, anytime.
          </p>
          <p className="mt-4 text-[12px] text-muted-foreground/60">Built with care in the open. No tracking, no ads, no dark patterns.</p>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center justify-between gap-3 px-5 py-6 text-[12px] sm:flex-row sm:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2 text-muted-foreground/70">
            <span>© {new Date().getFullYear()} Subscription Tracker</span>
            <span className="hidden sm:inline">·</span>
            <span className="inline-flex items-center gap-1">
              Made with <Heart className="size-3 fill-destructive/20 text-destructive" /> for people who hate surprise charges
            </span>
          </div>
          <span className="font-num rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
            No accounts required · No tracking · No server by default
          </span>
        </div>
      </div>
    </footer>
  );
}
