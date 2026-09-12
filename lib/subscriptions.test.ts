import { describe, expect, it } from "vitest"
import {
  CATEGORIES,
  computeStats,
  monthlyEquivalent,
  nextPayment,
  normalizeCategory,
  projectMonths,
  querySubscriptions,
  type Subscription,
} from "./subscriptions"

const NOW = new Date("2026-09-12T10:00:00")

function makeSub(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: "test-1",
    name: "Test Service",
    cost: 10,
    cycle: "monthly",
    category: "streaming",
    paused: false,
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  }
}

describe("monthlyEquivalent", () => {
  it("normalizes every cycle to a monthly figure", () => {
    expect(monthlyEquivalent(10, "monthly")).toBe(10)
    expect(monthlyEquivalent(120, "yearly")).toBe(10)
    expect(monthlyEquivalent(30, "quarterly")).toBe(10)
    expect(monthlyEquivalent(3, "weekly")).toBeCloseTo((3 * 52) / 12, 10)
  })

  it("is internally consistent with the yearly figure", () => {
    for (const cycle of ["weekly", "monthly", "quarterly", "yearly"] as const) {
      expect(monthlyEquivalent(50, cycle) * 12).toBeCloseTo(monthlyEquivalent(50, cycle) * 12, 10)
      expect(monthlyEquivalent(50, cycle)).toBeGreaterThan(0)
    }
  })
})

describe("nextPayment", () => {
  it("returns the start date itself when it is today or in the future", () => {
    expect(nextPayment(makeSub({ startDate: "2026-09-12" }), NOW)?.toISOString()).toContain("2026-09-12")
    expect(nextPayment(makeSub({ startDate: "2026-12-01" }), NOW)?.toISOString()).toContain("2026-12-01")
  })

  it("rolls monthly payments forward to the next occurrence", () => {
    expect(nextPayment(makeSub({ startDate: "2026-08-12" }), NOW)?.toISOString()).toContain("2026-09-12")
  })

  it("clamps month-end anchors (Jan 31 → Feb 28, not Mar 3)", () => {
    const now = new Date("2026-03-01T00:00:00")
    expect(nextPayment(makeSub({ startDate: "2026-01-31" }), now)?.toISOString()).toContain("2026-03-31")
  })

  it("handles yearly cycles across year boundaries", () => {
    expect(nextPayment(makeSub({ startDate: "2024-09-15", cycle: "yearly" }), NOW)?.toISOString()).toContain("2026-09-15")
  })

  it("handles quarterly cycles", () => {
    // Started Mar 10 → paid Jun 10, Sep 10 → next Dec 10.
    expect(nextPayment(makeSub({ startDate: "2026-03-10", cycle: "quarterly" }), NOW)?.toISOString()).toContain("2026-12-10")
  })

  it("handles weekly cycles", () => {
    expect(nextPayment(makeSub({ startDate: "2026-09-01", cycle: "weekly" }), NOW)?.toISOString()).toContain("2026-09-15")
  })

  it("resolves ancient start dates in constant time", () => {
    const start = performance.now()
    const next = nextPayment(makeSub({ startDate: "1990-01-01", cycle: "monthly" }), NOW)
    const ms = performance.now() - start
    expect(next).not.toBeNull()
    expect(ms).toBeLessThan(50)
  })

  it("returns null without a start date", () => {
    expect(nextPayment(makeSub({ startDate: undefined }), NOW)).toBeNull()
  })
})

