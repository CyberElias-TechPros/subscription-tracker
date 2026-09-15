"use client";

import { Plus, Sparkles, Shield, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/logo";
import { useTracker } from "@/components/tracker-provider";
import { motion } from "framer-motion";

export function EmptyState() {
  const { openAdd, loadSample, openAuth, isAuthenticated } = useTracker();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#121f22]/60 backdrop-blur-2xl"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-emerald-400/10 blur-[80px]" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-teal-400/10 blur-[80px]" />
        <div className="bg-graph absolute inset-0 opacity-[0.04]" />
      </div>

      <div className="relative flex flex-col items-center px-6 py-16 text-center sm:px-10 sm:py-24">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="absolute -inset-6 rounded-full bg-emerald-400/10 blur-2xl" />
          <div className="relative flex size-20 items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.04] backdrop-blur">
            <LogoMark className="size-10" />
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-8 text-balance text-[28px] font-semibold tracking-tight text-white sm:text-[32px]"
        >
          Your ledger is empty
          <br />
          <span className="bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">but your money isn&apos;t.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-4 max-w-md text-pretty text-[14px] leading-relaxed text-white/50"
        >
          Add the first subscription you pay for — Netflix, iCloud, the gym, anything recurring — and watch the real total appear. Or take the tour with realistic data first.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <Button size="lg" onClick={openAdd} className="group relative h-12 rounded-full bg-white px-7 text-[14px] font-semibold text-black shadow-lg transition-all hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="size-4 transition-transform group-hover:rotate-90 duration-300" />
            Add your first subscription
          </Button>
          <Button size="lg" variant="outline" onClick={loadSample} className="h-12 rounded-full border-white/10 bg-white/[0.04] px-7 text-white hover:bg-white/[0.08] hover:text-white">
            <Sparkles className="size-4" />
            Load sample data
          </Button>
        </motion.div>

        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-6 flex items-center gap-2 rounded-full border border-amber-400/15 bg-amber-400/10 px-4 py-2"
          >
            <div className="size-1.5 rounded-full bg-amber-300 animate-pulse" />
            <p className="text-[12px] text-amber-200/70">
              Local only —{" "}
              <button onClick={() => openAuth("register")} className="font-medium text-amber-100 underline decoration-amber-300/30 underline-offset-4 hover:decoration-amber-300">
                create account to sync
              </button>
            </p>
          </motion.div>
        )}

        <motion.ul
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7 }}
          className="mt-14 grid w-full max-w-3xl gap-3 text-left sm:grid-cols-3"
        >
          {[
            { icon: Shield, title: "Private by design", body: "Data never leaves your browser unless you sign in — then it's encrypted." },
            { icon: Zap, title: "Every billing cycle", body: "Weekly → yearly, normalized to monthly for honest comparison." },
            { icon: Globe, title: "Yours to keep", body: "Export CSV or JSON backup any time. No lock-in, ever." },
          ].map((item) => (
            <li key={item.title} className="group rounded-[16px] border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04] hover:border-white/[0.08]">
              <div className="flex size-8 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.04] group-hover:bg-white/[0.06] transition-colors">
                <item.icon className="size-4 text-white/50 group-hover:text-white/80 transition-colors" />
              </div>
              <p className="mt-3 text-[13px] font-medium text-white/80">{item.title}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-white/40">{item.body}</p>
            </li>
          ))}
        </motion.ul>
      </div>
    </motion.div>
  );
}
