"use client"

import * as React from "react"
import { formatCompactMoney, formatMoney } from "@/lib/format"
import { projectMonths, type Subscription } from "@/lib/subscriptions"

/**
 * "Next 12 months" bar chart — actual payment timing, not a flat average.
 * Yearly subscriptions spike in their anniversary month; weekly ones show
 * 4–5 hits. Hand-built SVG-free (plain divs) for cheap GPU compositing.
 */
export function HorizonChart({ subscriptions, currency }: { subscriptions: Subscription[]; currency: string }) {
  const months = React.useMemo(() => projectMonths(subscriptions, 12), [subscriptions])
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const max = Math.max(...months.map((m) => m.total), 1)
  const total = months.reduce((sum, m) => sum + m.total, 0)
  const heaviest = months.reduce((max, m) => (m.total > max.total ? m : max), months[0])

  return (
    <div className="flex h-full flex-col">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="text-sm text-muted-foreground">
          Total over 12 months:{" "}
          <span className="font-num font-semibold text-foreground">
            {formatMoney(total, currency, { maximumFractionDigits: 0 })}
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          Heaviest: <span className="font-medium text-foreground">{heaviest?.label}</span>{" "}
          ({formatMoney(heaviest?.total ?? 0, currency, { maximumFractionDigits: 0 })})
        </p>
      </div>

      <div
        className="relative grid flex-1 grid-cols-12 items-end gap-1.5 sm:gap-2"
        role="img"
        aria-label={`Projected payments per month for the next year: ${months
          .map((m) => `${m.label} ${formatMoney(m.total, currency)}`)
          .join(", ")}`}
      >
        {/* Y-axis max label. */}
        <span className="font-num absolute -top-1 left-0 hidden -translate-y-full text-[0.6rem] text-muted-foreground/70 sm:block">
          {formatCompactMoney(max, currency)}
        </span>

        {months.map((m, i) => {
          const pct = mounted ? Math.max((m.total / max) * 100, m.total > 0 ? 3 : 0) : 0
          const isHeaviest = m === heaviest && m.total > 0
          return (
            <div key={i} className="group relative flex h-36 flex-col items-center justify-end sm:h-44">
              <div
                className={`bar-grow relative w-full rounded-t-[5px] transition-[height,colors] duration-500 ${
                  isHeaviest
                    ? "bg-gradient-to-t from-primary/50 to-primary"
                    : "bg-gradient-to-t from-accent/25 to-accent/70 group-hover:to-accent"
                }`}
                style={{ height: `${pct}%`, animationDelay: `${i * 55}ms` }}
              >
                {/* Tooltip on hover/focus. */}
                <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs font-medium opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                  <span className="font-num">{formatMoney(m.total, currency)}</span>
                  <span className="ml-1.5 text-muted-foreground">
                    · {m.payments} {m.payments === 1 ? "payment" : "payments"}
                  </span>
                </span>
              </div>
              <span className="font-num mt-2 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                {m.label}
              </span>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground/80">
        Based on each service’s billing date — annual plans appear as a single spike in their renewal month.
      </p>
    </div>
  )
}
