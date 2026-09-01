export const STORAGE_KEY = "subscription-tracker:v1"
export const categories = ["Streaming", "Music", "Software", "Gaming", "News", "Fitness", "Food", "Other"] as const
export type Category = (typeof categories)[number]
export type BillingCycle = "monthly" | "yearly"

export interface Subscription {
  id: string
  name: string
  cost: number
  billingCycle: BillingCycle
  category: Category
  color: string
}

export const categoryColors: Record<Category, string> = {
  Streaming: "#ef4444", Music: "#8b5cf6", Software: "#3b82f6", Gaming: "#10b981",
  News: "#f59e0b", Fitness: "#ec4899", Food: "#f97316", Other: "#6b7280",
}

export function monthlyCost(subscription: Pick<Subscription, "cost" | "billingCycle">) {
  return subscription.billingCycle === "yearly" ? subscription.cost / 12 : subscription.cost
}

export function parseSubscriptions(raw: string | null): Subscription[] {
  if (!raw) return []
  try {
    const value: unknown = JSON.parse(raw)
    if (!Array.isArray(value)) return []
    return value.filter((item): item is Subscription => {
      if (!item || typeof item !== "object") return false
      const s = item as Partial<Subscription>
      return typeof s.id === "string" && typeof s.name === "string" && s.name.trim().length > 0 &&
        typeof s.cost === "number" && Number.isFinite(s.cost) && s.cost >= 0 &&
        (s.billingCycle === "monthly" || s.billingCycle === "yearly") &&
        typeof s.category === "string" && categories.includes(s.category as Category)
    }).map((s) => ({ ...s, name: s.name.trim(), color: categoryColors[s.category] }))
  } catch { return [] }
}
