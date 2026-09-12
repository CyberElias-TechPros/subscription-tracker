import { describe, expect, it } from "vitest"
import { formatCompactMoney, formatDaysUntil, formatMoney, formatShortDate, isCurrency } from "./format"

describe("formatMoney", () => {
  it("formats USD with cents", () => {
    expect(formatMoney(1234.5, "USD")).toBe("$1,234.50")
  })

  it("drops cents for large round amounts", () => {
    expect(formatMoney(12000, "USD")).toBe("$12,000")
  })

  it("respects zero-decimal currencies like JPY", () => {
    expect(formatMoney(1500, "JPY")).toBe("¥1,500")
  })

  it("formats EUR with the € symbol", () => {
    expect(formatMoney(9.99, "EUR")).toBe("€9.99")
  })
})

describe("formatCompactMoney", () => {
  it("compacts large values for chart axes", () => {
    expect(formatCompactMoney(1200, "USD")).toBe("$1.2K")
    expect(formatCompactMoney(18000, "USD")).toBe("$18K")
  })
})

describe("formatShortDate / formatDaysUntil", () => {
  it("formats short dates", () => {
    expect(formatShortDate(new Date(2026, 8, 18))).toBe("Sep 18")
  })

  it("labels relative days naturally", () => {
    const date = new Date(2026, 8, 15)
    expect(formatDaysUntil(0, date)).toBe("Today")
    expect(formatDaysUntil(1, date)).toBe("Tomorrow")
    expect(formatDaysUntil(5, date)).toBe("In 5 days")
    expect(formatDaysUntil(21, date)).toBe("Sep 15")
  })
})

describe("isCurrency", () => {
  it("accepts known codes and rejects others", () => {
    expect(isCurrency("USD")).toBe(true)
    expect(isCurrency("JPY")).toBe(true)
    expect(isCurrency("BTC")).toBe(false)
    expect(isCurrency(undefined)).toBe(false)
  })
})
