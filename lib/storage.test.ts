import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  LEGACY_STORAGE_KEY,
  STORAGE_KEY,
  createAppData,
  migrateLegacy,
  parseAppData,
  readStoredData,
  saveAppData,
} from "./storage"
import type { Subscription } from "./subscriptions"

/** Minimal in-memory localStorage mock. */
function mockLocalStorage() {
  let store = new Map<string, string>()
  const storage: Storage = {
    get length() {
      return store.size
    },
    key: (i) => [...store.keys()][i] ?? null,
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => void store.set(k, String(v)),
    removeItem: (k) => void store.delete(k),
    clear: () => void (store = new Map()),
  }
  return { storage, store }
}

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
    ...overrides,
  }
}

const LEGACY_PAYLOAD = JSON.stringify([
  { id: "1", name: "Netflix", cost: 15.99, billingCycle: "monthly", category: "Streaming", color: "#ef4444" },
  { id: 2, name: "Adobe CC", cost: "659.88", billingCycle: "yearly", category: "Software", color: "#3b82f6" },
  { id: 3, name: "", cost: 5, billingCycle: "monthly", category: "Music", color: "#8b5cf6" }, // invalid → dropped
])

describe("migrateLegacy", () => {
  it("maps the v0 schema onto the current schema", () => {
    const data = migrateLegacy(LEGACY_PAYLOAD)
    expect(data).not.toBeNull()
    expect(data?.subscriptions).toHaveLength(2)

    const [netflix, adobe] = data!.subscriptions
    expect(netflix).toMatchObject({
      id: "1",
      name: "Netflix",
      cost: 15.99,
      cycle: "monthly",
      category: "streaming",
      paused: false,
    })
    // Numeric id coerced, string cost parsed, label normalized to id.
    expect(adobe).toMatchObject({ id: "2", cost: 659.88, cycle: "yearly", category: "software" })
  })

  it("returns null for non-array or empty payloads", () => {
    expect(migrateLegacy("not json")).toBeNull()
    expect(migrateLegacy("[]")).toBeNull()
    expect(migrateLegacy('{"a":1}')).toBeNull()
  })
})

describe("readStoredData / saveAppData", () => {
  beforeEach(() => {
    const { storage } = mockLocalStorage()
    vi.stubGlobal("window", { localStorage: storage })
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("round-trips current-format data", () => {
    const data = createAppData([makeSub()], "EUR")
    expect(saveAppData(data)).toBe(true)
    const result = readStoredData()
    expect(result.status).toBe("ok")
    if (result.status === "ok") {
      expect(result.data.subscriptions[0].name).toBe("Netflix")
      expect(result.data.settings.currency).toBe("EUR")
      expect(result.migrated).toBe(false)
    }
  })

  it("migrates legacy data once and removes the legacy key", () => {
    window.localStorage.setItem(LEGACY_STORAGE_KEY, LEGACY_PAYLOAD)
    const result = readStoredData()
    expect(result.status).toBe("ok")
    if (result.status === "ok") {
      expect(result.migrated).toBe(true)
      expect(result.data.subscriptions).toHaveLength(2)
    }
    expect(window.localStorage.getItem(LEGACY_STORAGE_KEY)).toBeNull()
    // Second read now comes from the current key.
    const again = readStoredData()
    expect(again.status === "ok" && again.migrated).toBe(false)
  })

  it("reports corrupt data instead of throwing", () => {
    window.localStorage.setItem(STORAGE_KEY, "{{{broken")
    const result = readStoredData()
    expect(result.status).toBe("corrupt")
  })

  it("reports empty when nothing is stored", () => {
    expect(readStoredData().status).toBe("empty")
  })
})

describe("parseAppData", () => {
  it("sanitizes unknown categories and cycles instead of rejecting the record", () => {
    const raw = JSON.stringify({
      version: 1,
      settings: { currency: "USD" },
      subscriptions: [
        { id: "x", name: "Weird", cost: 5, cycle: "fortnightly", category: "Mystery", createdAt: 1, updatedAt: 1 },
      ],
    })
    const parsed = parseAppData(raw!)
    expect(parsed?.subscriptions[0]).toMatchObject({ cycle: "monthly", category: "other" })
  })

  it("rejects out-of-range costs and non-object payloads", () => {
    const bad = JSON.stringify({
      version: 1,
      settings: { currency: "USD" },
      subscriptions: [{ id: "x", name: "Nope", cost: -5, cycle: "monthly" }],
    })
    expect(parseAppData(bad)).toBeNull()
    expect(parseAppData("null")).toBeNull()
  })
})
