"use client";

import { motion } from "framer-motion";
import { BarChart3, Clock, CreditCard, Layers, Lock, Zap, Globe, Receipt, PieChart } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";

const features = [
  {
    title: "True monthly math",
    desc: "Weekly ×52/12, yearly ÷12. Every cycle normalized so mixed plans compare honestly.",
    icon: PieChart,
    span: "sm:col-span-2",
    accent: "from-emerald-400/20 to-teal-400/20",
  },
  {
    title: "Real cash-flow",
    desc: "Not averages — actual payment timing. Annual spikes, weekly clusters, your money's rhythm.",
    icon: BarChart3,
    span: "sm:col-span-2",
    accent: "from-blue-400/15 to-cyan-400/15",
  },
  {
    title: "Due soon",
    desc: "30-day timeline with smart urgency. Never miss a renewal.",
    icon: Clock,
    span: "sm:col-span-1",
    accent: "from-amber-400/15 to-orange-400/15",
  },
  {
    title: "Private by design",
    desc: "Local-first. Cloud sync only when you opt in. Encrypted at rest on Cloudflare's edge.",
    icon: Lock,
    span: "sm:col-span-1",
    accent: "from-violet-400/15 to-purple-400/15",
  },
  {
    title: "Your year as receipt",
    desc: "The signature view. Perforated edges, mono type, barcode — your spending as artifact.",
    icon: Receipt,
    span: "sm:col-span-2",
    accent: "from-stone-400/15 to-neutral-400/15",
  },
  {
    title: "Edge-fast sync",
    desc: "Cloudflare Workers + D1. 24ms sync, global, offline-capable.",
    icon: Globe,
    span: "sm:col-span-1",
    accent: "from-emerald-400/15 to-teal-400/15",
  },
  {
    title: "Ledger that feels alive",
    desc: "Search (/), filter, sort, pause, undo. Keyboard-first, tactile, instant.",
    icon: Layers,
    span: "sm:col-span-1",
    accent: "from-white/5 to-white/10",
  },
];

export function FeaturesBento() {
  return (
    <section id="features" className="relative mx-auto w-full max-w-[1280px] px-5 py-24 sm:px-8 sm:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/[0.03] blur-[120px]" />
      </div>

      <div className="relative">
        <ScrollReveal>
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
              <Zap className="size-3 text-emerald-300" />
              <span className="text-[11px] font-medium uppercase tracking-wide text-white/50">Built for clarity</span>
            </div>
            <h2 className="mt-6 text-balance text-[32px] font-semibold leading-[1.1] tracking-tight text-white sm:text-[44px]">
              Everything you need,
              <br />
              <span className="bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">nothing you don&apos;t.</span>
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/40">
              We obsessed over the details so you don&apos;t have to. From payment math that matches real billing systems to a receipt you actually want to keep.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid gap-3 sm:grid-cols-4 sm:gap-4">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 0.06} className={f.span}>
              <div className="group relative h-full overflow-hidden rounded-[20px] border border-white/[0.06] bg-white/[0.02] p-[1px] transition-all duration-500 hover:border-white/10 hover:bg-white/[0.04]">
                <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                <div className="relative h-full rounded-[19px] bg-[#121f22]/80 p-6 backdrop-blur-xl">
                  <div className="flex size-10 items-center justify-center rounded-[12px] border border-white/10 bg-white/[0.04] transition-all duration-300 group-hover:bg-white/[0.06] group-hover:scale-105">
                    <f.icon className="size-5 text-white/60 group-hover:text-white/90 transition-colors" />
                  </div>
                  <h3 className="mt-4 text-[16px] font-semibold tracking-tight text-white">{f.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-white/40 group-hover:text-white/50 transition-colors">{f.desc}</p>

                  {/* Subtle hover glow */}
                  <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/[0.04] blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </div>
            </ScrollReveal>
          ))}

          {/* Stats card */}
          <ScrollReveal delay={0.4} className="sm:col-span-2">
            <div className="group relative h-full overflow-hidden rounded-[20px] border border-emerald-400/15 bg-emerald-400/[0.06] p-[1px]">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/15 to-teal-400/10 opacity-60" />
              <div className="relative h-full rounded-[19px] bg-[#0e1a1d]/90 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <CreditCard className="size-4 text-emerald-300" />
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200/60">By the numbers</span>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div>
                    <div className="font-num text-[28px] font-bold leading-none text-white">12+</div>
                    <div className="mt-1 text-[11px] text-white/40">Billing cycles supported</div>
                  </div>
                  <div>
                    <div className="font-num text-[28px] font-bold leading-none text-white">~24ms</div>
                    <div className="mt-1 text-[11px] text-white/40">Edge sync latency</div>
                  </div>
                  <div>
                    <div className="font-num text-[28px] font-bold leading-none text-white">100%</div>
                    <div className="mt-1 text-[11px] text-white/40">Private, no ads</div>
                  </div>
                </div>
                <div className="mt-6 h-px w-full bg-gradient-to-r from-emerald-400/20 via-white/10 to-transparent" />
                <p className="mt-4 text-[12px] leading-relaxed text-white/40">
                  Built on Cloudflare&apos;s global network. Your data stays close to you, encrypted, and never sold. Free forever because it&apos;s cheap to run right.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
