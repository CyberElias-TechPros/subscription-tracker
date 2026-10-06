"use client";

import { Plus, Sparkles, Shield, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/logo";
import { useTracker } from "@/components/tracker-provider";
import { motion } from "framer-motion";

const PILLARS = [
  { icon: Shield, title: "Private by design", body: "Data never leaves your browser unless you sign in — then it's encrypted." },
  { icon: Zap, title: "Every billing cycle", body: "Weekly → yearly, normalized to monthly for honest comparison." },
  { icon: Globe, title: "Yours to keep", body: "Export CSV or JSON backup any time. No lock-in, ever." },
];

export function EmptyState() {
  const { openAdd, loadSample, openAuth, isAuthenticated } = useTracker();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-md"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="paper-dots absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)] opacity-60" />
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,var(--accent-soft),transparent_70%)]" />
      </div>

      <div className="relative flex flex-col items-center px-6 py-16 text-center sm:px-10 sm:py-24">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex size-16 items-center justify-center rounded-2xl border border-border bg-surface-2 shadow-xs">
            <LogoMark className="size-9" />
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="font-display mt-8 text-[30px] text-foreground sm:text-[38px]"
        >
          Your ledger is empty,{" "}
          <em className="text-muted-foreground">your money isn&apos;t.</em>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="mt-4 max-w-md text-pretty text-[14px] leading-relaxed text-muted-foreground"
        >
          Add the first subscription you pay for — Netflix, iCloud, the gym, anything
          recurring — and watch the real total appear. Or take the tour with realistic data first.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <Button size="lg" onClick={openAdd} className="group rounded-full px-7">
            <Plus className="size-4 transition-transform duration-300 group-hover:rotate-90" />
            Add your first subscription
          </Button>
          <Button size="lg" variant="outline" onClick={loadSample} className="rounded-full px-7">
            <Sparkles className="size-4" />
            Load sample data
          </Button>
        </motion.div>

        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="mt-6 flex items-center gap-2 rounded-full border border-warning/25 bg-warning/[0.08] px-4 py-2"
          >
            <span className="size-1.5 rounded-full bg-warning" />
            <p className="text-[12px] text-warning/90">
              Local only —{" "}
              <button
                onClick={() => openAuth("register")}
                className="font-medium text-warning underline decoration-warning/40 underline-offset-4 hover:decoration-warning"
              >
                create account to sync
              </button>
            </p>
          </motion.div>
        )}

        <motion.ul
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.7 }}
          className="mt-14 grid w-full max-w-3xl gap-3 text-left sm:grid-cols-3"
        >
          {PILLARS.map((item) => (
            <li key={item.title} className="rounded-xl border border-border bg-surface-2/60 p-4 transition-colors hover:bg-surface-2">
              <div className="flex size-8 items-center justify-center rounded-[10px] border border-border bg-card">
                <item.icon className="size-4 text-accent" />
              </div>
              <p className="mt-3 text-[13px] font-semibold text-foreground">{item.title}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </motion.ul>
      </div>
    </motion.div>
  );
}
