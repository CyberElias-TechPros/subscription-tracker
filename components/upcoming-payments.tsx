"use client";

import { CalendarClock, AlertTriangle } from "lucide-react";
import { formatDaysUntil, formatMoney } from "@/lib/format";
import { getCategory, type UpcomingPayment } from "@/lib/subscriptions";
import { motion } from "framer-motion";

export function UpcomingPayments({ payments, currency }: { payments: UpcomingPayment[]; currency: string }) {
  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full border border-border bg-surface-2">
          <CalendarClock className="size-5 text-muted-foreground" aria-hidden="true" />
        </div>
        <p className="text-[14px] font-medium text-foreground">No payments in the next 30 days</p>
        <p className="max-w-xs text-[12px] leading-relaxed text-muted-foreground">
          Add a billing date to a subscription and it will show up here with smart reminders.
        </p>
      </div>
    );
  }

  return (
    <ol className="space-y-1.5">
      {payments.map(({ sub, date, daysUntil }, i) => {
        const urgent = daysUntil <= 3;
        const veryUrgent = daysUntil <= 1;
        const cat = getCategory(sub.category);
        return (
          <motion.li
            key={sub.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`group flex items-center gap-4 rounded-xl border px-3 py-2.5 transition-colors duration-200 ${
              urgent
                ? "border-warning/30 bg-warning/[0.07] hover:bg-warning/[0.1]"
                : "border-border bg-card hover:bg-surface-2"
            }`}
          >
            {/* Date chip */}
            <div
              className={`font-num flex size-[46px] shrink-0 flex-col items-center justify-center rounded-[10px] border text-[10px] font-bold uppercase leading-none ${
                veryUrgent
                  ? "border-warning/40 bg-warning/15 text-warning"
                  : urgent
                    ? "border-warning/30 bg-warning/10 text-warning"
                    : "border-border bg-surface-2 text-muted-foreground group-hover:text-foreground"
              }`}
            >
              <span className="text-[9px] opacity-70">
                {new Intl.DateTimeFormat("en-US", { month: "short" }).format(date)}
              </span>
              <span className="mt-0.5 text-[15px] leading-none">{date.getDate()}</span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-[14px] font-medium text-foreground">{sub.name}</p>
                {urgent && <AlertTriangle className="size-3.5 shrink-0 text-warning" />}
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <span className={`text-[12px] ${urgent ? "font-medium text-warning" : "text-muted-foreground"}`}>
                  {formatDaysUntil(daysUntil, date)}
                </span>
                <span className="size-1 rounded-full bg-border-strong" />
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.label}
                </span>
              </div>
            </div>

            <span
              className={`font-num shrink-0 rounded-full px-2.5 py-1 text-[13px] font-semibold ${
                urgent ? "bg-warning/15 text-warning" : "bg-surface-2 text-foreground/80"
              }`}
            >
              {formatMoney(sub.cost, currency)}
            </span>
          </motion.li>
        );
      })}
    </ol>
  );
}
