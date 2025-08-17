"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Subscription } from "@/app/page"

interface SubscriptionFormProps {
  onSubmit: (subscription: Omit<Subscription, "id">) => void
  onCancel: () => void
}

const categories = ["Streaming", "Music", "Software", "Gaming", "News", "Fitness", "Food", "Other"]

const categoryColors = {
  Streaming: "#ef4444",
  Music: "#8b5cf6",
  Software: "#3b82f6",
  Gaming: "#10b981",
  News: "#f59e0b",
  Fitness: "#ec4899",
  Food: "#f97316",
  Other: "#6b7280",
}

export function SubscriptionForm({ onSubmit, onCancel }: SubscriptionFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    cost: "",
    billingCycle: "monthly" as "monthly" | "yearly",
    category: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.cost || !formData.category) {
      return
    }

    onSubmit({
      name: formData.name,
      cost: Number.parseFloat(formData.cost),
      billingCycle: formData.billingCycle,
      category: formData.category,
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