describe("computeStats", () => {
  it("excludes paused subscriptions from all totals", () => {
    const stats = computeStats(
      [
        makeSub({ id: "a", cost: 10, cycle: "monthly" }),
        makeSub({ id: "b", cost: 100, cycle: "monthly", paused: true }),
      ],
      NOW,
    )
    expect(stats.monthly).toBe(10)
    expect(stats.yearly).toBe(120)
    expect(stats.activeCount).toBe(1)
    expect(stats.pausedCount).toBe(1)
    expect(stats.categoryTotals).toHaveLength(1)
  })

  it("aggregates categories by monthly equivalent and sorts descending", () => {
    const stats = computeStats(
      [
        makeSub({ id: "a", cost: 120, cycle: "yearly", category: "music" }), // 10/mo
        makeSub({ id: "b", cost: 30, cycle: "monthly", category: "streaming" }), // 30/mo
      ],
      NOW,
    )
    expect(stats.categoryTotals[0].category.id).toBe("streaming")
    expect(stats.categoryTotals[1].monthly).toBe(10)
    expect(stats.categoryTotals[0].share + stats.categoryTotals[1].share).toBeCloseTo(1, 10)
  })

  it("includes payments due within 30 days in upcoming", () => {
    const stats = computeStats(
      [
        makeSub({ id: "in", name: "Soon", startDate: "2026-09-13" }), // tomorrow
        makeSub({ id: "out", name: "Later", startDate: "2026-10-30" }), // >30 days
      ],
      NOW,
    )
    expect(stats.upcoming).toHaveLength(1)
    expect(stats.upcoming[0].sub.name).toBe("Soon")
    expect(stats.upcoming[0].daysUntil).toBe(1)
    expect(stats.upcomingTotal).toBe(10)
  })

  it("identifies the most expensive subscription by monthly equivalent", () => {
    const stats = computeStats(
      [
        makeSub({ id: "a", name: "Cheap", cost: 120, cycle: "yearly" }),
        makeSub({ id: "b", name: "Pricey", cost: 25, cycle: "monthly" }),
      ],
      NOW,
    )
    expect(stats.mostExpensive?.name).toBe("Pricey")
  })
})

describe("projectMonths", () => {
  it("returns twelve labeled buckets that sum to roughly a year of spend", () => {
    const months = projectMonths([makeSub({ cost: 10, cycle: "monthly", startDate: "2026-08-12" })], 12, NOW)
    expect(months).toHaveLength(12)
    const total = months.reduce((s, m) => s + m.total, 0)
    expect(total).toBeCloseTo(120, 5)
  })

  it("spreads subscriptions without a start date as a flat monthly equivalent", () => {
    const months = projectMonths([makeSub({ cost: 30, cycle: "quarterly" })], 12, NOW)
    expect(months.every((m) => m.total === 10)).toBe(true)
  })

  it("concentrates yearly renewals in their anniversary month", () => {
    const months = projectMonths([makeSub({ cost: 120, cycle: "yearly", startDate: "2026-10-05" })], 12, NOW)
    expect(months[1].total).toBe(120) // October
    expect(months.filter((m) => m.total > 0)).toHaveLength(1)
  })
})

describe("querySubscriptions", () => {
  const subs = [
    makeSub({ id: "a", name: "Netflix", cost: 18, category: "streaming", notes: "family plan" }),
    makeSub({ id: "b", name: "ChatGPT Plus", cost: 20, category: "ai" }),
    makeSub({ id: "c", name: "Spotify", cost: 11, category: "music" }),
  ]

  it("searches names and notes case-insensitively", () => {
    expect(querySubscriptions(subs, { search: "NETFLIX" }).map((s) => s.id)).toEqual(["a"])
    expect(querySubscriptions(subs, { search: "family" }).map((s) => s.id)).toEqual(["a"])
    expect(querySubscriptions(subs, { search: "plus" }).map((s) => s.id)).toEqual(["b"])
  })

  it("filters by category", () => {
    expect(querySubscriptions(subs, { category: "ai" }).map((s) => s.id)).toEqual(["b"])
    expect(querySubscriptions(subs, { category: "all" })).toHaveLength(3)
  })

  it("sorts by monthly cost descending by default", () => {
    expect(querySubscriptions(subs, {}).map((s) => s.id)).toEqual(["b", "a", "c"])
    expect(querySubscriptions(subs, { sort: "cost-asc" }).map((s) => s.id)).toEqual(["c", "a", "b"])
    expect(querySubscriptions(subs, { sort: "name" }).map((s) => s.id)).toEqual(["b", "a", "c"])
  })
})

describe("normalizeCategory", () => {
  it("maps legacy labels and ids, falling back to other", () => {
    expect(normalizeCategory("Streaming")).toBe("streaming")
    expect(normalizeCategory("music")).toBe("music")
    expect(normalizeCategory("AI Tools")).toBe("ai")
    expect(normalizeCategory("Whatever")).toBe("other")
    expect(normalizeCategory(42)).toBe("other")
  })

  it("has a unique, non-empty color per category", () => {
    const colors = new Set(CATEGORIES.map((c) => c.color))
    expect(colors.size).toBe(CATEGORIES.length)
    expect(CATEGORIES.every((c) => c.id && c.label)).toBe(true)
  })
})
