"use client"

import * as React from "react"
import { Pause, Pencil, Play, SearchX, Search, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTracker } from "@/components/tracker-provider"
import { formatMoney, formatShortDate } from "@/lib/format"
import {
  CATEGORIES,
  CYCLE_LABELS,
  SORT_OPTIONS,
  getCategory,
  monthlyEquivalent,
  nextPayment,
  querySubscriptions,
  type SortKey,
  type Subscription,
} from "@/lib/subscriptions"

export function Ledger({ subscriptions }: { subscriptions: Subscription[] }) {
  const { openEdit, deleteSubscription, togglePaused, currency, anyOverlayOpen } = useTracker()
  const [search, setSearch] = React.useState("")
  const [category, setCategory] = React.useState<string>("all")
  const [sort, setSort] = React.useState<SortKey>("cost-desc")

  const searchRef = React.useRef<HTMLInputElement>(null)
  // "/" focuses search — power-user nicety (not while typing or in dialogs).
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !anyOverlayOpen &&
        !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [anyOverlayOpen])

  const rows = React.useMemo(
    () => querySubscriptions(subscriptions, { search, category, sort }),
    [subscriptions, search, category, sort],
  )
  const activeCategories = React.useMemo(
    () => CATEGORIES.filter((c) => subscriptions.some((s) => s.category === c.id)),
    [subscriptions],
  )
  const hasFilters = search.trim() !== "" || category !== "all"

  return (
    <section aria-label="Your subscriptions" className="animate-rise" style={{ animationDelay: "160ms" }}>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:p-5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subscriptions…  (press / )"
              className="pl-9"
              aria-label="Search subscriptions"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[9.5rem]" aria-label="Filter by category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {activeCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="size-2 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      {c.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-[10.5rem]" aria-label="Sort subscriptions">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Rows */}
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <SearchX className="size-6 text-muted-foreground" aria-hidden="true" />
            {hasFilters ? (
              <>
                <p className="text-sm font-medium">No subscriptions match</p>
                <p className="text-sm text-muted-foreground">Try a different search or filter.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("")
                    setCategory("all")
                  }}
                >
                  Clear filters
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Nothing here yet.</p>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-border/70">
            {rows.map((sub, i) => (
              <LedgerRow
                key={sub.id}
                sub={sub}
                index={i}
                currency={currency}
                onEdit={() => openEdit(sub)}
                onDelete={() => deleteSubscription(sub)}
                onTogglePause={() => togglePaused(sub)}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function LedgerRow({
  sub,
  index,
  currency,
  onEdit,
  onDelete,
  onTogglePause,
}: {
  sub: Subscription
  index: number
  currency: string
  onEdit: () => void
  onDelete: () => void
  onTogglePause: () => void
}) {
  const cat = getCategory(sub.category)
  const monthly = monthlyEquivalent(sub.cost, sub.cycle)
  const next = nextPayment(sub)

  return (
    <li
      className="animate-rise group relative flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-secondary/40 sm:gap-4 sm:px-5"
      style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
    >
      {/* Category color spine. */}
      <span
        aria-hidden="true"
        className="absolute inset-y-2 left-0 w-[3px] rounded-full transition-all duration-200 group-hover:inset-y-1"
        style={{ backgroundColor: sub.paused ? "transparent" : cat.color }}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className={`truncate font-medium ${sub.paused ? "text-muted-foreground" : ""}`}>
            {sub.name}
          </span>
          <Badge color={cat.color}>{cat.label}</Badge>
          {sub.paused && (
            <Badge className="border-warning/40 bg-warning/10 text-warning">Paused</Badge>
          )}
        </div>
        <p className="font-num mt-1 truncate text-xs text-muted-foreground">
          {formatMoney(sub.cost, currency)} / {CYCLE_LABELS[sub.cycle].toLowerCase()}
          {next ? ` · next ${formatShortDate(next)}` : " · no billing date"}
          {sub.notes ? ` · ${sub.notes}` : ""}
        </p>
      </div>

      <div className="text-right">
        <p className={`font-num text-sm font-semibold ${sub.paused ? "text-muted-foreground/60 line-through" : ""}`}>
          {formatMoney(monthly, currency)}
          <span className="ml-1 text-[0.65rem] font-normal text-muted-foreground">/mo</span>
        </p>
      </div>

      {/* Row actions: visible on hover (pointer) and always (touch/no-hover). */}
      <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity duration-200 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onEdit}
          aria-label={`Edit ${sub.name}`}
          title="Edit"
        >
          <Pencil aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onTogglePause}
          aria-label={sub.paused ? `Resume ${sub.name}` : `Pause ${sub.name}`}
          title={sub.paused ? "Resume" : "Pause"}
        >
          {sub.paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          aria-label={`Delete ${sub.name}`}
          title="Delete"
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
    </li>
  )
}
