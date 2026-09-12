import { z } from "zod"
import { DEFAULT_CATEGORY_ID, isCycle, normalizeCategory, type Subscription } from "./subscriptions"

/* ------------------------------------------------------------------ */
/* Schema                                                              */
/* ------------------------------------------------------------------ */

export const STORAGE_KEY = "subscription-tracker:v1"

/**
 * Key used by the original v0 app. We read (and migrate) it once, then
 * remove it so the data lives only in the current schema.
 */
export const LEGACY_STORAGE_KEY = "subscriptions"

export interface Settings {
  /** Single app-level currency — all amounts are entered in it. */
  currency: string
}

export interface AppData {
  version: 1
  subscriptions: Subscription[]
  settings: Settings
}

export function createAppData(subscriptions: Subscription[] = [], currency = "USD"): AppData {
  return { version: 1, subscriptions, settings: { currency } }
}

const subscriptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(80),
  cost: z.number().min(0).max(1_000_000),
  // Lenient on purpose: stored/imported data with an unknown cycle falls
  // back to "monthly" instead of discarding the whole record.
  cycle: z.string().transform((v) => (isCycle(v) ? v : "monthly")),
  category: z.string().transform((v) => normalizeCategory(v)),
  notes: z.string().max(280).nullish().transform((v) => v ?? undefined),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected yyyy-MM-dd")
    .nullish()
    .transform((v) => v ?? undefined),
  paused: z.boolean().default(false),
  createdAt: z.number().int().nonnegative().default(0),
  updatedAt: z.number().int().nonnegative().default(0),
})

const appDataSchema = z.object({
  version: z.literal(1),
  subscriptions: z.array(subscriptionSchema),
  settings: z.object({ currency: z.string() }),
})

/* ------------------------------------------------------------------ */
/* Read / write                                                        */
/* ------------------------------------------------------------------ */

export type StorageRead =
  | { status: "ok"; data: AppData; migrated: boolean }
  | { status: "empty" }
  | { status: "corrupt" }

function safeGetLocalStorage(): Storage | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null
    return window.localStorage
  } catch {
    // Private browsing modes can throw on access.
    return null
  }
}

/** Read persisted data, migrating the legacy v0 format if found. */
export function readStoredData(): StorageRead {
  const storage = safeGetLocalStorage()
  if (!storage) return { status: "empty" }

  let raw: string | null = null
  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch {
    return { status: "corrupt" }
  }

  if (raw) {
    const parsed = parseAppData(raw)
    if (parsed) return { status: "ok", data: parsed, migrated: false }
    // Unknown shape under the current key — nothing we can recover.
    return { status: "corrupt" }
  }

  // No current-format data: look for the legacy v0 payload.
  try {
    const legacyRaw = storage.getItem(LEGACY_STORAGE_KEY)
    if (legacyRaw) {
      const migrated = migrateLegacy(legacyRaw)
      if (migrated) {
        // Only drop the legacy key once the new format is safely written,
        // so a failed save (private mode/quota) can't destroy user data.
        if (saveAppData(migrated)) {
          storage.removeItem(LEGACY_STORAGE_KEY)
        }
        return { status: "ok", data: migrated, migrated: true }
      }
    }
  } catch {
    // Ignore legacy read errors — treat as empty.
  }

  return { status: "empty" }
}

/** Parse + validate a JSON string as AppData. Returns null when invalid. */
export function parseAppData(raw: string): AppData | null {
  try {
    const json: unknown = JSON.parse(raw)
    const result = appDataSchema.safeParse(json)
    return result.success ? (result.data as AppData) : null
  } catch {
    return null
  }
}

/** Persist data. Returns false when storage is unavailable/quota-full. */
export function saveAppData(data: AppData): boolean {
  const storage = safeGetLocalStorage()
  if (!storage) return false
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

/* ------------------------------------------------------------------ */
/* Legacy (v0) migration                                               */
/* ------------------------------------------------------------------ */

interface LegacySubscription {
  id?: string | number
  name?: string
  cost?: number | string
  billingCycle?: string
  category?: string
  color?: string
}

/**
 * Migrate the original v0 app's localStorage payload:
 * `Subscription[] { id, name, cost, billingCycle: "monthly"|"yearly", category, color }`
 */
export function migrateLegacy(raw: string): AppData | null {
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    return null
  }
  if (!Array.isArray(json) || json.length === 0) return null

  const now = Date.now()
  const subscriptions: Subscription[] = []
  for (const entry of json) {
    const legacy = entry as LegacySubscription
    if (typeof legacy.name !== "string" || !legacy.name.trim()) continue
    const cost = typeof legacy.cost === "number" ? legacy.cost : Number.parseFloat(String(legacy.cost ?? ""))
    if (!Number.isFinite(cost) || cost < 0) continue

    subscriptions.push({
      id: legacy.id != null ? String(legacy.id) : createId(),
      name: legacy.name.trim().slice(0, 80),
      cost,
      cycle: legacy.billingCycle === "yearly" ? "yearly" : "monthly",
      category: normalizeCategory(legacy.category ?? DEFAULT_CATEGORY_ID),
      paused: false,
      createdAt: now,
      updatedAt: now,
    })
  }
  if (subscriptions.length === 0) return null
  return createAppData(subscriptions)
}

/* ------------------------------------------------------------------ */
/* Ids (client-safe)                                                   */
/* ------------------------------------------------------------------ */

export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
