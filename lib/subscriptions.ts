import {
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  differenceInMilliseconds,
  isBefore,
  isValid,
  parseISO,
  startOfDay,
} from "date-fns"

/* ------------------------------------------------------------------ */
/* Billing cycles                                                      */
/* ------------------------------------------------------------------ */

export const CYCLES = ["weekly", "monthly", "quarterly", "yearly"] as const
export type Cycle = (typeof CYCLES)[number]

export const CYCLE_LABELS: Record<Cycle, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
}

export function isCycle(value: unknown): value is Cycle {
  return typeof value === "string" && (CYCLES as readonly string[]).includes(value)
}

/** Convert a per-cycle cost into its monthly equivalent. */
export function monthlyEquivalent(cost: number, cycle: Cycle): number {
  switch (cycle) {
    case "weekly":
      return (cost * 52) / 12
    case "monthly":
      return cost
    case "quarterly":
      return cost / 3
    case "yearly":
      return cost / 12
  }
}

/** Convert a per-cycle cost into its yearly equivalent. */
export function yearlyEquivalent(cost: number, cycle: Cycle): number {
  return monthlyEquivalent(cost, cycle) * 12
}

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export interface Category {
  id: string
  label: string
  /** Base color used for charts, chips and ledger spines. */
  color: string
}

export const CATEGORIES: Category[] = [
  { id: "streaming", label: "Streaming", color: "#E5484D" },
  { id: "music", label: "Music", color: "#8E63D3" },
  { id: "software", label: "Software", color: "#3E8FE0" },
  { id: "ai", label: "AI Tools", color: "#12A594" },
  { id: "gaming", label: "Gaming", color: "#46A758" },
  { id: "news", label: "News", color: "#D68700" },
  { id: "fitness", label: "Fitness", color: "#E5457F" },
  { id: "food", label: "Food", color: "#E2682B" },
  { id: "other", label: "Other", color: "#7C8B99" },
]

export const DEFAULT_CATEGORY_ID = "other"

export function getCategory(id: string): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1]
}

/**
 * Map a legacy (v0) category label like "Streaming" — or any free-form
 * string — onto a known category id, falling back to "other".
 */
export function normalizeCategory(raw: unknown): string {
  if (typeof raw !== "string") return DEFAULT_CATEGORY_ID
  const needle = raw.trim().toLowerCase()
  const byId = CATEGORIES.find((c) => c.id === needle)
  if (byId) return byId.id
  const byLabel = CATEGORIES.find((c) => c.label.toLowerCase() === needle)
  return byLabel?.id ?? DEFAULT_CATEGORY_ID
}

/* ------------------------------------------------------------------ */
/* Subscription model                                                  */
/* ------------------------------------------------------------------ */

export interface Subscription {
  id: string
  /** Service name, e.g. "Netflix". */
  name: string
  /** Cost per billing cycle, in the app-level currency. */
  cost: number
  cycle: Cycle
  /** Category id — see CATEGORIES. */
  category: string
  /** Optional free-form note. */
  notes?: string
  /**
   * Anchor date (ISO `yyyy-MM-dd`) the payment schedule counts from.
   * Optional — without it we can't project payment dates.
   */
  startDate?: string
  /** Paused subscriptions are kept but excluded from all totals. */
  paused: boolean
  createdAt: number
  updatedAt: number
}

export type SubscriptionDraft = Omit<Subscription, "id" | "createdAt" | "updatedAt" | "paused"> & {
  paused?: boolean
}

/* ------------------------------------------------------------------ */
/* Payment schedule                                                    */
/* ------------------------------------------------------------------ */

function parseStart(startDate?: string): Date | null {
  if (!startDate) return null
  const date = parseISO(startDate)
  return isValid(date) ? startOfDay(date) : null
}

function advance(date: Date, cycle: Cycle): Date {
  switch (cycle) {
    case "weekly":
      return addWeeks(date, 1)
    case "monthly":
      return addMonths(date, 1)
    case "quarterly":
      return addMonths(date, 3)
    case "yearly":
      return addYears(date, 1)
  }
}

