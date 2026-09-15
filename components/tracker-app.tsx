"use client";

import * as React from "react";
import { Plus, Settings2, Share2, Cloud, CloudOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTracker } from "@/components/tracker-provider";
import { StatsConsole } from "@/components/stats-console";
import { ReceiptCard } from "@/components/receipt-card";
import { SpendDonut } from "@/components/spend-donut";
import { HorizonChart } from "@/components/horizon-chart";
import { UpcomingPayments } from "@/components/upcoming-payments";
import { Ledger } from "@/components/ledger";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { useCountUp } from "@/hooks/use-count-up";
import { buildShareText, shareOrCopy } from "@/lib/export";
import { computeStats } from "@/lib/subscriptions";
import { SITE_URL } from "@/lib/site";
import { motion } from "framer-motion";

export function TrackerApp() {
  const { state, openAdd, openSettings, openAuth, currency, anyOverlayOpen, isAuthenticated, syncLocalToCloud } = useTracker();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "n" && !e.metaKey && !e.ctrlKey && !e.altKey && !anyOverlayOpen) {
        const target = e.target as HTMLElement;
        if (["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName) || target?.isContentEditable) return;
        e.preventDefault();
        openAdd();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openAdd, anyOverlayOpen]);

  if (state.status === "loading") {
    return <TrackerSkeleton />;
  }

  const subscriptions = state.data.subscriptions;

  if (subscriptions.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Action row — premium */}
      <div className="flex flex-wrap items-center gap-2.5" data-print="hide">
        <Button onClick={openAdd} size="lg" className="group h-11 rounded-full bg-white px-6 text-[14px] font-semibold text-black shadow-lg transition-all hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="size-4 transition-transform group-hover:rotate-90 duration-300" />
          Add subscription
        </Button>
        <ShareButton />
        <div className="ml-auto flex items-center gap-2">
          {state.isSyncing && (
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
              <Loader2 className="size-3.5 animate-spin text-white/40" />
              <span className="text-[11px] text-white/50">Syncing…</span>
            </div>
          )}
          {!isAuthenticated && state.data.subscriptions.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => openAuth("register")} className="h-11 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 text-amber-200/80 hover:bg-amber-400/15 hover:text-amber-100">
              <CloudOff className="size-4" />
              Sync to cloud
            </Button>
          )}
          {isAuthenticated && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5">
              <Cloud className="size-3.5 text-emerald-300" />
              <span className="text-[11px] font-medium text-emerald-200/70">Synced to edge</span>
            </div>
          )}
          <Button variant="ghost" size="lg" onClick={openSettings} className="h-11 rounded-full border border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white">
            <Settings2 className="size-4" />
            Settings
          </Button>
        </div>
      </div>

      <DashboardBody subscriptions={subscriptions} currency={currency} />
    </div>
  );
}

function DashboardBody({
  subscriptions,
  currency,
}: {
  subscriptions: ReturnType<typeof useTracker>["state"]["data"]["subscriptions"];
  currency: string;
}) {
  const stats = React.useMemo(() => computeStats(subscriptions), [subscriptions]);

  return (
    <>
      <StatsConsole stats={stats} currency={currency} />

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }} className="lg:col-span-5">
          <ReceiptCard stats={stats} currency={currency} />
        </motion.div>
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          aria-label="Next twelve months of payments"
          className="relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#121f22]/60 p-6 backdrop-blur-2xl sm:p-8 lg:col-span-7"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />
          <div className="relative">
            <h2 className="text-[16px] font-semibold tracking-tight text-white">The next 12 months</h2>
            <p className="mt-1 text-[13px] text-white/40">When the money actually leaves your account.</p>
            <div className="mt-6">
              <HorizonChart subscriptions={subscriptions} currency={currency} />
            </div>
          </div>
        </motion.section>
      </div>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-12">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          aria-label="Spending by category"
          className="relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#121f22]/60 p-6 backdrop-blur-2xl sm:p-8 lg:col-span-5"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />
          <div className="relative">
            <h2 className="text-[16px] font-semibold tracking-tight text-white">Where it goes</h2>
            <p className="mt-1 text-[13px] text-white/40">Monthly equivalent, by category.</p>
            <div className="mt-6">
              <SpendDonut totals={stats.categoryTotals} currency={currency} monthly={stats.monthly} />
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          aria-label="Upcoming payments"
          className="relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#121f22]/60 p-6 backdrop-blur-2xl sm:p-8 lg:col-span-7"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />
          <div className="relative">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <h2 className="text-[16px] font-semibold tracking-tight text-white">Due soon</h2>
                <p className="mt-1 text-[13px] text-white/40">Payments in the next 30 days.</p>
              </div>
              <p className="font-num text-[13px] text-white/30">
                <span className="text-[16px] font-semibold text-white">{new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(stats.upcomingTotal)}</span> total
              </p>
            </div>
            <div className="mt-5">
              <UpcomingPayments payments={stats.upcoming} currency={currency} />
            </div>
          </div>
        </motion.section>
      </div>

      <Ledger subscriptions={subscriptions} />
    </>
  );
}

function ShareButton() {
  const { state, currency } = useTracker();
  const [busy, setBusy] = React.useState(false);
  const stats = React.useMemo(() => (state.status === "ready" ? computeStats(state.data.subscriptions) : null), [state]);
  const animatedMonthly = useCountUp(stats?.monthly ?? 0, 400);

  const onShare = async () => {
    if (!stats) return;
    setBusy(true);
    const text = buildShareText(stats, currency, SITE_URL);
    const result = await shareOrCopy(text);
    setBusy(false);
    if (result === "copied") {
      toast.success("Copied to clipboard", { description: "Paste it anywhere — group chats love this one." });
    } else if (result === "failed") {
      toast("Sharing isn't available here", {
        description: `${new Intl.NumberFormat("en-US", { style: "currency", currency }).format(stats.monthly)}/mo across ${stats.activeCount} services.`,
        duration: 10000,
      });
    }
  };

  return (
    <Button variant="outline" size="lg" onClick={onShare} loading={busy} className="h-11 rounded-full border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:text-white">
      <Share2 className="size-4" />
      Share my total
      <span className="font-num ml-1 text-white/40">({new Intl.NumberFormat("en-US", { style: "currency", currency }).format(animatedMonthly)}/mo)</span>
    </Button>
  );
}

function TrackerSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8" aria-busy="true" aria-label="Loading your subscriptions">
      <div className="flex gap-2.5">
        <div className="skeleton h-11 w-44 rounded-full" />
        <div className="skeleton h-11 w-40 rounded-full" />
      </div>
      <div className="skeleton h-64 rounded-[20px]" />
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-12">
        <div className="skeleton h-96 rounded-[20px] lg:col-span-5" />
        <div className="skeleton h-96 rounded-[20px] lg:col-span-7" />
      </div>
      <div className="skeleton h-72 rounded-[20px]" />
      <span className="sr-only-x">Loading…</span>
    </div>
  );
}
