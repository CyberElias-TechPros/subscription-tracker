"use client";

import * as React from "react";
import { toast } from "sonner";
import { FileDown, FileJson, FileUp, ShieldCheck, Trash2, Cloud, Download, Upload } from "lucide-react";
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
      <DialogContent className="max-w-[480px] overflow-hidden border-white/10 bg-[#121f22]/90 p-0 backdrop-blur-2xl">
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-[60px]" />
        <div className="relative p-6 sm:p-7">
          <DialogHeader className="text-left">
            <DialogTitle className="text-[18px] font-semibold tracking-tight text-white">Settings & data</DialogTitle>
            <DialogDescription className="text-[13px] text-white/40">
              {isAuthenticated ? "Currency, backups, and cloud sync — your data is encrypted and synced." : "Currency, backups and privacy — everything lives in this browser by default."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            {/* Currency */}
            <div className="space-y-2.5">
              <Label className="text-white/70">Currency</Label>
              <Select value={currency} onValueChange={(v) => { if (isCurrency(v)) setCurrency(v); }}>
                <SelectTrigger className="h-11 w-full rounded-full border-white/10 bg-black/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-white/10 bg-[#121f22]/90 backdrop-blur-xl">
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.label} ({c.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-white/30">Applies to every amount. One currency keeps the math honest.</p>
            </div>

            {/* Sync status */}
            {isAuthenticated ? (
              <div className="flex gap-3 rounded-[14px] border border-emerald-400/20 bg-emerald-400/10 p-4">
                <Cloud className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                <div>
                  <p className="text-[13px] font-medium text-emerald-100">Cloud sync active</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-emerald-200/60">Your data is backed up to Cloudflare&apos;s edge and available on any device. Exports include your cloud data.</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 rounded-[14px] border border-white/10 bg-white/[0.04] p-4">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-white/40" />
                <div>
                  <p className="text-[13px] font-medium text-white/80">Local-only mode</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-white/40">Your data lives only in this browser. Create an account to sync encrypted across devices.</p>
                  <Button size="sm" onClick={syncLocalToCloud} className="mt-3 h-8 rounded-full bg-white text-black hover:bg-white/90 text-[12px]">
                    <Upload className="size-3.5" /> Sync local to cloud
                  </Button>
                </div>
              </div>
            )}

            {/* Export */}
            <div className="space-y-2.5">
              <Label className="text-white/70">Backups</Label>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={isExporting} className="h-9 rounded-full border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]">
                  <FileDown className="size-4" /> Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportJson} disabled={isExporting} className="h-9 rounded-full border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]">
                  <FileJson className="size-4" /> Export JSON
                </Button>
              </div>
              <p className="text-[11px] text-white/30">CSV for spreadsheets; JSON is the full backup you can re-import.</p>
            </div>

            {/* Import */}
            <div className="space-y-2.5">
              <Label className="text-white/70">Import</Label>
              {pendingImport ? (
                <div className="rounded-[14px] border border-amber-400/20 bg-amber-400/10 p-4 text-[13px]">
                  <p className="text-amber-100">Replace <strong>{subs.length}</strong> current with <strong>{pendingImport.count}</strong> imported?</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={confirmImport} className="h-8 rounded-full bg-white text-black hover:bg-white/90">Replace everything</Button>
                    <Button size="sm" variant="ghost" onClick={() => setPendingImport(null)} className="h-8 rounded-full text-white/60 hover:text-white">Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only-x" onChange={(e) => { const file = e.target.files?.[0]; if (file) void handleFile(file); }} />
                  <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="h-9 rounded-full border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]">
                    <FileUp className="size-4" /> Import JSON backup…
                  </Button>
                  <p className="text-[11px] text-white/30">Replaces your current list after you confirm.</p>
                </>
              )}
            </div>

            {/* Danger zone */}
            <div className="space-y-2.5 rounded-[14px] border border-red-400/20 bg-red-400/[0.06] p-4">
              <Label className="text-red-200/80">Danger zone</Label>
              {confirmClear ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="destructive" size="sm" onClick={() => { clearAll(); setConfirmClear(false); onOpenChange(false); }} className="h-8 rounded-full">
                    <Trash2 className="size-4" /> Yes, delete everything
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmClear(false)} className="h-8 rounded-full text-white/60">Keep my data</Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="h-8 rounded-full border-red-400/20 bg-red-400/10 text-red-200/70 hover:bg-red-400/15" onClick={() => setConfirmClear(true)}>
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
