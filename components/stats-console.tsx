"use client";

import { Flame, TrendingUp, Calendar, Zap } from "lucide-react";
import { useCountUp } from "@/hooks/use-count-up";
import { formatMoney } from "@/lib/format";
import { CYCLE_LABELS, getCategory, monthlyEquivalent, type Stats } from "@/lib/subscriptions";
import { motion } from "framer-motion";

export function StatsConsole({ stats, currency }: { stats: Stats; currency: string }) {
  const monthly = useCountUp(stats.monthly);
  const yearly = useCountUp(stats.yearly);

  return (
    <section aria-label="Spending summary" className="relative">
      <motion.div
        initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-md"
      >
        <div className="relative grid gap-0 lg:grid-cols-[1.5fr_1fr]">
          {/* Left — the number that matters */}
          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex items-center gap-2.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent/60 opacity-75" />
                <span className="animate-dot relative inline-flex size-2 rounded-full bg-accent" />
              </span>
              <span className="label-caps text-muted-foreground">True monthly spend</span>
              <span className="ml-1 hidden items-center gap-1 rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
                <TrendingUp className="size-3" />
                LIVE
              </span>
            </div>

            <div className="mt-5 flex items-baseline gap-2.5">
              <p className="font-num text-[48px] font-bold leading-[0.9] tracking-tight text-foreground sm:text-[60px]">
                {formatMoney(monthly, currency)}
              </p>
              <span className="font-num text-[14px] font-medium text-muted-foreground">/mo</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5">
                <span className="text-[11px] text-muted-foreground">≈</span>
                <span className="font-num text-[13px] font-semibold text-foreground">
                  {formatMoney(yearly, currency, { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[11px] text-muted-foreground">per year</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5">
                <span className="size-1.5 rounded-full bg-accent" />
                <span className="font-num text-[12px] font-semibold text-foreground">{stats.activeCount} active</span>
                {stats.pausedCount > 0 && (
                  <>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="text-[12px] text-muted-foreground">{stats.pausedCount} paused</span>
                  </>
                )}
              </div>
            </div>

            {/* Burn rate — segmented strip */}
            <div className="mt-8 grid grid-cols-3 overflow-hidden rounded-xl border border-border bg-surface-2">
              {(
                [
                  ["Per day", stats.daily, "DAILY"],
                  ["Per week", stats.weekly, "WEEKLY"],
                  ["Per month", stats.monthly, "MONTHLY"],
                ] as const
              ).map(([label, amount, kicker], i) => (
                <div
                  key={label}
                  className={`flex flex-col items-center gap-1 px-2 py-4 transition-colors hover:bg-card ${i !== 0 ? "border-l border-border" : ""}`}
                >
                  <span className="label-caps text-muted-foreground/60">{kicker}</span>
                  <span className="font-num text-[15px] font-semibold tracking-tight text-foreground">
                    {formatMoney(amount, currency)}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — outlook + biggest line item */}
          <div className="relative flex flex-col justify-center gap-5 border-t border-border bg-surface-2/60 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <Calendar className="size-3.5" />
                Next 30 days
              </div>
              <div className="mt-3 flex items-baseline gap-2.5">
                <p className="font-num text-[30px] font-bold tracking-tight text-foreground">
                  {formatMoney(stats.upcomingTotal, currency)}
                </p>
                <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {stats.upcoming.length} {stats.upcoming.length === 1 ? "payment" : "payments"}
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (stats.upcomingTotal / (stats.monthly * 1.5)) * 100)}%` }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                  className="h-full rounded-full bg-accent"
                />
              </div>
            </div>

            {stats.mostExpensive && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="rounded-xl border border-border bg-card p-4 shadow-xs"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <Flame className="size-3.5 text-warning" />
                  Biggest line item
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-3">
                  <span className="truncate text-[14px] font-semibold text-foreground">{stats.mostExpensive.name}</span>
                  <span className="font-num shrink-0 rounded-full bg-primary px-2.5 py-1 text-[12px] font-bold text-primary-foreground">
                    {formatMoney(monthlyEquivalent(stats.mostExpensive.cost, stats.mostExpensive.cycle), currency)}/mo
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ backgroundColor: getCategory(stats.mostExpensive.category).color }} />
                  <span className="text-[11px] text-muted-foreground">
                    {getCategory(stats.mostExpensive.category).label} · {CYCLE_LABELS[stats.mostExpensive.cycle]} billing
                  </span>
                </div>
              </motion.div>
            )}

            <div className="flex items-start gap-2 rounded-xl border border-accent/20 bg-accent-soft px-3 py-2.5">
              <Zap className="mt-0.5 size-3.5 shrink-0 text-accent" />
              <p className="text-[11px] leading-relaxed text-foreground/70">
                <span className="font-semibold text-accent">Smart insight:</span> You could save ~
                {formatMoney(stats.monthly * 0.15, currency)}/mo by reviewing quarterly plans.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
