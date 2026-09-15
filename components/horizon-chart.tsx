"use client";

import * as React from "react";
import { formatCompactMoney, formatMoney } from "@/lib/format";
import { projectMonths, type Subscription } from "@/lib/subscriptions";
import { motion } from "framer-motion";

export function HorizonChart({ subscriptions, currency }: { subscriptions: Subscription[]; currency: string }) {
  const months = React.useMemo(() => projectMonths(subscriptions, 12), [subscriptions]);
  const [mounted, setMounted] = React.useState(false);
  const [hovered, setHovered] = React.useState<number | null>(null);

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const max = Math.max(...months.map((m) => m.total), 1);
  const total = months.reduce((sum, m) => sum + m.total, 0);
  const heaviest = months.reduce((max, m) => (m.total > max.total ? m : max), months[0]);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="flex items-center gap-3">
          <p className="text-[13px] text-white/50">
            Total over 12 months:{" "}
            <span className="font-num text-[15px] font-semibold text-white">{formatMoney(total, currency, { maximumFractionDigits: 0 })}</span>
          </p>
          <div className="hidden h-3 w-px bg-white/10 sm:block" />
          <p className="hidden text-[12px] text-white/40 sm:block">
            Avg <span className="font-num font-medium text-white/70">{formatMoney(total / 12, currency, { maximumFractionDigits: 0 })}/mo</span>
          </p>
        </div>
        <p className="text-[11px] text-white/30">
          Heaviest: <span className="font-medium text-white/60">{heaviest?.label}</span>{" "}
          <span className="font-num">{formatMoney(heaviest?.total ?? 0, currency, { maximumFractionDigits: 0 })}</span>
        </p>
      </div>

      <div
        className="relative grid flex-1 grid-cols-12 items-end gap-1 sm:gap-1.5"
        role="img"
        aria-label={`Projected payments per month for the next year`}
        onMouseLeave={() => setHovered(null)}
      >
        {months.map((m, i) => {
          const pct = mounted ? Math.max((m.total / max) * 100, m.total > 0 ? 4 : 0) : 0;
          const isHeaviest = m === heaviest && m.total > 0;
          const isHovered = hovered === i;

          return (
            <div
              key={i}
              className="group relative flex h-[160px] flex-col items-center justify-end sm:h-[200px]"
              onMouseEnter={() => setHovered(i)}
            >
              {/* Glow behind heaviest */}
              {isHeaviest && (
                <div className="absolute bottom-0 h-[60%] w-full rounded-t-[8px] bg-emerald-400/10 blur-[12px] transition-opacity" />
              )}

              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: `${pct}%`, opacity: 1 }}
                transition={{ duration: 0.9, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className={`relative w-full rounded-t-[6px] transition-all duration-300 ${
                  isHeaviest
                    ? "bg-gradient-to-t from-emerald-500/60 via-emerald-400 to-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    : isHovered
                    ? "bg-gradient-to-t from-white/20 to-white/40"
                    : "bg-gradient-to-t from-white/[0.08] to-white/[0.18] group-hover:from-white/[0.12] group-hover:to-white/[0.24]"
                }`}
                style={{ minHeight: m.total > 0 ? 4 : 0 }}
              >
                {/* Inner highlight */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                
                {/* Tooltip */}
                <div
                  className={`pointer-events-none absolute -top-2 left-1/2 z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-[10px] border border-white/10 bg-[#0f1e21]/90 px-3 py-2 text-xs font-medium shadow-2xl backdrop-blur-xl transition-all duration-200 ${
                    isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-num font-semibold text-white">{formatMoney(m.total, currency)}</span>
                    <span className="text-white/40">·</span>
                    <span className="text-white/50">{m.payments} {m.payments === 1 ? "payment" : "payments"}</span>
                  </div>
                  <div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-px">
                    <div className="h-1.5 w-1.5 rotate-45 border-b border-r border-white/10 bg-[#0f1e21]/90" />
                  </div>
                </div>
              </motion.div>

              <span className={`font-num mt-3 text-[10px] font-medium uppercase tracking-wide transition-colors ${isHovered ? "text-white" : "text-white/30 group-hover:text-white/60"}`}>
                {m.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-[10px] border border-white/[0.06] bg-white/[0.02] px-3 py-2">
        <div className="size-1.5 rounded-full bg-emerald-300/60 animate-pulse" />
        <p className="text-[11px] leading-relaxed text-white/40">
          Based on each service&apos;s billing date — annual plans appear as a single spike in their renewal month.
        </p>
      </div>
    </div>
  );
}
