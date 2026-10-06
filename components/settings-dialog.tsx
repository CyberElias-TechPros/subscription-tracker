"use client";

import * as React from "react";
import { toast } from "sonner";
import { FileDown, FileJson, FileUp, ShieldCheck, Trash2, Cloud, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTracker } from "@/components/tracker-provider";
import { useAuth } from "@/hooks/use-auth";
import { CURRENCIES, isCurrency } from "@/lib/format";
import { downloadFile, exportFilename, parseImport, toCSV } from "@/lib/export";
import { statsApi } from "@/lib/api-client";

export function SettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { state, currency, setCurrency, replaceAll, clearAll, isAuthenticated, syncLocalToCloud } = useTracker();
  const { token } = useAuth();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = React.useState<{ count: number; data: Parameters<typeof replaceAll>[0] } | null>(null);
  const [confirmClear, setConfirmClear] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const subs = state.status === "ready" ? state.data.subscriptions : [];

  const handleExportCsv = async () => {
    if (isAuthenticated && token) {
      setIsExporting(true);
      try {
        const csv = await statsApi.exportCsv(token);
        downloadFile(exportFilename("csv"), csv, "text/csv;charset=utf-8");
        toast.success("CSV exported from cloud");
        return;
      } catch {
        // fallback to local
      } finally {
        setIsExporting(false);
      }
    }
    downloadFile(exportFilename("csv"), toCSV(subs, currency), "text/csv;charset=utf-8");
    toast.success("CSV exported", { description: `${subs.length} subscriptions → ${exportFilename("csv")}` });
  };

  const handleExportJson = async () => {
    if (state.status !== "ready") return;
    if (isAuthenticated && token) {
      setIsExporting(true);
      try {
        const data = await statsApi.exportJson(token);
        downloadFile(exportFilename("json"), JSON.stringify(data, null, 2), "application/json");
        toast.success("Cloud backup saved");
        return;
      } catch {
      } finally {
        setIsExporting(false);
      }
    }
    downloadFile(exportFilename("json"), JSON.stringify(state.data, null, 2), "application/json");
    toast.success("Backup saved", { description: "Keep this file — you can import it on any device." });
  };

  const handleFile = async (file: File) => {
    const text = await file.text();
    const result = parseImport(text);
    if (result.status === "invalid") {
      toast.error("Couldn't read that file", { description: "Expected a Subscription Tracker backup (.json)." });
      return;
    }
    setPendingImport({ count: result.count, data: result.data });
  };

  const confirmImport = async () => {
    if (!pendingImport) return;
    await replaceAll(pendingImport.data);
    setPendingImport(null);
    if (fileRef.current) fileRef.current.value = "";
    toast.success(`Imported ${pendingImport.count} subscriptions`, { description: "Your list was replaced." });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setPendingImport(null); setConfirmClear(false); } }}>
      <DialogContent className="max-w-[480px] overflow-hidden p-0">
        <div className="p-6 sm:p-7">
          <DialogHeader className="text-left">
            <DialogTitle className="text-[22px]">Settings &amp; data</DialogTitle>
            <DialogDescription>
              {isAuthenticated
                ? "Currency, backups, and cloud sync — your data is encrypted and synced."
                : "Currency, backups and privacy — everything lives in this browser by default."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            {/* Currency */}
            <div className="space-y-2.5">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={(v) => { if (isCurrency(v)) setCurrency(v); }}>
                <SelectTrigger className="h-11 w-full rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.label} ({c.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">Applies to every amount. One currency keeps the math honest.</p>
            </div>

            {/* Sync status */}
            {isAuthenticated ? (
              <div className="flex gap-3 rounded-xl border border-accent/20 bg-accent-soft p-4">
                <Cloud className="mt-0.5 size-4 shrink-0 text-accent" />
                <div>
                  <p className="text-[13px] font-semibold text-foreground">Cloud sync active</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                    Your data is backed up to the edge and available on any device. Exports include your cloud data.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 rounded-xl border border-border bg-surface-2 p-4">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-[13px] font-semibold text-foreground">Local-only mode</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                    Your data lives only in this browser. Create an account to sync encrypted across devices.
                  </p>
                  <Button size="sm" onClick={syncLocalToCloud} className="mt-3 h-8 rounded-full text-[12px]">
                    <Upload className="size-3.5" /> Sync local to cloud
                  </Button>
                </div>
              </div>
            )}

            {/* Export */}
            <div className="space-y-2.5">
              <Label>Backups</Label>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={isExporting} className="rounded-full">
                  <FileDown className="size-4" /> Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportJson} disabled={isExporting} className="rounded-full">
                  <FileJson className="size-4" /> Export JSON
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">CSV for spreadsheets; JSON is the full backup you can re-import.</p>
            </div>

            {/* Import */}
            <div className="space-y-2.5">
              <Label>Import</Label>
              {pendingImport ? (
                <div className="rounded-xl border border-warning/25 bg-warning/[0.08] p-4 text-[13px]">
                  <p className="text-warning">
                    Replace <strong>{subs.length}</strong> current with <strong>{pendingImport.count}</strong> imported?
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={confirmImport} className="h-8 rounded-full">Replace everything</Button>
                    <Button size="sm" variant="ghost" onClick={() => setPendingImport(null)} className="h-8 rounded-full">Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only-x" onChange={(e) => { const file = e.target.files?.[0]; if (file) void handleFile(file); }} />
                  <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="rounded-full">
                    <FileUp className="size-4" /> Import JSON backup…
                  </Button>
                  <p className="text-[11px] text-muted-foreground">Replaces your current list after you confirm.</p>
                </>
              )}
            </div>

            {/* Danger zone */}
            <div className="space-y-2.5 rounded-xl border border-destructive/20 bg-destructive/[0.05] p-4">
              <Label className="text-destructive">Danger zone</Label>
              {confirmClear ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="destructive" size="sm" onClick={() => { clearAll(); setConfirmClear(false); onOpenChange(false); }} className="h-8 rounded-full">
                    <Trash2 className="size-4" /> Yes, delete everything
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmClear(false)} className="h-8 rounded-full">Keep my data</Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full border-destructive/25 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setConfirmClear(true)}
                >
                  <Trash2 className="size-4" /> Clear all data…
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
