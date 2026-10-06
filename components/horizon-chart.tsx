"use client";

import * as React from "react";
import { formatMoney } from "@/lib/format";
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
          <p className="text-[13px] text-muted-foreground">
            Total over 12 months:{" "}
            <span className="font-num text-[15px] font-semibold text-foreground">
              {formatMoney(total, currency, { maximumFractionDigits: 0 })}
            </span>
          </p>
          <div className="hidden h-3 w-px bg-border sm:block" />
          <p className="hidden text-[12px] text-muted-foreground sm:block">
            Avg <span className="font-num font-medium text-foreground">{formatMoney(total / 12, currency, { maximumFractionDigits: 0 })}/mo</span>
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Heaviest: <span className="font-medium text-foreground">{heaviest?.label}</span>{" "}
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
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: `${pct}%`, opacity: 1 }}
                transition={{ duration: 0.8, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className={`relative w-full rounded-t-[5px] transition-colors duration-300 ${
                  isHeaviest
                    ? "bg-accent"
                    : isHovered
                      ? "bg-foreground/35"
                      : "bg-foreground/15 group-hover:bg-foreground/25"
                }`}
                style={{ minHeight: m.total > 0 ? 4 : 0 }}
              >
                {/* Tooltip */}
                <div
                  className={`pointer-events-none absolute -top-2 left-1/2 z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-border bg-popover px-3 py-2 text-xs font-medium shadow-lg transition-all duration-200 ${
                    isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-num font-semibold text-foreground">{formatMoney(m.total, currency)}</span>
                    <span className="text-muted-foreground/50">·</span>
                    <span className="text-muted-foreground">
                      {m.payments} {m.payments === 1 ? "payment" : "payments"}
                    </span>
                  </div>
                  <div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-px">
                    <div className="size-1.5 rotate-45 border-b border-r border-border bg-popover" />
                  </div>
                </div>
              </motion.div>

              <span
                className={`font-num mt-3 text-[10px] font-medium uppercase tracking-wide transition-colors ${
                  isHovered ? "text-foreground" : "text-muted-foreground/60 group-hover:text-muted-foreground"
                }`}
              >
                {m.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Baseline */}
      <div className="mt-1 h-px w-full bg-border" />

      <div className="mt-5 flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2">
        <span className="size-1.5 shrink-0 rounded-full bg-accent" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Based on each service&apos;s billing date — annual plans appear as a single spike in their renewal month.
        </p>
      </div>
    </div>
  );
}
