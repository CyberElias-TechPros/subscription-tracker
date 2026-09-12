"use client"

import { formatMoney } from "@/lib/format"
import type { Stats } from "@/lib/subscriptions"

/**
 * Signature moment: your year printed as a receipt.
 * Perforated edges, mono type, tear lines and a barcode — the whole
 * "your subscriptions are a bill" story in one artifact.
 */
export function ReceiptCard({ stats, currency }: { stats: Stats; currency: string }) {
  return (
    <div className="animate-rise" style={{ animationDelay: "80ms" }}>
      <div className="receipt mx-auto max-w-sm rounded-sm bg-card px-7 py-8 text-card-foreground shadow-xl shadow-black/10">
        <p className="font-num text-center text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Your year in subscriptions
        </p>
        <p className="font-num mt-1 text-center text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground/70">
          printed {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date())}
        </p>

        <div className="tear-line my-5" role="presentation" />

        {stats.categoryTotals.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Nothing to print yet.</p>
        ) : (
          <ul className="space-y-2.5">
            {stats.categoryTotals.map(({ category, monthly }) => (
              <li key={category.id} className="font-num flex items-baseline justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="truncate">{category.label}</span>
                </span>
                <span className="shrink-0 text-muted-foreground" aria-hidden="true">
                  {"·".repeat(Math.max(2, 26 - category.label.length - formatMoney(monthly, currency).length))}
                </span>
                <span className="shrink-0 tabular-nums">{formatMoney(monthly, currency)}/mo</span>
              </li>
            ))}
          </ul>
        )}

        <div className="tear-line my-5" role="presentation" />

        <dl className="font-num space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <dt>Items</dt>
            <dd>{stats.activeCount}</dd>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <dt>Subtotal / mo</dt>
            <dd>{formatMoney(stats.monthly, currency)}</dd>
          </div>
        </dl>

        <div className="tear-line my-4" role="presentation" />

        <div className="font-num text-center">
          <p className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">Total per year</p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-primary">
            {formatMoney(stats.yearly, currency, { maximumFractionDigits: 0 })}
          </p>
          <p className="mt-1.5 text-[0.65rem] text-muted-foreground">
            if nothing changes by {new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)))}
          </p>
        </div>

        <div className="barcode mx-auto mt-6 h-10 w-44 text-foreground/70" aria-hidden="true" />
        <p className="font-num mt-2 text-center text-[0.55rem] uppercase tracking-[0.3em] text-muted-foreground/60">
          keep this receipt
        </p>
      </div>
    </div>
  )
}
