import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { SITE_TAGLINE } from "@/lib/site";
import { Shield, Zap, Heart, ExternalLink } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-white/[0.06] bg-[#0a1214]/80 backdrop-blur-2xl" data-print="hide">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto grid w-full max-w-[1280px] gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3 text-white">
            <div className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
              <LogoMark className="size-5" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">Subscription Tracker</span>
          </div>
          <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-white/40">
            {SITE_TAGLINE} A free, privacy-first tool. Your subscriptions are stored locally, or encrypted in the cloud when you sign in. No ads, no tracking, no bullshit.
          </p>
          <div className="mt-6 flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2.5 py-1">
              <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium text-emerald-200/70">All systems operational</span>
            </div>
          </div>
        </div>

        <nav aria-label="Footer product">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/30">Product</h2>
          <ul className="mt-4 space-y-2.5 text-[13px]">
            <li><Link href="/#tracker" className="text-white/50 transition-colors hover:text-white">The tracker</Link></li>
            <li><Link href="/#features" className="text-white/50 transition-colors hover:text-white">Features</Link></li>
            <li><Link href="/#faq" className="text-white/50 transition-colors hover:text-white">FAQ</Link></li>
            <li><span className="inline-flex items-center gap-1.5 text-white/30"><Zap className="size-3" /> Free forever</span></li>
          </ul>
        </nav>

        <nav aria-label="Footer resources">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/30">Resources</h2>
          <ul className="mt-4 space-y-2.5 text-[13px]">
            <li>
              <a href="https://github.com/CyberElias-TechPros/subscription-tracker" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-white/50 transition-colors hover:text-white">
                <ExternalLink className="size-3.5" /> Source code
              </a>
            </li>
            <li><span className="text-white/30">MIT Licensed</span></li>
            <li><span className="inline-flex items-center gap-1.5 text-white/30"><Shield className="size-3" /> Private by design</span></li>
          </ul>
        </nav>

        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/30">Your data</h2>
          <p className="mt-4 text-[13px] leading-relaxed text-white/40">
            Lives in this browser by default. When you create an account, it syncs encrypted to Cloudflare&apos;s edge. You can export or delete everything, anytime.
          </p>
          <p className="mt-4 text-[12px] text-white/25">Built with care in the open. No tracking, no ads, no dark patterns.</p>
        </div>
      </div>

      <div className="border-t border-white/[0.06]">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-between gap-3 px-5 py-6 text-[12px] sm:flex-row sm:px-8">
          <div className="flex items-center gap-2 text-white/30">
            <span>© {new Date().getFullYear()} Subscription Tracker</span>
            <span className="hidden sm:inline">·</span>
            <span className="inline-flex items-center gap-1">Made with <Heart className="size-3 fill-red-400/50 text-red-400/50" /> for people who hate surprise charges</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-num rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white/30">No accounts required · No tracking · No server by default</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
