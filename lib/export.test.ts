import { describe, expect, it } from "vitest"
import { buildShareText, toCSV } from "./export"
import { computeStats, type Subscription } from "./subscriptions"
import { createAppData } from "./storage"

const NOW = new Date("2026-09-12T10:00:00")

function makeSub(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: "s1",
    name: "Netflix",
    cost: 17.99,
    cycle: "monthly",
    category: "streaming",
    paused: false,
    createdAt: 1,
    updatedAt: 1,
    startDate: "2026-09-01",
    ...overrides,
  }
}

describe("toCSV", () => {
  it("escapes commas, quotes and newlines in text fields", () => {
    const csv = toCSV(
      [makeSub({ name: 'Fake, "Premium" Plan\nNetflix', notes: "shared, family" })],
      "USD",
    )
    // Quoted cells wrap the whole value, doubling inner quotes.
    expect(csv).toContain('"Fake, ""Premium"" Plan\nNetflix"')
    expect(csv).toContain('"shared, family"')
  })

  it("starts with a BOM and a stable header row", () => {
    const csv = toCSV([makeSub()], "USD")
    expect(csv.charCodeAt(0)).toBe(0xfeff)
    expect(csv.slice(1).split("\n")[0]).toBe(
      "Name,Cost,Currency,Billing Cycle,Monthly Equivalent,Category,Status,Next Payment,Notes",
    )
  })

  it("computes the monthly equivalent column correctly", () => {
    const csv = toCSV([makeSub({ cost: 120, cycle: "yearly" })], "USD")
    expect(csv).toContain("10.00")
  })
})

describe("buildShareText", () => {
  it("includes the formatted monthly and yearly totals and the URL", () => {
    const stats = computeStats(
      [makeSub({ cost: 25, cycle: "monthly" }), makeSub({ cost: 120, cycle: "yearly" })],
      NOW,
    )
    const text = buildShareText(stats, "USD", "https://example.com")
    expect(text).toContain("$35.00/month")
    expect(text).toContain("$420.00 a year")
    expect(text).toContain("across 2 services")
    expect(text).toContain("https://example.com")
  })
})

describe("createAppData", () => {
  it("builds a versioned payload", () => {
    const data = createAppData([makeSub()], "GBP")
    expect(data.version).toBe(1)
    expect(data.settings.currency).toBe("GBP")
    expect(data.subscriptions).toHaveLength(1)
  })
})
