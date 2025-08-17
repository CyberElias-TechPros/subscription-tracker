"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Download, Share2 } from "lucide-react"
import type { Subscription } from "@/app/page"
import { useToast } from "@/hooks/use-toast"

interface DashboardProps {
  subscriptions: Subscription[]
  onDelete: (id: string) => void
  totalMonthly: number
}

export function Dashboard({ subscriptions, onDelete, totalMonthly }: DashboardProps) {
  const { toast } = useToast()

  const generateShareText = () => {
    const text = `I'm paying $${totalMonthly.toFixed(2)}/month on subscriptions 😱\n\nThat's $${(totalMonthly * 12).toFixed(2)} per year!\n\nTrack yours: ${window.location.origin}`
    return text
  }

  const handleShare = async () => {
    const shareText = generateShareText()

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Subscription Spending",
          text: shareText,
        })
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareText)
        toast({
          title: "Copied to clipboard!",
          description: "Share text has been copied to your clipboard.",
        })
      } catch (err) {
        toast({
          title: "Share text",
          description: shareText,
          duration: 10000,
        })
      }
    }
  }

  const generatePDF = () => {
    const content = `
SUBSCRIPTION TRACKER REPORT
Generated on ${new Date().toLocaleDateString()}

SUMMARY
Monthly Total: $${totalMonthly.toFixed(2)}
Yearly Total: $${(totalMonthly * 12).toFixed(2)}
Active Subscriptions: ${subscriptions.length}

SUBSCRIPTIONS
${subscriptions
  .map((sub) => `• ${sub.name} - $${sub.cost.toFixed(2)}/${sub.billingCycle} (${sub.category})`)
  .join("\n")}

MONTHLY BREAKDOWN
${subscriptions
  .map((sub) => {
    const monthlyCost = sub.billingCycle === "yearly" ? sub.cost / 12 : sub.cost
    return `• ${sub.name}: $${monthlyCost.toFixed(2)}/month`
  })
  .join("\n")}
    `.trim()

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `subscription-report-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Report downloaded!",
      description: "Your subscription report has been saved.",
    })
  }

  const categoryTotals = subscriptions.reduce(
    (acc, sub) => {
      const monthlyCost = sub.billingCycle === "yearly" ? sub.cost / 12 : sub.cost
      acc[sub.category] = (acc[sub.category] || 0) + monthlyCost
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button onClick={handleShare} variant="outline" className="gap-2 bg-transparent">
          <Share2 className="h-4 w-4" />
          Share My Total
        </Button>
        <Button onClick={generatePDF} variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Viral Share Preview */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              I'm paying <span className="text-primary">${totalMonthly.toFixed(2)}/month</span> on subscriptions 😱
            </div>
            <div className="text-muted-foreground">
              That's <span className="font-semibold">${(totalMonthly * 12).toFixed(2)}</span> per year!
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>Monthly breakdown by subscription type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(categoryTotals).map(([category, total]) => (
              <div key={category} className="text-center">
                <div className="text-lg font-semibold">${total.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">{category}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Subscriptions</CardTitle>
          <CardDescription>Manage your active subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {subscriptions.map((subscription) => {
              const monthlyCost = subscription.billingCycle === "yearly" ? subscription.cost / 12 : subscription.cost

              return (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subscription.color }} />
                    <div>
                      <div className="font-medium">{subscription.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ${subscription.cost.toFixed(2)}/{subscription.billingCycle}
                        {subscription.billingCycle === "yearly" && ` (${monthlyCost.toFixed(2)}/month)`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{subscription.category}</Badge>
                    <div className="font-semibold">${monthlyCost.toFixed(2)}/mo</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(subscription.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
