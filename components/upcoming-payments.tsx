"use client";

import { CalendarClock, AlertTriangle } from "lucide-react";
import { formatDaysUntil, formatMoney } from "@/lib/format";
import { getCategory, type UpcomingPayment } from "@/lib/subscriptions";
import { motion } from "framer-motion";

export function UpcomingPayments({ payments, currency }: { payments: UpcomingPayment[]; currency: string }) {
  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
          <CalendarClock className="size-5 text-white/30" aria-hidden="true" />
        </div>
        <p className="text-[14px] font-medium text-white/60">No payments in the next 30 days</p>
        <p className="max-w-xs text-[12px] leading-relaxed text-white/30">Add a billing date to a subscription and it will show up here with smart reminders.</p>
      </div>
    );
  }

  return (
    <ol className="space-y-1">
      {payments.map(({ sub, date, daysUntil }, i) => {
        const urgent = daysUntil <= 3;
        const veryUrgent = daysUntil <= 1;
        return (
          <motion.li
            key={sub.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`group relative flex items-center gap-4 rounded-[14px] border px-4 py-3 transition-all duration-300 ${
              urgent
                ? "border-amber-400/20 bg-amber-400/[0.06] hover:bg-amber-400/[0.08]"
                : "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
            }`}
          >
            {/* Date chip */}
            <div
              className={`font-num relative flex size-[48px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-[10px] border text-[10px] font-bold uppercase leading-none transition-all ${
                veryUrgent
                  ? "border-amber-400/30 bg-amber-400/15 text-amber-200 shadow-[0_0_20px_rgba(251,146,60,0.15)]"
                  : urgent
                  ? "border-amber-400/20 bg-amber-400/10 text-amber-200/80"
                  : "border-white/10 bg-white/[0.06] text-white/60 group-hover:bg-white/[0.08] group-hover:text-white/80"
              }`}
            >
              {veryUrgent && <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent" />}
              <span className="relative text-[10px] opacity-70">{new Intl.DateTimeFormat("en-US", { month: "short" }).format(date)}</span>
              <span className="relative mt-0.5 text-[16px] leading-none">{date.getDate()}</span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className={`truncate text-[14px] font-medium ${urgent ? "text-white" : "text-white/80 group-hover:text-white"}`}>{sub.name}</p>
                {urgent && <AlertTriangle className="size-3.5 text-amber-300/70" />}
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <span className={`text-[12px] ${urgent ? "font-medium text-amber-200/70" : "text-white/40"}`}>{formatDaysUntil(daysUntil, date)}</span>
                <span className="size-1 rounded-full bg-white/15" />
                <span className="flex items-center gap-1.5 text-[11px] text-white/30">
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: getCategory(sub.category).color }} />
                  {getCategory(sub.category).label}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className={`font-num rounded-full px-2.5 py-1 text-[13px] font-semibold ${urgent ? "bg-amber-400/15 text-amber-100" : "bg-white/[0.06] text-white/70 group-hover:bg-white/[0.08] group-hover:text-white/90"}`}>
                {formatMoney(sub.cost, currency)}
              </span>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
