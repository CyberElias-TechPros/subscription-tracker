"use client";

import * as React from "react";
import { formatMoney } from "@/lib/format";
import type { CategoryTotal } from "@/lib/subscriptions";
import { motion } from "framer-motion";

export function SpendDonut({
  totals,
  currency,
  monthly,
}: {
  totals: CategoryTotal[];
  currency: string;
  monthly: number;
}) {
  const [mounted, setMounted] = React.useState(false);
  const [hovered, setHovered] = React.useState<string | null>(null);

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const R = 15.9155;
  const C = 2 * Math.PI * R;
  const GAP = totals.length > 1 ? 1.2 : 0;

  let offset = 0;
  const segments = totals.map((t) => {
    const length = mounted ? Math.max(t.share * 100 - GAP, 0.6) : 0;
    const seg = { ...t, length, offset };
    offset += t.share * 100;
    return seg;
  });

  const hoveredTotal = hovered ? totals.find(t => t.category.id === hovered) : null;

  return (
    <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:gap-10">
      <div className="relative mx-auto size-[180px] shrink-0 sm:mx-0">
        {/* Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/10 to-teal-400/10 blur-2xl" />
        
        <div className="relative size-full">
          <svg viewBox="0 0 40 40" className="size-full -rotate-90">
            {/* Track */}
            <circle cx="20" cy="20" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4.5" />
            {/* Segments */}
            {segments.map((seg) => {
              const isHovered = hovered === seg.category.id;
              return (
                <motion.circle
                  key={seg.category.id}
                  cx="20"
                  cy="20"
                  r={R}
                  fill="none"
                  stroke={seg.category.color}
                  strokeWidth={isHovered ? "6" : "4.5"}
                  strokeLinecap={totals.length === 1 ? "butt" : "round"}
                  strokeDasharray={`${(seg.length / 100) * C} ${C}`}
                  strokeDashoffset={(-seg.offset / 100) * C}
                  initial={{ strokeDasharray: `0 ${C}` }}
                  animate={{ strokeDasharray: `${(seg.length / 100) * C} ${C}` }}
                  transition={{ duration: 1.2, delay: totals.indexOf(seg) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 8px ${seg.category.color}80)` : undefined,
                    opacity: hovered && !isHovered ? 0.4 : 1,
                  }}
                  className="cursor-pointer transition-all duration-300"
                  onMouseEnter={() => setHovered(seg.category.id)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}
          </svg>

          {/* Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <span className="font-num block text-[22px] font-bold leading-none tracking-tight text-white">
                {hoveredTotal ? formatMoney(hoveredTotal.monthly, currency) : formatMoney(monthly, currency, { maximumFractionDigits: 0 })}
              </span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
                {hoveredTotal ? hoveredTotal.category.label : "per month"}
              </span>
              {hoveredTotal && (
                <span className="mt-0.5 block font-num text-[11px] text-white/30">
                  {Math.round(hoveredTotal.share * 100)}% of total
                </span>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Legend — premium list */}
      <ul className="w-full space-y-1">
        {totals.map((t, i) => {
          const isHovered = hovered === t.category.id;
          return (
            <motion.li
              key={t.category.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.06, duration: 0.5 }}
              onMouseEnter={() => setHovered(t.category.id)}
              onMouseLeave={() => setHovered(null)}
              className={`group flex cursor-pointer items-center justify-between gap-3 rounded-[12px] border px-3 py-2.5 text-sm transition-all duration-200 ${
                isHovered
                  ? "border-white/15 bg-white/[0.06] shadow-[0_0_20px_rgba(255,255,255,0.04)]"
                  : "border-transparent hover:border-white/10 hover:bg-white/[0.03]"
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="relative">
                  <span
                    aria-hidden="true"
                    className="block size-2.5 rounded-full transition-transform group-hover:scale-110"
                    style={{ backgroundColor: t.category.color, boxShadow: `0 0 10px ${t.category.color}60` }}
                  />
                  {isHovered && (
                    <span
                      className="absolute inset-0 animate-ping rounded-full opacity-40"
                      style={{ backgroundColor: t.category.color }}
                    />
                  )}
                </span>
                <span className={`truncate font-medium transition-colors ${isHovered ? "text-white" : "text-white/70 group-hover:text-white/90"}`}>
                  {t.category.label}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2.5">
                <span className={`font-num text-[13px] font-medium transition-colors ${isHovered ? "text-white" : "text-white/50 group-hover:text-white/70"}`}>
                  {formatMoney(t.monthly, currency)}
                </span>
                <span className="rounded-full bg-white/10 px-1.5 py-0.5 font-num text-[10px] font-medium text-white/40">
                  {Math.round(t.share * 100)}%
                </span>
              </span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
