import { z } from 'zod';

export const CYCLES = ['weekly', 'monthly', 'quarterly', 'yearly'] as const;
export const CATEGORIES = ['streaming','music','software','ai','gaming','news','fitness','food','other'] as const;

export const registerSchema = z.object({
  email: z.string().email().max(254).transform(v => v.toLowerCase().trim()),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(1).max(80).optional(),
});

export const loginSchema = z.object({
  email: z.string().email().max(254).transform(v => v.toLowerCase().trim()),
  password: z.string().min(1).max(128),
});

export const subscriptionCreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  cost: z.number().min(0).max(1_000_000),
  cycle: z.enum(CYCLES),
  category: z.string().min(1).max(32),
  notes: z.string().trim().max(280).optional().nullable(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable().or(z.literal('')),
  paused: z.boolean().optional().default(false),
});

export const subscriptionUpdateSchema = subscriptionCreateSchema.partial().extend({
  name: z.string().trim().min(1).max(80).optional(),
  cost: z.number().min(0).max(1_000_000).optional(),
});

export const settingsSchema = z.object({
  currency: z.string().length(3).regex(/^[A-Z]{3}$/),
});

export const importSchema = z.object({
  subscriptions: z.array(subscriptionCreateSchema.extend({
    id: z.string().optional(),
    createdAt: z.number().optional(),
    updatedAt: z.number().optional(),
    startDate: z.string().optional().nullable(),
  })),
  settings: z.object({
    currency: z.string().optional(),
  }).optional(),
});

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string; details?: any } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  const first = result.error.errors[0];
  return { success: false, error: first ? `${first.path.join('.')}: ${first.message}` : 'Validation failed', details: result.error.flatten() };
}
