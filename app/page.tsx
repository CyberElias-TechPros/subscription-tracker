"use client"

import { useState, useEffect } from "react"
import { SubscriptionForm } from "@/components/subscription-form"
import { parseSubscriptions, STORAGE_KEY, type Subscription } from "@/lib/subscriptions"
import { Dashboard } from "@/components/dashboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Calculator } from "lucide-react"

export default function Home() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [showForm, setShowForm] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load subscriptions from localStorage on mount
  useEffect(() => {
    setSubscriptions(parseSubscriptions(localStorage.getItem(STORAGE_KEY)))
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever subscriptions change
  useEffect(() => {
    if (isLoaded) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions)) } catch { /* Storage may be unavailable or full; UI remains usable. */ }
    }
  }, [subscriptions, isLoaded])

  const addSubscription = (subscription: Omit<Subscription, "id">) => {
    const newSubscription = {
      ...subscription,
      id: Date.now().toString(),
    }
    setSubscriptions((prev) => [...prev, newSubscription])
    setShowForm(false)
  }

  const deleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((sub) => sub.id !== id))
  }

  const totalMonthly = subscriptions.reduce((total, sub) => {
    return total + (sub.billingCycle === "yearly" ? sub.cost / 12 : sub.cost)
  }, 0)

  if (!isLoaded) {
    return <div className="min-h-screen bg-background" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calculator className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Subscription Tracker
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">Discover how much you're really spending on subscriptions</p>
        </div>

        {subscriptions.length === 0 && !showForm ? (
          // Empty state
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle className="text-2xl">No subscriptions yet</CardTitle>
              <CardDescription className="text-lg">
                Add your first subscription to see your monthly spending
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowForm(true)} size="lg" className="gap-2">
                <PlusCircle className="h-5 w-5" />
                Add Your First Subscription
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-primary">${totalMonthly.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">Monthly Total</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-primary">${(totalMonthly * 12).toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">Yearly Total</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-primary">{subscriptions.length}</div>
                  <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                </CardContent>
              </Card>
            </div>

            {/* Add Subscription Button */}
            <div className="flex justify-center mb-8">
              <Button onClick={() => setShowForm(true)} className="gap-2" variant={showForm ? "outline" : "default"}>
                <PlusCircle className="h-4 w-4" />
                {showForm ? "Cancel" : "Add Subscription"}
              </Button>
            </div>

            {/* Subscription Form */}
            {showForm && (
              <div className="mb-8">
                <SubscriptionForm onSubmit={addSubscription} onCancel={() => setShowForm(false)} />
              </div>
            )}

            {/* Dashboard */}
            {subscriptions.length > 0 && (
              <Dashboard subscriptions={subscriptions} onDelete={deleteSubscription} totalMonthly={totalMonthly} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
