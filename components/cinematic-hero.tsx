"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Shield, Zap, WifiOff } from "lucide-react";
import { useTracker } from "@/components/tracker-provider";
import { LogoMark } from "@/components/logo";

const TRUST = [
  { icon: Shield, text: "Private by design" },
  { icon: Zap, text: "No account required" },
  { icon: WifiOff, text: "Works offline" },
];

export function CinematicHero() {
  const { openAdd, openAuth, isAuthenticated } = useTracker();
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* Paper backdrop — fine grid, grain, soft vignette */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="paper-grid absolute inset-0 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_25%,black,transparent)] opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,var(--accent-soft),transparent_60%)]" />
        <div className="grain absolute inset-0" />
      </div>

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 mx-auto w-full max-w-[1200px] px-5 pb-20 pt-16 sm:px-8 sm:pt-24"
      >
        {/* Announcement pill */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 shadow-xs">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent/60 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
            </span>
            <span className="text-[12px] font-medium text-muted-foreground">
              Cloud sync via the edge · Encrypted · Free
            </span>
            <ArrowRight className="size-3 text-muted-foreground/60" />
          </div>
        </motion.div>

        {/* Headline */}
        <div className="mx-auto mt-10 max-w-3xl text-center sm:mt-14">
          <motion.h1
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[44px] leading-[1.02] text-foreground sm:text-[64px] lg:text-[76px]"
          >
            Know what your{" "}
            <em className="text-accent">subscriptions</em>{" "}
            really cost.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-6 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-[17px]"
          >
            A fast, private, local-first ledger for recurring bills. Add what you pay
            for and see your true monthly spend, upcoming payments, and the honest
            yearly total — <span className="text-foreground">synced everywhere when you want it.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <button
              onClick={openAdd}
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-[14px] font-semibold text-primary-foreground shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
            >
              Start tracking free
              <span className="flex size-5 items-center justify-center rounded-full bg-primary-foreground/15 transition-transform duration-200 group-hover:translate-x-0.5">
                <ArrowRight className="size-3" />
              </span>
            </button>

            {!isAuthenticated ? (
              <button
                onClick={() => openAuth("register")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-card px-7 text-[14px] font-medium text-foreground shadow-xs transition-colors hover:border-border-strong hover:bg-secondary"
              >
                Create account to sync
              </button>
            ) : (
              <a
                href="#tracker"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-card px-7 text-[14px] font-medium text-foreground shadow-xs transition-colors hover:border-border-strong hover:bg-secondary"
              >
                Open dashboard
                <ArrowRight className="size-4 text-muted-foreground" />
              </a>
            )}
          </motion.div>

          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          >
            {TRUST.map(({ icon: Icon, text }) => (
              <span key={text} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
                <Icon className="size-3.5 text-accent" />
                {text}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Product preview — paper app window */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-16 w-full max-w-4xl sm:mt-20"
        >
          {/* soft grounding shadow */}
          <div className="absolute inset-x-8 -bottom-4 h-24 rounded-[50%] bg-foreground/[0.06] blur-2xl" aria-hidden="true" />

          <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            {/* Window chrome */}
            <div className="flex items-center gap-3 border-b border-border bg-surface-2 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-border-strong" />
                <span className="size-2.5 rounded-full bg-border-strong" />
                <span className="size-2.5 rounded-full bg-border-strong" />
              </div>
              <div className="mx-auto flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1">
                <span className="size-1.5 rounded-full bg-accent" />
                <span className="font-num text-[10px] text-muted-foreground">subscription-tracker.app</span>
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <LogoMark className="size-4" />
              </div>
            </div>

            {/* Preview content */}
            <div className="grid gap-4 p-4 sm:grid-cols-12 sm:p-6">
              {/* Left: stat + receipt */}
              <div className="space-y-4 sm:col-span-5">
                <div className="rounded-xl border border-border bg-surface-2 p-4">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-accent" />
                    <span className="label-caps text-muted-foreground">True monthly</span>
                  </div>
                  <p className="font-num mt-2 text-[26px] font-bold leading-none text-foreground">$184.50</p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">≈ $2,214 per year · 9 active</p>
                </div>
                <div className="receipt rounded-[3px] bg-[var(--receipt-paper)] px-5 py-4 text-[var(--receipt-ink)] shadow-sm ring-1 ring-black/5 dark:ring-white/[0.08]">
                  <p className="font-num text-center text-[9px] font-bold uppercase tracking-[0.3em] text-[#1c2426]/50">
                    Your year
                  </p>
                  <p className="font-num mt-2 text-center text-[26px] font-extrabold leading-none tracking-tight">$2,214</p>
                  <div className="tear-line my-3" />
                  <ul className="font-num space-y-1.5 text-[10px]">
                    <li className="flex justify-between"><span>Streaming</span><span>$33.98</span></li>
                    <li className="flex justify-between"><span>AI Tools</span><span>$45.00</span></li>
                    <li className="flex justify-between"><span>Software</span><span>$64.99</span></li>
                  </ul>
                  <div className="barcode mt-3 h-6 w-full text-[#1c2426]/40" />
                </div>
              </div>

              {/* Right: chart + rows */}
              <div className="space-y-4 sm:col-span-7">
                <div className="rounded-xl border border-border bg-surface-2 p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[12px] font-medium text-foreground">The next 12 months</span>
                    <span className="font-num text-[10px] text-muted-foreground">avg $184/mo</span>
                  </div>
                  <div className="mt-4 flex h-20 items-end gap-1.5">
                    {[38, 44, 52, 40, 46, 58, 48, 55, 62, 47, 51, 100].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-[3px] bg-accent/25"
                        style={{ height: `${h}%`, background: i === 11 ? "var(--accent)" : undefined }}
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between font-num text-[8px] text-muted-foreground/70">
                    {["N", "D", "J", "F", "M", "A", "M", "J", "J", "A", "S", "O"].map((m, i) => (
                      <span key={i}>{m}</span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: "Netflix", cost: "$15.99", color: "#E5484D" },
                    { name: "Spotify", cost: "$16.99", color: "#8E63D3" },
                    { name: "ChatGPT", cost: "$20.00", color: "#12A594" },
                  ].map((t) => (
                    <div key={t.name} className="rounded-lg border border-border bg-card p-3 shadow-xs">
                      <span className="block size-1.5 rounded-full" style={{ backgroundColor: t.color }} />
                      <p className="mt-2 truncate text-[11px] font-medium text-foreground">{t.name}</p>
                      <p className="font-num text-[11px] text-muted-foreground">{t.cost}/mo</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating chips */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.7 }}
            className="absolute -left-3 top-16 hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-lg sm:flex"
          >
            <span className="size-1.5 rounded-full bg-accent" />
            <span className="text-[11px] font-medium text-foreground">Synced to edge in 24ms</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.25, duration: 0.7 }}
            className="absolute -right-3 bottom-24 hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-lg sm:flex"
          >
            <Shield className="size-3 text-accent" />
            <span className="text-[11px] font-medium text-foreground">Encrypted at rest</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
