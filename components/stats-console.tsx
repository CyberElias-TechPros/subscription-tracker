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
        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="group relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#121f22]/80 backdrop-blur-2xl"
      >
        {/* Subtle inner glow */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-[80px] transition-all duration-700 group-hover:bg-emerald-400/15" />

        <div className="relative grid gap-0 lg:grid-cols-[1.5fr_1fr]">
          {/* Left: the number that matters */}
          <div className="relative p-7 sm:p-8 lg:p-10">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-[6px]" />
                <div className="relative flex size-5 items-center justify-center rounded-full bg-emerald-400/15 ring-1 ring-emerald-400/20">
                  <div className="animate-dot size-1.5 rounded-full bg-emerald-300" />
                </div>
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">True monthly spend</span>
              <div className="ml-2 hidden items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1 sm:flex">
                <TrendingUp className="size-3 text-white/40" />
                <span className="text-[10px] font-medium text-white/50">LIVE</span>
              </div>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <p className="font-num text-[52px] font-[700] leading-[0.9] tracking-[-0.04em] text-white sm:text-[64px]">
                {formatMoney(monthly, currency)}
              </p>
              <span className="font-num text-[14px] font-medium text-white/30">/mo</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                <span className="text-[11px] text-white/50">≈</span>
                <span className="font-num text-[13px] font-medium text-white/80">{formatMoney(yearly, currency, { maximumFractionDigits: 0 })}</span>
                <span className="text-[11px] text-white/40">per year</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                <div className="size-1 rounded-full bg-emerald-300" />
                <span className="font-num text-[12px] font-medium text-white/70">{stats.activeCount} active</span>
                {stats.pausedCount > 0 && (
                  <>
                    <span className="text-white/20">·</span>
                    <span className="text-[12px] text-white/40">{stats.pausedCount} paused</span>
                  </>
                )}
              </div>
            </div>

            {/* Burn-rate strip — premium segmented */}
            <div className="mt-8 grid grid-cols-3 overflow-hidden rounded-[14px] border border-white/[0.06] bg-black/20">
              {(
                [
                  ["Per day", stats.daily, "DAILY"],
                  ["Per week", stats.weekly, "WEEKLY"],
                  ["Per month", stats.monthly, "MONTHLY"],
                ] as const
              ).map(([label, amount, kicker], i) => (
                <div
                  key={label}
                  className={`group/burn relative flex flex-col items-center gap-1 px-3 py-4 transition-colors hover:bg-white/[0.03] ${i !== 0 ? "border-l border-white/[0.06]" : ""}`}
                >
                  <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">{kicker}</span>
                  <span className="font-num text-[15px] font-semibold text-white/90 tracking-tight">{formatMoney(amount, currency)}</span>
                  <span className="text-[10px] font-medium text-white/30">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: 30-day outlook + hog */}
          <div className="relative border-t border-white/[0.06] bg-black/10 p-7 sm:p-8 lg:border-l lg:border-t-0 lg:p-10 flex flex-col justify-center gap-6">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

            <div className="relative">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
                <Calendar className="size-3.5" />
                Next 30 days
              </div>
              <div className="mt-3 flex items-baseline gap-2.5">
                <p className="font-num text-[32px] font-bold tracking-tight text-white">{formatMoney(stats.upcomingTotal, currency)}</p>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/50">
                  {stats.upcoming.length} {stats.upcoming.length === 1 ? "payment" : "payments"}
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (stats.upcomingTotal / (stats.monthly * 1.5)) * 100)}%` }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-teal-300"
                />
              </div>
            </div>

            {stats.mostExpensive && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="group/hog relative overflow-hidden rounded-[16px] border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 transition-opacity group-hover/hog:opacity-100" />
                <div className="relative">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                    <Flame className="size-3.5 text-amber-300/70" />
                    Biggest line item
                  </div>
                  <div className="mt-2.5 flex items-center justify-between gap-3">
                    <span className="truncate text-[14px] font-semibold text-white">{stats.mostExpensive.name}</span>
                    <span className="font-num shrink-0 rounded-full bg-white px-2.5 py-1 text-[12px] font-bold text-black">
                      {formatMoney(monthlyEquivalent(stats.mostExpensive.cost, stats.mostExpensive.cycle), currency)}/mo
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ backgroundColor: getCategory(stats.mostExpensive.category).color }} />
                    <span className="text-[11px] text-white/45">
                      {getCategory(stats.mostExpensive.category).label} · {CYCLE_LABELS[stats.mostExpensive.cycle]} billing
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="relative flex items-center gap-2 rounded-[12px] border border-emerald-400/15 bg-emerald-400/10 px-3 py-2.5">
              <Zap className="size-3.5 text-emerald-300" />
              <p className="text-[11px] leading-relaxed text-emerald-200/70">
                <span className="font-semibold text-emerald-200">Smart insight:</span> You could save ~{formatMoney(stats.monthly * 0.15, currency)}/mo by reviewing quarterly plans.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
