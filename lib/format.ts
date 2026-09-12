/** Currency + date formatting helpers. */

export const CURRENCIES = [
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "CAD", label: "Canadian Dollar" },
  { code: "AUD", label: "Australian Dollar" },
  { code: "JPY", label: "Japanese Yen" },
  { code: "CHF", label: "Swiss Franc" },
  { code: "SEK", label: "Swedish Krona" },
  { code: "INR", label: "Indian Rupee" },
  { code: "BRL", label: "Brazilian Real" },
  { code: "MXN", label: "Mexican Peso" },
  { code: "NZD", label: "New Zealand Dollar" },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]["code"]

export function isCurrency(value: unknown): value is CurrencyCode {
  return typeof value === "string" && CURRENCIES.some((c) => c.code === value)
}

export function formatMoney(
  amount: number,
  currency: string,
  opts: { maximumFractionDigits?: number; minimumFractionDigits?: number } = {},
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: opts.minimumFractionDigits,
    maximumFractionDigits: opts.maximumFractionDigits ?? (Math.abs(amount) >= 1000 && Number.isInteger(amount) ? 0 : 2),
  }).format(amount)
}

/** Compact money for chart axes: $1.2K, $18K … */
export function formatCompactMoney(amount: number, currency: string): string {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount)
  // Intl keeps a trailing ".0" for whole compacts ("18.0K") — trim it.
  return formatted.replace(/\.0(?=[KMB])/, "")
}

/** "Sep 18" style short date. */
export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date)
}

/** "Sep 18, 2027" style date. */
export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date)
}

/** Human label for a number of days in the future. */
export function formatDaysUntil(days: number, date: Date): string {
  if (days === 0) return "Today"
  if (days === 1) return "Tomorrow"
  if (days <= 7) return `In ${days} days`
  return formatShortDate(date)
}
