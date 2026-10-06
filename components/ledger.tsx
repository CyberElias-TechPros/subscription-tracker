"use client";

import * as React from "react";
import { Pause, Pencil, Play, SearchX, Search, Trash2, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTracker } from "@/components/tracker-provider";
import { formatMoney, formatShortDate } from "@/lib/format";
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
} from "@/lib/subscriptions";
import { motion, AnimatePresence } from "framer-motion";

export function Ledger({ subscriptions }: { subscriptions: Subscription[] }) {
  const { openEdit, deleteSubscription, togglePaused, currency, anyOverlayOpen } = useTracker();
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<string>("all");
  const [sort, setSort] = React.useState<SortKey>("cost-desc");

  const searchRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !anyOverlayOpen && !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [anyOverlayOpen]);

  const rows = React.useMemo(() => querySubscriptions(subscriptions, { search, category, sort }), [subscriptions, search, category, sort]);
  const activeCategories = React.useMemo(() => CATEGORIES.filter((c) => subscriptions.some((s) => s.category === c.id)), [subscriptions]);
  const hasFilters = search.trim() !== "" || category !== "all";

  return (
    <section aria-label="Your subscriptions" className="relative">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:p-5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subscriptions…  (press / )"
              className="h-10 rounded-full pl-10 pr-4"
              aria-label="Search subscriptions"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-10 w-[150px] rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All categories</SelectItem>
                {activeCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="h-10 w-[160px] rounded-full">
                <ArrowUpDown className="size-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
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
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full border border-border bg-surface-2">
              <SearchX className="size-5 text-muted-foreground" aria-hidden="true" />
            </div>
            {hasFilters ? (
              <>
                <p className="text-[14px] font-medium text-foreground">No subscriptions match</p>
                <p className="text-[13px] text-muted-foreground">Try a different search or filter.</p>
                <Button variant="outline" size="sm" className="mt-2 rounded-full" onClick={() => { setSearch(""); setCategory("all"); }}>
                  Clear filters
                </Button>
              </>
            ) : (
              <p className="text-[13px] text-muted-foreground">Nothing here yet.</p>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {rows.map((sub, i) => (
                <motion.li
                  key={sub.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, delay: i * 0.015, ease: [0.22, 1, 0.36, 1] }}
                >
                  <LedgerRow sub={sub} currency={currency} onEdit={() => openEdit(sub)} onDelete={() => deleteSubscription(sub)} onTogglePause={() => togglePaused(sub)} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}

        {/* Footer count */}
        <div className="flex items-center justify-between border-t border-border bg-surface-2/60 px-5 py-3">
          <p className="label-caps text-muted-foreground/70">
            {rows.length} {rows.length === 1 ? "subscription" : "subscriptions"} · {subscriptions.filter((s) => !s.paused).length} active
          </p>
          <p className="hidden text-[11px] text-muted-foreground/50 sm:block">Press N to add · / to search</p>
        </div>
      </div>
    </section>
  );
}

function LedgerRow({
  sub,
  currency,
  onEdit,
  onDelete,
  onTogglePause,
}: {
  sub: Subscription;
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePause: () => void;
}) {
  const cat = getCategory(sub.category);
  const monthly = monthlyEquivalent(sub.cost, sub.cycle);
  const next = nextPayment(sub);

  return (
    <div className="group relative flex items-center gap-4 px-4 py-3.5 transition-colors duration-200 hover:bg-surface-2/70 sm:px-5">
      {/* Category spine */}
      <div
        className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-full transition-all duration-300 group-hover:h-10"
        style={{ backgroundColor: sub.paused ? "var(--border-strong)" : cat.color }}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`truncate text-[14px] font-medium tracking-tight ${sub.paused ? "text-muted-foreground" : "text-foreground"}`}>
            {sub.name}
          </span>
          <Badge
            className="border-0 px-2 py-0 text-[10px] font-medium"
            style={{ backgroundColor: `${cat.color}14`, color: cat.color }}
          >
            <span className="size-1 rounded-full" style={{ backgroundColor: cat.color }} />
            {cat.label}
          </Badge>
          {sub.paused && (
            <Badge className="border-warning/25 bg-warning/10 px-2 py-0 text-[10px] text-warning">Paused</Badge>
          )}
        </div>
        <p className="font-num mt-1 truncate text-[12px] text-muted-foreground">
          {formatMoney(sub.cost, currency)} / {CYCLE_LABELS[sub.cycle].toLowerCase()}
          {next ? ` · next ${formatShortDate(next)}` : " · no date"}
          {sub.notes ? ` · ${sub.notes.slice(0, 40)}` : ""}
        </p>
      </div>

      <div className="text-right">
        <p className={`font-num text-[14px] font-semibold tracking-tight ${sub.paused ? "text-muted-foreground/60 line-through" : "text-foreground"}`}>
          {formatMoney(monthly, currency)}
          <span className="ml-1 text-[10px] font-normal text-muted-foreground">/mo</span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1 transition-opacity duration-200 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
        <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label={`Edit ${sub.name}`} className="rounded-full text-muted-foreground hover:text-foreground">
          <Pencil className="size-3.5" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onTogglePause} aria-label={sub.paused ? `Resume ${sub.name}` : `Pause ${sub.name}`} className="rounded-full text-muted-foreground hover:text-foreground">
          {sub.paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          aria-label={`Delete ${sub.name}`}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
