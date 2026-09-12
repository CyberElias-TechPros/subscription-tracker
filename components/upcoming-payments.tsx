"use client"

import { CalendarClock } from "lucide-react"
import { formatDaysUntil, formatMoney } from "@/lib/format"
import { getCategory, type UpcomingPayment } from "@/lib/subscriptions"

/** Timeline of payments landing in the next 30 days. */
export function UpcomingPayments({ payments, currency }: { payments: UpcomingPayment[]; currency: string }) {
  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <CalendarClock className="size-5 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          No payments scheduled in the next 30 days.
        </p>
        <p className="max-w-xs text-xs text-muted-foreground/80">
          Add a billing date to a subscription and it will show up here.
        </p>
      </div>
    )
  }

  return (
    <ol className="divide-y divide-border/70">
      {payments.map(({ sub, date, daysUntil }, i) => {
        const urgent = daysUntil <= 3
        return (
          <li
            key={sub.id}
            className="animate-rise flex items-center gap-3.5 py-2.5 first:pt-0 last:pb-0"
            style={{ animationDelay: `${i * 45}ms` }}
          >
            {/* Date chip. */}
            <div
              className={`font-num flex size-11 shrink-0 flex-col items-center justify-center rounded-lg border text-[0.65rem] font-semibold uppercase leading-none ${
                urgent ? "border-accent/40 bg-accent-soft text-accent" : "border-border bg-background/60"
              }`}
              aria-hidden="true"
            >
              <span className="text-[0.6rem] opacity-80">
                {new Intl.DateTimeFormat("en-US", { month: "short" }).format(date)}
              </span>
              <span className="mt-0.5 text-sm">{date.getDate()}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-medium ${sub.paused ? "text-muted-foreground line-through" : ""}`}>
                {sub.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDaysUntil(daysUntil, date)}
                {sub.startDate ? "" : " · no billing date set"}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end">
              <span className="font-num text-sm font-semibold">{formatMoney(sub.cost, currency)}</span>
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full"
                style={{ backgroundColor: getCategory(sub.category).color }}
                title={getCategory(sub.category).label}
              />
            </div>
          </li>
        )
      })}
    </ol>
  )
}
