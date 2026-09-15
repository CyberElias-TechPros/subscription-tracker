"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Shield, Zap, Globe, Sparkles } from "lucide-react";
import { useTracker } from "@/components/tracker-provider";

export function CinematicHero() {
  const { openAdd, openAuth, isAuthenticated } = useTracker();
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const blur = useTransform(scrollYProgress, [0, 0.6], [0, 12]);

  return (
    <section ref={ref} className="relative min-h-[92vh] overflow-hidden bg-[#0a1214]">
      {/* Background layers */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e181b] via-[#0e181b] to-[#0a1214]" />

        {/* Mesh */}
        <motion.div style={{ y, scale }} className="absolute inset-0">
          <div className="absolute inset-0 opacity-[0.15] bg-graph [mask-image:radial-gradient(ellipse_80%_70%_at_50%_20%,black,transparent)]" />
          <div className="aurora" aria-hidden="true" />
        </motion.div>

        {/* Grain */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-soft-light">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_100%,rgba(0,0,0,0.8),transparent_50%)]" />
      </div>

      {/* Content */}
      <motion.div style={{ opacity, filter: useTransform(blur, (v) => `blur(${v}px)`) }} className="relative z-10 mx-auto flex min-h-[92vh] w-full max-w-[1280px] flex-col px-5 pb-16 pt-20 sm:px-8 sm:pt-28">
        {/* Top badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center"
        >
          <div className="group inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 backdrop-blur-md transition-colors hover:bg-white/[0.06]">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-[4px]" />
              <div className="relative size-1.5 rounded-full bg-emerald-300 animate-pulse" />
            </div>
            <span className="text-[11px] font-medium tracking-wide text-white/60">New: Cloud sync via Cloudflare edge · Encrypted · Free</span>
            <ArrowRight className="size-3 text-white/30 transition-transform group-hover:translate-x-0.5" />
          </div>
        </motion.div>

        {/* Headline */}
        <div className="mx-auto mt-12 max-w-4xl text-center sm:mt-16">
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-balance font-display text-[40px] font-[700] leading-[0.95] tracking-[-0.04em] text-white sm:text-[64px] lg:text-[80px]"
          >
            Know what your
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-br from-emerald-200 via-teal-200 to-emerald-300 bg-clip-text text-transparent">subscriptions</span>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-[0.15em] left-0 right-0 h-[0.12em] origin-left bg-gradient-to-r from-emerald-300/40 via-teal-300/40 to-transparent"
              />
            </span>
            <br />
            <span className="bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">really cost.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-6 max-w-2xl text-pretty text-[16px] leading-relaxed text-white/50 sm:text-[18px]"
          >
            A fast, private, local-first dashboard for recurring bills. Add your subscriptions once and see your true monthly spend, upcoming payments, and the honest yearly total.
            <span className="text-white/70"> Sync everywhere when you want it.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <button
              onClick={openAdd}
              className="group relative inline-flex h-[48px] items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-7 text-[14px] font-semibold text-black shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.2)] transition-all duration-300 hover:scale-[1.02] hover:bg-white/90 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_8px_32px_rgba(0,0,0,0.25)] active:scale-[0.98]"
            >
              <span className="relative flex items-center gap-2">
                Start tracking free
                <span className="flex size-5 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="size-3" />
                </span>
              </span>
            </button>

            {!isAuthenticated ? (
              <button
                onClick={() => openAuth("register")}
                className="inline-flex h-[48px] items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-7 text-[14px] font-medium text-white backdrop-blur transition-all hover:bg-white/[0.08] hover:border-white/15"
              >
                <Sparkles className="size-4 text-white/60" />
                Create account to sync
              </button>
            ) : (
              <a
                href="#tracker"
                className="inline-flex h-[48px] items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-7 text-[14px] font-medium text-white backdrop-blur transition-all hover:bg-white/[0.08]"
              >
                Open dashboard
                <ArrowRight className="size-4 text-white/40" />
              </a>
            )}
          </motion.div>

          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
          >
            {[
              { icon: Shield, text: "Private by design" },
              { icon: Zap, text: "No account required" },
              { icon: Globe, text: "Works offline" },
            ].map((item) => (
              <div key={item.text} className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
                <item.icon className="size-3 text-white/40" />
                <span className="text-[11px] font-medium text-white/40">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Preview — floating dashboard glimpse */}
        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.2, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-16 w-full max-w-5xl sm:mt-24"
        >
          <div className="perspective-[2000px]">
            <div className="relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#121f22]/80 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_20px_80px_-20px_rgba(0,0,0,0.6),0_0_80px_-20px_rgba(16,185,129,0.15)] backdrop-blur-2xl">
              {/* Fake browser chrome */}
              <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-white/10" />
                  <div className="size-3 rounded-full bg-white/10" />
                  <div className="size-3 rounded-full bg-white/10" />
                </div>
                <div className="ml-4 flex items-center gap-2 rounded-full bg-black/20 px-3 py-1">
                  <div className="size-2 rounded-full bg-emerald-400/50" />
                  <span className="text-[11px] text-white/30">subscription-tracker.vercel.app</span>
                </div>
              </div>

              {/* Mini preview content */}
              <div className="grid gap-4 p-4 sm:grid-cols-12 sm:p-6">
                <div className="sm:col-span-5 space-y-3">
                  <div className="h-20 rounded-[12px] bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.06] p-4">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-emerald-300 animate-pulse" />
                      <span className="text-[10px] uppercase tracking-wide text-white/30">True monthly</span>
                    </div>
                    <div className="mt-2 font-num text-[20px] font-bold text-white">$184.50</div>
                  </div>
                  <div className="h-[180px] rounded-[12px] bg-[#fdfcfa] p-4 text-[#1a2e32]">
                    <div className="text-[10px] uppercase tracking-widest text-[#1a2e32]/40">Your year</div>
                    <div className="mt-2 text-[24px] font-bold">$2,214</div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-[11px]"><span>Streaming</span><span>$33.98</span></div>
                      <div className="flex justify-between text-[11px]"><span>AI Tools</span><span>$45.00</span></div>
                      <div className="flex justify-between text-[11px]"><span>Software</span><span>$64.99</span></div>
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-7 space-y-3">
                  <div className="h-[120px] rounded-[12px] border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="text-[11px] text-white/40">Next 12 months</div>
                    <div className="mt-4 flex h-16 items-end gap-1">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-emerald-500/20 to-emerald-300/60" style={{ height: `${30 + Math.sin(i) * 20 + Math.random() * 30}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {["Netflix $15.99", "Spotify $16.99", "ChatGPT $20"].map((t) => (
                      <div key={t} className="rounded-[10px] border border-white/[0.06] bg-white/[0.02] p-3 text-[11px] text-white/50">{t}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Glow */}
              <div className="pointer-events-none absolute -inset-px rounded-[20px] bg-gradient-to-b from-white/10 to-transparent opacity-50" />
            </div>
          </div>

          {/* Floating badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute -left-4 top-12 hidden rounded-full border border-white/10 bg-[#121f22]/90 px-3 py-1.5 shadow-xl backdrop-blur-xl sm:flex items-center gap-2"
          >
            <div className="size-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-medium text-white/70">Synced to edge in 24ms</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="absolute -right-4 bottom-20 hidden rounded-full border border-white/10 bg-[#121f22]/90 px-3 py-1.5 shadow-xl backdrop-blur-xl sm:flex items-center gap-2"
          >
            <Shield className="size-3 text-emerald-300" />
            <span className="text-[11px] font-medium text-white/70">Encrypted at rest</span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a1214] to-transparent" />
    </section>
  );
}
