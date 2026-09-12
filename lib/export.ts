import { CYCLE_LABELS, getCategory, monthlyEquivalent, type Stats, type Subscription } from "./subscriptions"
import { createAppData, migrateLegacy, parseAppData, type AppData } from "./storage"
import { formatMoney } from "./format"

/* ------------------------------------------------------------------ */
/* Downloads                                                           */
/* ------------------------------------------------------------------ */

export function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/** CSV export — includes a BOM so Excel opens UTF-8 correctly. */
export function toCSV(subs: Subscription[], currency: string): string {
  const header = [
    "Name",
    "Cost",
    "Currency",
    "Billing Cycle",
    "Monthly Equivalent",
    "Category",
    "Status",
    "Next Payment",
    "Notes",
  ]
  const rows = subs.map((sub) => {
    const next = sub.startDate ?? ""
    return [
      csvEscape(sub.name),
      sub.cost.toFixed(2),
      currency,
      CYCLE_LABELS[sub.cycle],
      monthlyEquivalent(sub.cost, sub.cycle).toFixed(2),
      csvEscape(getCategory(sub.category).label),
      sub.paused ? "Paused" : "Active",
      next,
      csvEscape(sub.notes ?? ""),
    ].join(",")
  })
  return `\uFEFF${header.join(",")}\n${rows.join("\n")}`
}

export function exportFilename(ext: "csv" | "json"): string {
  const date = new Date().toISOString().slice(0, 10)
  return `subscriptions-backup-${date}.${ext}`
}

/* ------------------------------------------------------------------ */
/* Import                                                              */
/* ------------------------------------------------------------------ */

export type ImportResult =
  | { status: "ok"; data: AppData; count: number; migrated: boolean }
  | { status: "invalid" }

/**
 * Accepts either the current backup format (AppData JSON) or a legacy v0
 * array export. Returns a fully-validated AppData ready to replace state.
 */
export function parseImport(text: string): ImportResult {
  const parsed = parseAppData(text)
  if (parsed) return { status: "ok", data: parsed, count: parsed.subscriptions.length, migrated: false }

  const migrated = migrateLegacy(text)
  if (migrated) return { status: "ok", data: migrated, count: migrated.subscriptions.length, migrated: true }

  // Also accept a bare array of current-format subscriptions.
  try {
    const json: unknown = JSON.parse(text)
    if (Array.isArray(json) && json.length > 0) {
      const candidate = createAppData(json as Subscription[])
      const validated = parseAppData(JSON.stringify(candidate))
      if (validated && validated.subscriptions.length > 0) {
        return { status: "ok", data: validated, count: validated.subscriptions.length, migrated: false }
      }
    }
  } catch {
    // fall through
  }

  return { status: "invalid" }
}

/* ------------------------------------------------------------------ */
/* Share                                                               */
/* ------------------------------------------------------------------ */

export function buildShareText(stats: Stats, currency: string, url: string): string {
  return [
    `I'm paying ${formatMoney(stats.monthly, currency)}/month on subscriptions.`,
    ``,
    `That's ${formatMoney(stats.yearly, currency)} a year, across ${stats.activeCount} services.`,
    ``,
    `Track yours → ${url}`,
  ].join("\n")
}

export async function shareOrCopy(text: string): Promise<"shared" | "copied" | "failed"> {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ title: "My subscription spending", text })
      return "shared"
    } catch {
      // User dismissed the share sheet — treat as cancelled, not an error.
      return "failed"
    }
  }
  try {
    await navigator.clipboard.writeText(text)
    return "copied"
  } catch {
    return "failed"
  }
}
