"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { categoryColors, categories, type Subscription, type Category } from "@/lib/subscriptions"

interface SubscriptionFormProps {
  onSubmit: (subscription: Omit<Subscription, "id">) => void
  onCancel: () => void
}

export function SubscriptionForm({ onSubmit, onCancel }: SubscriptionFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    cost: "",
    billingCycle: "monthly" as "monthly" | "yearly",
    category: "",
  })

  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = formData.name.trim()
    const cost = Number.parseFloat(formData.cost)
    if (!name || name.length > 80) return setError("Enter a service name up to 80 characters.")
    if (!Number.isFinite(cost) || cost <= 0 || cost > 1000000) return setError("Enter a valid cost greater than zero.")
    if (!formData.category) return setError("Choose a category.")
    setError("")

    onSubmit({
      name,
      cost,
      billingCycle: formData.billingCycle,
      category: formData.category as Category,
      color: categoryColors[formData.category as keyof typeof categoryColors],
    })

    setFormData({
      name: "",
      cost: "",
      billingCycle: "monthly",
      category: "",
    })
  }

  return (
    <Card>
      {error && <p role="alert" className="px-6 pt-4 text-sm text-destructive">{error}</p>}
      <CardHeader>
        <CardTitle>Add New Subscription</CardTitle>
        <CardDescription>Enter your subscription details to track your spending</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                placeholder="Netflix, Spotify, etc."
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="9.99"
                value={formData.cost}
                onChange={(e) => setFormData((prev) => ({ ...prev, cost: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Billing Cycle</Label>
              <Select
                value={formData.billingCycle}
                onValueChange={(value: "monthly" | "yearly") =>
                  setFormData((prev) => ({ ...prev, billingCycle: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: categoryColors[category as keyof typeof categoryColors] }}
                        />
                        {category}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Add Subscription
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
