"use client"

import { Flame } from "lucide-react"
import { useCountUp } from "@/hooks/use-count-up"
import { formatMoney } from "@/lib/format"
import { CYCLE_LABELS, getCategory, monthlyEquivalent, type Stats } from "@/lib/subscriptions"

/**
 * The console: one asymmetric card that answers "what am I actually
 * paying?" in a single glance. Big animated ledger number + burn rate +
 * 30-day outlook + the budget hog.
 */
export function StatsConsole({ stats, currency }: { stats: Stats; currency: string }) {
  const monthly = useCountUp(stats.monthly)
  const yearly = useCountUp(stats.yearly)

  return (
    <section
      aria-label="Spending summary"
      className="animate-rise relative overflow-hidden rounded-2xl border border-border bg-card"
    >
      {/* Hairline accent at the top of the console. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent"
      />
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:gap-0">
        {/* Left: the number that matters. */}
        <div className="lg:pr-8">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <span className="animate-dot size-1.5 rounded-full bg-accent" aria-hidden="true" />
            True monthly spend
          </div>
          <p className="font-num mt-3 text-5xl font-bold leading-none tracking-tight text-primary sm:text-6xl">
            {formatMoney(monthly, currency)}
          </p>
          <p className="font-num mt-3 text-sm text-muted-foreground">
            ≈ {formatMoney(yearly, currency, { maximumFractionDigits: 0 })} per year ·{" "}
            {stats.activeCount} active service{stats.activeCount === 1 ? "" : "s"}
            {stats.pausedCount > 0 && ` · ${stats.pausedCount} paused`}
          </p>

          {/* Burn-rate strip. */}
          <dl className="mt-6 grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-background/50">
            {(
              [
                ["Per day", stats.daily],
                ["Per week", stats.weekly],
                ["Per month", stats.monthly],
              ] as const
            ).map(([label, amount]) => (
              <div key={label} className="flex flex-col items-center gap-0.5 px-2 py-3">
                <dt className="order-2 text-[0.68rem] font-medium uppercase tracking-wider text-muted-foreground">
                  {label}
                </dt>
                <dd className="font-num order-1 text-sm font-semibold sm:text-base">
                  {formatMoney(amount, currency)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right: the 30-day outlook + the hog. */}
        <div className="flex flex-col justify-center gap-4 border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Next 30 days
            </h3>
            <p className="font-num mt-1.5 text-2xl font-semibold">
              {formatMoney(stats.upcomingTotal, currency)}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              across {stats.upcoming.length} payment{stats.upcoming.length === 1 ? "" : "s"}
            </p>
          </div>

          {stats.mostExpensive && (
            <div className="rounded-xl border border-border bg-background/50 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Flame className="size-3.5 text-accent" aria-hidden="true" />
                Biggest line item
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <span className="truncate text-sm font-medium">
                  {stats.mostExpensive.name}
                </span>
                <span className="font-num shrink-0 text-sm font-semibold text-primary">
                  {formatMoney(monthlyEquivalent(stats.mostExpensive.cost, stats.mostExpensive.cycle), currency)}/mo
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {getCategory(stats.mostExpensive.category).label} ·{" "}
                {CYCLE_LABELS[stats.mostExpensive.cycle]} billing
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