/**
 * Next payment date on or after today, derived from the subscription's
 * start date and cycle. Returns `null` when no start date is set.
 *
 * Payments always anchor to the original start date (addMonths(start, k))
 * rather than advancing from the previous payment — this keeps month-end
 * anchors stable (Jan 31 → Feb 28 → Mar 31), matching how real billing
 * systems behave. A coarse diff jump keeps this constant-time even for
 * ancient start dates.
 */
export function nextPayment(sub: Subscription, now: Date = new Date()): Date | null {
  const start = parseStart(sub.startDate)
  if (!start) return null

  const today = startOfDay(now)
  if (!isBefore(start, today)) return start

  if (sub.cycle === "weekly") {
    const weekMs = 7 * 24 * 60 * 60 * 1000
    let weeks = Math.ceil(differenceInMilliseconds(today, start) / weekMs)
    let candidate = addWeeks(start, weeks)
    let guard = 0
    while (isBefore(candidate, today) && guard < 3) {
      weeks += 1
      candidate = addWeeks(start, weeks)
      guard += 1
    }
    return candidate
  }

  const step = sub.cycle === "monthly" ? 1 : sub.cycle === "quarterly" ? 3 : 12
  let k = Math.max(1, Math.ceil(differenceInCalendarMonthsApprox(today, start) / step)) * step
  let candidate = addMonths(start, k)
  let guard = 0
  while (isBefore(candidate, today) && guard < 4) {
    k += step
    candidate = addMonths(start, k)
    guard += 1
  }
  return candidate
}

function differenceInCalendarMonthsApprox(a: Date, b: Date): number {
  return (
    (a.getFullYear() - b.getFullYear()) * 12 + (a.getMonth() - b.getMonth())
  )
}

export interface UpcomingPayment {
  sub: Subscription
  date: Date
  daysUntil: number
}

/* ------------------------------------------------------------------ */
/* Stats & projections                                                 */
/* ------------------------------------------------------------------ */

export interface CategoryTotal {
  category: Category
  monthly: number
  share: number
}

export interface Stats {
  monthly: number
  yearly: number
  weekly: number
  daily: number
  activeCount: number
  pausedCount: number
  categoryTotals: CategoryTotal[]
  upcoming: UpcomingPayment[]
  /** Total amount landing in the next 30 days. */
  upcomingTotal: number
  mostExpensive: Subscription | null
}

export function activeSubscriptions(subs: Subscription[]): Subscription[] {
  return subs.filter((s) => !s.paused)
}

export function computeStats(subs: Subscription[], now: Date = new Date()): Stats {
  const active = activeSubscriptions(subs)
  const monthly = active.reduce((sum, s) => sum + monthlyEquivalent(s.cost, s.cycle), 0)

  const perCategory = new Map<string, number>()
  for (const sub of active) {
    perCategory.set(sub.category, (perCategory.get(sub.category) ?? 0) + monthlyEquivalent(sub.cost, sub.cycle))
  }
  const categoryTotals: CategoryTotal[] = [...perCategory.entries()]
    .map(([id, value]) => ({
      category: getCategory(id),
      monthly: value,
      share: monthly > 0 ? value / monthly : 0,
    }))
    .sort((a, b) => b.monthly - a.monthly)

  const today = startOfDay(now)
  const upcoming: UpcomingPayment[] = []
  for (const sub of active) {
    const date = nextPayment(sub, now)
    if (!date) continue
    const daysUntil = differenceInCalendarDays(date, today)
    if (daysUntil <= 30) {
      upcoming.push({ sub, date, daysUntil })
    }
  }
  upcoming.sort((a, b) => a.date.getTime() - b.date.getTime())

  const mostExpensive =
    active.length === 0
      ? null
      : active.reduce((max, s) =>
          monthlyEquivalent(s.cost, s.cycle) > monthlyEquivalent(max.cost, max.cycle) ? s : max,
        )

  return {
    monthly,
    yearly: monthly * 12,
    weekly: (monthly * 12) / 52,
    daily: (monthly * 12) / 365,
    activeCount: active.length,
    pausedCount: subs.length - active.length,
    categoryTotals,
    upcoming,
    upcomingTotal: upcoming.reduce((sum, u) => sum + u.sub.cost, 0),
    mostExpensive,
  }
}

