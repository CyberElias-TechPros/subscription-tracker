"use client";

import { BarChart3, Clock, CreditCard, Layers, Lock, Zap, Receipt, PieChart, Globe } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";

const features = [
  {
    title: "True monthly math",
    desc: "Weekly ×52/12, yearly ÷12. Every cycle normalized so mixed plans compare honestly.",
    icon: PieChart,
    span: "sm:col-span-2",
    tint: "#12A594",
  },
  {
    title: "Real cash-flow",
    desc: "Not averages — actual payment timing. Annual spikes, weekly clusters, your money's rhythm.",
    icon: BarChart3,
    span: "sm:col-span-2",
    tint: "#3E8FE0",
  },
  {
    title: "Due soon",
    desc: "30-day timeline with smart urgency. Never miss a renewal.",
    icon: Clock,
    span: "sm:col-span-1",
    tint: "#D68700",
  },
  {
    title: "Private by design",
    desc: "Local-first. Cloud sync only when you opt in. Encrypted at rest on the edge.",
    icon: Lock,
    span: "sm:col-span-1",
    tint: "#8E63D3",
  },
  {
    title: "Your year as receipt",
    desc: "The signature view. Perforated edges, mono type, barcode — your spending as artifact.",
    icon: Receipt,
    span: "sm:col-span-2",
    tint: "#E5484D",
  },
  {
    title: "Edge-fast sync",
    desc: "Workers + D1 at the edge. 24ms sync, global, offline-capable.",
    icon: Globe,
    span: "sm:col-span-1",
    tint: "#46A758",
  },
  {
    title: "Ledger that feels alive",
    desc: "Search (/), filter, sort, pause, undo. Keyboard-first, tactile, instant.",
    icon: Layers,
    span: "sm:col-span-1",
    tint: "#7C8B99",
  },
];

export function FeaturesBento() {
  return (
    <section id="features" className="relative mx-auto w-full max-w-[1200px] px-5 py-24 sm:px-8 sm:py-32">
      <div className="relative">
        <ScrollReveal>
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 shadow-xs">
              <Zap className="size-3 text-accent" />
              <span className="label-caps text-muted-foreground">Built for clarity</span>
            </div>
            <h2 className="font-display mt-6 text-[34px] text-foreground sm:text-[46px]">
              Everything you need,
              <br />
              <em className="text-muted-foreground">nothing you don&apos;t.</em>
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              We obsessed over the details so you don&apos;t have to. From payment math that
              matches real billing systems to a receipt you actually want to keep.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-3 sm:grid-cols-4 sm:gap-4">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 0.05} className={f.span}>
              <div className="card-hover group relative h-full overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
                <div
                  className="flex size-10 items-center justify-center rounded-[10px] border transition-transform duration-300 group-hover:scale-105"
                  style={{ borderColor: `${f.tint}33`, backgroundColor: `${f.tint}12` }}
                >
                  <f.icon className="size-5" style={{ color: f.tint }} />
                </div>
                <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-foreground">{f.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            </ScrollReveal>
          ))}

          {/* By the numbers */}
          <ScrollReveal delay={0.35} className="sm:col-span-2">
            <div className="relative h-full overflow-hidden rounded-xl border border-accent/25 bg-accent-soft p-6">
              <div className="flex items-center gap-2">
                <CreditCard className="size-4 text-accent" />
                <span className="label-caps text-accent">By the numbers</span>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4">
                {[
                  { n: "4", label: "Billing cycles supported" },
                  { n: "~24ms", label: "Edge sync latency" },
                  { n: "100%", label: "Private, no ads" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="font-num text-[26px] font-bold leading-none text-foreground">{s.n}</div>
                    <div className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/30 via-border to-transparent" />
              <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">
                Built on the global edge. Your data stays close to you, encrypted, and never
                sold. Free forever because it&apos;s cheap to run right.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
