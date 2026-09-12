import { addDays } from "date-fns"
import type { Subscription } from "./subscriptions"
import { createAppData, createId, type AppData } from "./storage"

/**
 * A realistic starter dataset so first-time visitors can feel the value of
 * the product in one click. Start dates are computed relative to "today"
 * so the upcoming-payments timeline always has something to show.
 */
export function buildSampleData(): AppData {
  const now = Date.now()
  const iso = (d: Date) => d.toISOString().slice(0, 10)

  const entries: Array<
    Pick<Subscription, "name" | "cost" | "cycle" | "category" | "notes"> & { startOffsetDays: number }
  > = [
    { name: "Netflix", cost: 17.99, cycle: "monthly", category: "streaming", notes: "Standard with ads plan", startOffsetDays: -12 },
    { name: "Disney+", cost: 15.99, cycle: "monthly", category: "streaming", notes: "Premium, shared with family", startOffsetDays: -27 },
    { name: "Spotify Duo", cost: 16.99, cycle: "monthly", category: "music", notes: "", startOffsetDays: -4 },
    { name: "ChatGPT Plus", cost: 20, cycle: "monthly", category: "ai", notes: "", startOffsetDays: -19 },
    { name: "Claude Pro", cost: 25, cycle: "monthly", category: "ai", notes: "Annual review — consider a plan", startOffsetDays: -8 },
    { name: "iCloud+ 2TB", cost: 9.99, cycle: "monthly", category: "software", notes: "Family storage", startOffsetDays: -21 },
    { name: "Adobe Creative Cloud", cost: 659.88, cycle: "yearly", category: "software", notes: "Annual plan (photography)", startOffsetDays: -160 },
    { name: "The New York Times", cost: 75, cycle: "yearly", category: "news", notes: "", startOffsetDays: -300 },
    { name: "Planet Fitness", cost: 24.99, cycle: "monthly", category: "fitness", notes: "Black card", startOffsetDays: -2 },
    { name: "Nintendo Switch Online", cost: 39.99, cycle: "yearly", category: "gaming", notes: "Family plan", startOffsetDays: -95 },
    { name: "HelloFresh", cost: 62.94, cycle: "weekly", category: "food", notes: "3 meals/week — pause when travelling", startOffsetDays: -6 },
    { name: "Dropbox Plus", cost: 119.88, cycle: "yearly", category: "software", notes: "Legacy pricing", startOffsetDays: -340 },
  ]

  const subscriptions: Subscription[] = entries.map((entry) => {
    const start = addDays(new Date(), entry.startOffsetDays)
    return {
      id: createId(),
      name: entry.name,
      cost: entry.cost,
      cycle: entry.cycle,
      category: entry.category,
      notes: entry.notes || undefined,
      startDate: iso(start),
      paused: entry.name === "Dropbox Plus", // demonstrates the paused state
      createdAt: now,
      updatedAt: now,
    }
  })

  return createAppData(subscriptions)
}
