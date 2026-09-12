"use client"

import * as React from "react"
import { toast } from "sonner"
import { FileDown, FileJson, FileUp, ShieldCheck, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTracker } from "@/components/tracker-provider"
import { CURRENCIES, isCurrency } from "@/lib/format"
import { downloadFile, exportFilename, parseImport, toCSV } from "@/lib/export"

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { state, currency, setCurrency, replaceAll, clearAll } = useTracker()
  const fileRef = React.useRef<HTMLInputElement>(null)
  const [pendingImport, setPendingImport] = React.useState<{ count: number; data: Parameters<typeof replaceAll>[0] } | null>(null)
  const [confirmClear, setConfirmClear] = React.useState(false)

  const subs = state.status === "ready" ? state.data.subscriptions : []

  const handleExportCsv = () => {
    downloadFile(exportFilename("csv"), toCSV(subs, currency), "text/csv;charset=utf-8")
    toast.success("CSV exported", { description: `${subs.length} subscriptions → ${exportFilename("csv")}` })
  }

  const handleExportJson = () => {
    if (state.status !== "ready") return
    downloadFile(
      exportFilename("json"),
      JSON.stringify(state.data, null, 2),
      "application/json",
    )
    toast.success("Backup saved", {
      description: "Keep this file — you can import it on any device.",
    })
  }

  const handleFile = async (file: File) => {
    const text = await file.text()
    const result = parseImport(text)
    if (result.status === "invalid") {
      toast.error("Couldn't read that file", {
        description: "Expected a Subscription Tracker backup (.json).",
      })
      return
    }
    setPendingImport({ count: result.count, data: result.data })
  }

  const confirmImport = () => {
    if (!pendingImport) return
    replaceAll(pendingImport.data)
    setPendingImport(null)
    if (fileRef.current) fileRef.current.value = ""
    toast.success(`Imported ${pendingImport.count} subscriptions`, {
      description: "Your previous list was replaced.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setPendingImport(null); setConfirmClear(false) } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings & data</DialogTitle>
          <DialogDescription>
            Currency, backups and privacy — everything lives in this browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency-select">Currency</Label>
            <Select
              value={currency}
              onValueChange={(v) => {
                if (isCurrency(v)) setCurrency(v)
              }}
            >
              <SelectTrigger id="currency-select" className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Applies to every amount. Values aren’t converted — one currency keeps the math honest.
            </p>
          </div>

          {/* Export */}
          <div className="space-y-2.5">
            <Label>Backups</Label>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCsv}>
                <FileDown aria-hidden="true" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportJson}>
                <FileJson aria-hidden="true" />
                Export JSON backup
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              CSV opens in any spreadsheet app; JSON is the full backup you can re-import later.
            </p>
          </div>

          {/* Import */}
          <div className="space-y-2.5">
            <Label>Import</Label>
            {pendingImport ? (
              <div className="rounded-xl border border-accent/40 bg-accent-soft p-3.5 text-sm">
                <p>
                  Replace your <strong>{subs.length}</strong> current subscription
                  {subs.length === 1 ? "" : "s"} with{" "}
                  <strong>{pendingImport.count}</strong> imported one
                  {pendingImport.count === 1 ? "" : "s"}?
                </p>
                <div className="mt-2.5 flex gap-2">
                  <Button size="sm" onClick={confirmImport}>
                    Replace everything
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setPendingImport(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  className="sr-only-x"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void handleFile(file)
                  }}
                />
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <FileUp aria-hidden="true" />
                  Import JSON backup…
                </Button>
                <p className="text-xs text-muted-foreground">
                  Replaces your current list after you confirm.
                </p>
              </>
            )}
          </div>

          {/* Privacy note */}
          <div className="flex gap-3 rounded-xl border border-border bg-background/50 p-3.5">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Private by design.</strong> Your subscriptions
              are stored only in this browser’s local storage. Nothing is uploaded, and clearing
              site data removes it — export a backup first.
            </p>
          </div>

          {/* Danger zone */}
          <div className="space-y-2.5 rounded-xl border border-destructive/30 p-3.5">
            <Label className="text-destructive">Danger zone</Label>
            {confirmClear ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    clearAll()
                    setConfirmClear(false)
                    onOpenChange(false)
                  }}
                >
                  <Trash2 aria-hidden="true" />
                  Yes, delete everything
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmClear(false)}>
                  Keep my data
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={() => setConfirmClear(true)}
              >
                <Trash2 aria-hidden="true" />
                Clear all data…
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