export interface MonthProjection {
  label: string
  total: number
  /** Number of individual payments landing in the month. */
  payments: number
}

/**
 * Project actual payments per calendar month for the next `months` months.
 * Weekly subscriptions land ~4–5 times per month; yearly ones spike in
 * their anniversary month. This is deliberately *actual* timing rather
 * than a flat monthly average — it shows real cash-flow shape.
 */
export function projectMonths(
  subs: Subscription[],
  months = 12,
  now: Date = new Date(),
): MonthProjection[] {
  const active = activeSubscriptions(subs)
  const today = startOfDay(now)
  const horizonEnd = addMonths(today, months)

  const buckets = Array.from({ length: months }, () => ({ total: 0, payments: 0 }))
  const labels = Array.from({ length: months }, (_, i) =>
    new Intl.DateTimeFormat("en-US", { month: "short" }).format(addMonths(today, i)),
  )

  for (const sub of active) {
    let cursor = nextPayment(sub, now)
    // Subs without a start date still cost money — spread them as a flat
    // monthly equivalent so the projection never understates spend.
    if (!cursor) {
      const eq = monthlyEquivalent(sub.cost, sub.cycle)
      for (let i = 0; i < months; i++) {
        buckets[i].total += eq
        buckets[i].payments += 1
      }
      continue
    }
    while (cursor && isBefore(cursor, horizonEnd)) {
      const monthIndex =
        (cursor.getFullYear() - today.getFullYear()) * 12 + (cursor.getMonth() - today.getMonth())
      if (monthIndex >= 0 && monthIndex < months) {
        buckets[monthIndex].total += sub.cost
        buckets[monthIndex].payments += 1
      }
      cursor = advance(cursor, sub.cycle)
    }
  }

  return buckets.map((b, i) => ({ label: labels[i], ...b }))
}

/* ------------------------------------------------------------------ */
/* Query helpers (search / filter / sort)                              */
/* ------------------------------------------------------------------ */

export type SortKey = "cost-desc" | "cost-asc" | "name" | "next-payment" | "added-desc"

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "cost-desc", label: "Most expensive" },
  { value: "cost-asc", label: "Cheapest" },
  { value: "name", label: "Name (A–Z)" },
  { value: "next-payment", label: "Next payment" },
  { value: "added-desc", label: "Recently added" },
]

export function querySubscriptions(
  subs: Subscription[],
  options: { search?: string; category?: string | "all"; sort?: SortKey },
): Subscription[] {
  const search = options.search?.trim().toLowerCase()
  const list = subs.filter((sub) => {
    if (options.category && options.category !== "all" && sub.category !== options.category) {
      return false
    }
    if (search) {
      const haystack = `${sub.name} ${sub.notes ?? ""} ${getCategory(sub.category).label}`.toLowerCase()
      if (!haystack.includes(search)) return false
    }
    return true
  })

  const byMonthly = (s: Subscription) => monthlyEquivalent(s.cost, s.cycle)
  const sorted = [...list]
  switch (options.sort ?? "cost-desc") {
    case "cost-desc":
      sorted.sort((a, b) => byMonthly(b) - byMonthly(a))
      break
    case "cost-asc":
      sorted.sort((a, b) => byMonthly(a) - byMonthly(b))
      break
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name))
      break
    case "next-payment":
      sorted.sort((a, b) => {
        const da = nextPayment(a)?.getTime() ?? Number.POSITIVE_INFINITY
        const db = nextPayment(b)?.getTime() ?? Number.POSITIVE_INFINITY
        return da - db
      })
      break
    case "added-desc":
      sorted.sort((a, b) => b.createdAt - a.createdAt)
      break
  }
  return sorted
}
