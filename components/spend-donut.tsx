"use client"

import * as React from "react"
import { formatMoney } from "@/lib/format"
import type { CategoryTotal } from "@/lib/subscriptions"

/**
 * Hand-built SVG donut — no chart library. Segments sweep in via a
 * dasharray transition; the center carries the monthly total.
 */
export function SpendDonut({
  totals,
  currency,
  monthly,
}: {
  totals: CategoryTotal[]
  currency: string
  monthly: number
}) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const R = 15.9155 // circumference = 100 → dasharray math in %
  const C = 2 * Math.PI * R
  const GAP = totals.length > 1 ? 1.4 : 0 // degrees-ish gap between segments

  let offset = 0
  const segments = totals.map((t) => {
    const length = mounted ? Math.max(t.share * 100 - GAP, 0.6) : 0
    const seg = { ...t, length, offset }
    offset += t.share * 100
    return seg
  })

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative mx-auto size-44 shrink-0 sm:mx-0" role="img" aria-label={`Monthly spending by category: ${totals.map((t) => `${t.category.label} ${formatMoney(t.monthly, currency)}`).join(", ")}`}>
        <svg viewBox="0 0 40 40" className="size-full -rotate-90">
          {/* Track ring. */}
          <circle cx="20" cy="20" r={R} fill="none" stroke="var(--muted)" strokeWidth="5.5" />
          {segments.map((seg) => (
            <circle
              key={seg.category.id}
              className="donut-segment"
              cx="20"
              cy="20"
              r={R}
              fill="none"
              stroke={seg.category.color}
              strokeWidth="5.5"
              strokeLinecap={totals.length === 1 ? "butt" : "round"}
              strokeDasharray={`${(seg.length / 100) * C} ${C}`}
              strokeDashoffset={(-seg.offset / 100) * C}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-num text-lg font-bold leading-none">
            {formatMoney(monthly, currency, { maximumFractionDigits: 0 })}
          </span>
          <span className="mt-1 text-[0.6rem] font-medium uppercase tracking-widest text-muted-foreground">
            per month
          </span>
        </div>
      </div>

      {/* Legend */}
      <ul className="w-full space-y-2">
        {totals.map((t, i) => (
          <li
            key={t.category.id}
            className="animate-rise flex items-center justify-between gap-3 rounded-lg px-2 py-1 text-sm transition-colors hover:bg-secondary/50"
            style={{ animationDelay: `${120 + i * 60}ms` }}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-[4px]"
                style={{ backgroundColor: t.category.color }}
              />
              <span className="truncate font-medium">{t.category.label}</span>
            </span>
            <span className="font-num shrink-0 text-sm text-muted-foreground">
              {formatMoney(t.monthly, currency)}
              <span className="ml-2 text-xs text-muted-foreground/70">
                {Math.round(t.share * 100)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
