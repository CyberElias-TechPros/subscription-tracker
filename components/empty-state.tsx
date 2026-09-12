"use client"

import { Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogoMark } from "@/components/logo"
import { useTracker } from "@/components/tracker-provider"

/** First-run experience: get to value in one click. */
export function EmptyState() {
  const { openAdd, loadSample } = useTracker()

  return (
    <div className="animate-rise relative overflow-hidden rounded-2xl border border-border bg-card">
      <div className="bg-graph absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative flex flex-col items-center px-6 py-16 text-center sm:py-20">
        <LogoMark className="size-12" />
        <h2 className="mt-5 text-2xl font-semibold tracking-tight">Your ledger is empty</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Add the first subscription you pay for — Netflix, iCloud, the gym, anything recurring —
          and watch the real total appear. Or take the tour with realistic data first.
        </p>

        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
          <Button size="lg" onClick={openAdd}>
            <Plus aria-hidden="true" />
            Add your first subscription
          </Button>
          <Button size="lg" variant="outline" onClick={loadSample}>
            <Sparkles aria-hidden="true" />
            Load sample data
          </Button>
        </div>

        <ul className="mt-10 grid w-full max-w-2xl gap-3 text-left sm:grid-cols-3">
          {[
            ["Private by design", "Data never leaves your browser"],
            ["Every billing cycle", "Weekly → yearly, normalized for you"],
            ["Yours to keep", "Export CSV or a JSON backup any time"],
          ].map(([title, body]) => (
            <li key={title} className="rounded-xl border border-border/70 bg-background/60 p-3.5">
              <p className="text-sm font-medium">{title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
