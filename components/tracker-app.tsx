"use client"

import * as React from "react"
import { Plus, Settings2, Share2 } from "lucide-react"
import { toast } from "sonner"
import { useTracker } from "@/components/tracker-provider"
import { StatsConsole } from "@/components/stats-console"
import { ReceiptCard } from "@/components/receipt-card"
import { SpendDonut } from "@/components/spend-donut"
import { HorizonChart } from "@/components/horizon-chart"
import { UpcomingPayments } from "@/components/upcoming-payments"
import { Ledger } from "@/components/ledger"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { useCountUp } from "@/hooks/use-count-up"
import { buildShareText, shareOrCopy } from "@/lib/export"
import { computeStats } from "@/lib/subscriptions"
import { SITE_URL } from "@/lib/site"

export function TrackerApp() {
  const { state, openAdd, openSettings, currency, anyOverlayOpen } = useTracker()

  // "n" opens the add dialog — quick capture for repeat entries.
  // Skipped while typing or when a dialog is already open.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "n" && !e.metaKey && !e.ctrlKey && !e.altKey && !anyOverlayOpen) {
        const target = e.target as HTMLElement
        if (["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName) || target?.isContentEditable) return
        e.preventDefault()
        openAdd()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [openAdd, anyOverlayOpen])

  if (state.status === "loading") {
    return <TrackerSkeleton />
  }

  const subscriptions = state.data.subscriptions

  if (subscriptions.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Action row */}
      <div className="flex flex-wrap items-center gap-2.5" data-print="hide">
        <Button onClick={openAdd} size="lg" className="shadow-sm">
          <Plus aria-hidden="true" />
          Add subscription
        </Button>
        <ShareButton />
        <Button variant="ghost" size="lg" onClick={openSettings} className="ml-auto">
          <Settings2 aria-hidden="true" />
          Settings & data
        </Button>
      </div>

      <DashboardBody subscriptions={subscriptions} currency={currency} />
    </div>
  )
}

function DashboardBody({
  subscriptions,
  currency,
}: {
  subscriptions: ReturnType<typeof useTracker>["state"]["data"]["subscriptions"]
  currency: string
}) {
  const stats = React.useMemo(() => computeStats(subscriptions), [subscriptions])

  return (
    <>
      <StatsConsole stats={stats} currency={currency} />

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <ReceiptCard stats={stats} currency={currency} />
        </div>
        <section
          aria-label="Next twelve months of payments"
          className="animate-rise rounded-2xl border border-border bg-card p-6 sm:p-8 lg:col-span-7"
          style={{ animationDelay: "140ms" }}
        >
          <h2 className="text-base font-semibold tracking-tight">The next 12 months</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            When the money actually leaves your account.
          </p>
          <div className="mt-6">
            <HorizonChart subscriptions={subscriptions} currency={currency} />
          </div>
        </section>
      </div>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-12">
        <section
          aria-label="Spending by category"
          className="animate-rise rounded-2xl border border-border bg-card p-6 sm:p-8 lg:col-span-5"
          style={{ animationDelay: "200ms" }}
        >
          <h2 className="text-base font-semibold tracking-tight">Where it goes</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Monthly equivalent, by category.</p>
          <div className="mt-6">
            <SpendDonut totals={stats.categoryTotals} currency={currency} monthly={stats.monthly} />
          </div>
        </section>

        <section
          aria-label="Upcoming payments"
          className="animate-rise rounded-2xl border border-border bg-card p-6 sm:p-8 lg:col-span-7"
          style={{ animationDelay: "240ms" }}
        >
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Due soon</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">Payments in the next 30 days.</p>
            </div>
            <p className="font-num text-sm text-muted-foreground">
              <span className="text-base font-semibold text-foreground">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency,
                  maximumFractionDigits: 0,
                }).format(stats.upcomingTotal)}
              </span>{" "}
              total
            </p>
          </div>
          <div className="mt-4">
            <UpcomingPayments payments={stats.upcoming} currency={currency} />
          </div>
        </section>
      </div>

      <Ledger subscriptions={subscriptions} />
    </>
  )
}

function ShareButton() {
  const { state, currency } = useTracker()
  const [busy, setBusy] = React.useState(false)
  const stats = React.useMemo(
    () => (state.status === "ready" ? computeStats(state.data.subscriptions) : null),
    [state],
  )
  const animatedMonthly = useCountUp(stats?.monthly ?? 0, 400)

  const onShare = async () => {
    if (!stats) return
    setBusy(true)
    const text = buildShareText(stats, currency, SITE_URL)
    const result = await shareOrCopy(text)
    setBusy(false)
    if (result === "copied") {
      toast.success("Copied to clipboard", {
        description: "Paste it anywhere — group chats love this one.",
      })
    } else if (result === "failed") {
      toast("Sharing isn’t available here", {
        description: `${new Intl.NumberFormat("en-US", { style: "currency", currency }).format(stats.monthly)}/mo across ${stats.activeCount} services.`,
        duration: 10000,
      })
    }
  }

  return (
    <Button variant="outline" size="lg" onClick={onShare} loading={busy}>
      <Share2 aria-hidden="true" />
      Share my total
      <span className="font-num ml-1 text-muted-foreground">
        ({new Intl.NumberFormat("en-US", { style: "currency", currency }).format(animatedMonthly)}/mo)
      </span>
    </Button>
  )
}

/** Mirrors the dashboard layout to keep first paint free of layout shift. */
function TrackerSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8" aria-busy="true" aria-label="Loading your subscriptions">
      <div className="flex gap-2.5">
        <div className="skeleton h-11 w-44" />
        <div className="skeleton h-11 w-40" />
      </div>
      <div className="skeleton h-64 rounded-2xl" />
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-12">
        <div className="skeleton h-96 rounded-2xl lg:col-span-5" />
        <div className="skeleton h-96 rounded-2xl lg:col-span-7" />
      </div>
      <div className="skeleton h-72 rounded-2xl" />
      <span className="sr-only-x">Loading…</span>
    </div>
  )
}
