"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTracker } from "@/components/tracker-provider";
import { formatMoney } from "@/lib/format";
import { CATEGORIES, CYCLES, CYCLE_LABELS, monthlyEquivalent, type Cycle, type Subscription } from "@/lib/subscriptions";

const formSchema = z.object({
  name: z.string().trim().min(1, "Give it a name").max(80, "80 characters max"),
  cost: z.string().min(1, "Enter an amount").refine((v) => { const n = Number(v); return Number.isFinite(n) && n >= 0 && n <= 1_000_000; }, "Enter an amount between 0 and 1,000,000"),
  cycle: z.enum(CYCLES),
  category: z.string().min(1, "Pick a category"),
  startDate: z.string().optional().refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a valid date"),
  notes: z.string().trim().max(280, "Keep it under 280 characters").optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function SubscriptionDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (open: boolean) => void; editing: Subscription | null }) {
  const { addSubscription, updateSubscription, currency, isAuthenticated } = useTracker();
  const isEdit = editing !== null;

  const { register, handleSubmit, control, watch, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editing?.name ?? "",
      cost: editing != null ? String(editing.cost) : "",
      cycle: editing?.cycle ?? "monthly",
      category: editing?.category ?? "",
      startDate: editing?.startDate ?? "",
      notes: editing?.notes ?? "",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        name: editing?.name ?? "",
        cost: editing != null ? String(editing.cost) : "",
        cycle: editing?.cycle ?? "monthly",
        category: editing?.category ?? "",
        startDate: editing?.startDate ?? "",
        notes: editing?.notes ?? "",
      });
    }
  }, [open, editing, reset]);

  const watchedCost = Number(watch("cost"));
  const watchedCycle = watch("cycle");
  const preview = Number.isFinite(watchedCost) && watchedCost >= 0 && watchedCost <= 1_000_000 ? monthlyEquivalent(watchedCost, watchedCycle) : null;

  const onSubmit = async (values: FormValues) => {
    const draft = {
      name: values.name,
      cost: Number(values.cost),
      cycle: values.cycle as Cycle,
      category: values.category,
      startDate: values.startDate || undefined,
      notes: values.notes || undefined,
    };
    try {
      if (isEdit && editing) {
        await updateSubscription(editing.id, draft);
      } else {
        await addSubscription(draft);
      }
      onOpenChange(false);
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-hidden p-0">
        <div className="relative p-6 sm:p-7">
          <DialogHeader className="text-left">
            <DialogTitle className="text-[22px]">{isEdit ? `Edit ${editing?.name}` : "Add a subscription"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update the details — your totals recalculate instantly."
                : isAuthenticated
                  ? "Enter what you pay. It will sync encrypted to your account."
                  : "Enter what you pay. Everything stays on this device by default."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sub-name">Service name</Label>
                <Input id="sub-name" placeholder="Netflix, ChatGPT, gym…" autoComplete="off" maxLength={80} aria-invalid={!!errors.name} {...register("name")} className="h-11" />
                <FieldError message={errors.name?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sub-cost">Cost ({currency})</Label>
                <div className="relative">
                  <Input
                    id="sub-cost"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    placeholder="9.99"
                    className="font-num h-11 pr-24"
                    aria-invalid={!!errors.cost}
                    {...register("cost")}
                  />
                  {preview !== null && (
                    <span className="font-num pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-accent-soft px-2 py-1 text-[11px] font-medium text-accent">
                      ≈{formatMoney(preview, currency)}/mo
                    </span>
                  )}
                </div>
                <FieldError message={errors.cost?.message} />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Billing cycle</Label>
                <Controller
                  control={control}
                  name="cycle"
                  render={({ field }) => (
                    <div role="radiogroup" className="grid grid-cols-2 gap-2">
                      {CYCLES.map((cycle) => (
                        <button
                          key={cycle}
                          type="button"
                          role="radio"
                          aria-checked={field.value === cycle}
                          onClick={() => field.onChange(cycle)}
                          className={`h-10 rounded-full border px-4 text-[13px] font-medium transition-all duration-200 active:scale-[0.98] ${
                            field.value === cycle
                              ? "border-primary bg-primary text-primary-foreground shadow-xs"
                              : "border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground"
                          }`}
                        >
                          {CYCLE_LABELS[cycle]}
                        </button>
                      ))}
                    </div>
                  )}
                />
                <FieldError message={errors.cycle?.message} />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-11 rounded-full" aria-invalid={!!errors.category}>
                        <SelectValue placeholder="Pick one" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            <span className="flex items-center gap-2">
                              <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: c.color }} />
                              {c.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError message={errors.category?.message} />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sub-date">Next billing date</Label>
                <Input id="sub-date" type="date" {...register("startDate")} className="h-11" />
                <p className="text-[11px] text-muted-foreground">Powers “upcoming payments” — optional.</p>
                <FieldError message={errors.startDate?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub-notes">Note</Label>
                <Input id="sub-notes" placeholder="Shared with family, cancel after June…" maxLength={280} {...register("notes")} className="h-11" />
                <FieldError message={errors.notes?.message} />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11 rounded-full">
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting} className="h-11 rounded-full px-6">
                {isEdit ? "Save changes" : "Add subscription"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p role="alert" className="text-[11px] font-medium text-destructive">{message}</p>;
}
