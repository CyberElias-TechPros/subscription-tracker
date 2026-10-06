"use client";

import { formatMoney } from "@/lib/format";
import type { Stats } from "@/lib/subscriptions";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import * as React from "react";

export function ReceiptCard({ stats, currency }: { stats: Stats; currency: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 260, damping: 26 });
  const mouseYSpring = useSpring(y, { stiffness: 260, damping: 26 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["3deg", "-3deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-4deg", "4deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div ref={ref} className="perspective-[1200px]" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        {/* grounding shadow */}
        <div className="absolute inset-0 translate-y-6 rounded-[4px] bg-foreground/[0.08] blur-2xl" aria-hidden="true" />

        <div className="receipt relative mx-auto max-w-[380px] rounded-[3px] bg-[var(--receipt-paper)] px-7 py-8 text-[var(--receipt-ink)] shadow-lg ring-1 ring-black/[0.06] dark:ring-white/[0.08]">
          {/* Paper texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative">
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-[#1c2426]/20" />
              <p className="font-num text-center text-[0.68rem] font-bold uppercase tracking-[0.32em] text-[#1c2426]/60">
                Your year in subscriptions
              </p>
              <div className="h-px w-8 bg-[#1c2426]/20" />
            </div>
            <p className="font-num mt-2 text-center text-[0.6rem] uppercase tracking-[0.2em] text-[#1c2426]/40">
              printed {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date())} · paper ledger
            </p>

            <div className="tear-line my-6" role="presentation" />

            {stats.categoryTotals.length === 0 ? (
              <p className="py-10 text-center text-sm text-[#1c2426]/50">Nothing to print yet.</p>
            ) : (
              <ul className="space-y-3">
                {stats.categoryTotals.map(({ category, monthly }, i) => (
                  <motion.li
                    key={category.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05, duration: 0.5 }}
                    className="font-num flex items-baseline justify-between gap-3 text-[13px]"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                      <span className="truncate font-medium tracking-tight">{category.label}</span>
                    </span>
                    <span className="shrink-0 text-[#1c2426]/25" aria-hidden="true">
                      {"·".repeat(Math.max(2, 24 - category.label.length))}
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums">{formatMoney(monthly, currency)}/mo</span>
                  </motion.li>
                ))}
              </ul>
            )}

            <div className="tear-line my-6" role="presentation" />

            <dl className="font-num space-y-2 text-[13px]">
              <div className="flex justify-between text-[#1c2426]/50">
                <dt className="text-[11px] uppercase tracking-wide">Items</dt>
                <dd className="font-medium text-[#1c2426]">{stats.activeCount}</dd>
              </div>
              <div className="flex justify-between text-[#1c2426]/50">
                <dt className="text-[11px] uppercase tracking-wide">Subtotal / mo</dt>
                <dd className="font-semibold text-[#1c2426]">{formatMoney(stats.monthly, currency)}</dd>
              </div>
            </dl>

            <div className="tear-line my-5" role="presentation" />

            <div className="font-num text-center">
              <p className="text-[0.65rem] uppercase tracking-[0.28em] text-[#1c2426]/40">Total per year</p>
              <motion.p
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="mt-2 text-[42px] font-extrabold leading-none tracking-[-0.04em] text-[#141d1f]"
              >
                {formatMoney(stats.yearly, currency, { maximumFractionDigits: 0 })}
              </motion.p>
              <p className="mx-auto mt-2 max-w-[210px] text-[0.65rem] leading-relaxed text-[#1c2426]/40">
                if nothing changes by{" "}
                {new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
                  new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                )}
              </p>
            </div>

            <div className="mt-8 flex flex-col items-center">
              <div className="barcode h-10 w-44 text-[#1c2426]/60" aria-hidden="true" />
              <p className="font-num mt-3 text-center text-[0.55rem] uppercase tracking-[0.3em] text-[#1c2426]/30">
                keep this receipt · thank you
              </p>
              <div className="mt-4 flex items-center gap-1.5">
                <div className="size-1 rounded-full bg-[#1c2426]/20" />
                <div className="size-1 rounded-full bg-[#1c2426]/20" />
                <div className="size-1 rounded-full bg-[#1c2426]/20" />
              </div>
            </div>
          </div>

          {/* Paper highlight edge */}
          <div className="pointer-events-none absolute inset-0 rounded-[3px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),inset_0_0_0_1px_rgba(0,0,0,0.04)]" />
        </div>
      </motion.div>
    </div>
  );
}
