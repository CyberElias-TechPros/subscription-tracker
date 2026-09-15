import type { SubscriptionRow, User } from './types';

export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
  const row = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<User>();
  return row ?? null;
}

export async function getUserById(db: D1Database, id: string): Promise<User | null> {
  const row = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<User>();
  return row ?? null;
}

export async function createUser(db: D1Database, user: User): Promise<void> {
  await db.prepare(
    'INSERT INTO users (id, email, password_hash, name, currency, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(user.id, user.email, user.password_hash, user.name, user.currency, user.created_at, user.updated_at).run();
}

export async function updateUserCurrency(db: D1Database, userId: string, currency: string): Promise<void> {
  const now = Date.now();
  await db.prepare('UPDATE users SET currency = ?, updated_at = ? WHERE id = ?').bind(currency, now, userId).run();
}

export async function listSubscriptions(db: D1Database, userId: string): Promise<SubscriptionRow[]> {
  const result = await db.prepare('SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC').bind(userId).all<SubscriptionRow>();
  return result.results ?? [];
}

export async function getSubscription(db: D1Database, userId: string, id: string): Promise<SubscriptionRow | null> {
  const row = await db.prepare('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?').bind(id, userId).first<SubscriptionRow>();
  return row ?? null;
}

export async function createSubscription(db: D1Database, row: SubscriptionRow): Promise<void> {
  await db.prepare(
    `INSERT INTO subscriptions (id, user_id, name, cost, cycle, category, notes, start_date, paused, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(row.id, row.user_id, row.name, row.cost, row.cycle, row.category, row.notes, row.start_date, row.paused, row.created_at, row.updated_at).run();
}

export async function updateSubscription(db: D1Database, userId: string, id: string, patch: Partial<SubscriptionRow>): Promise<SubscriptionRow | null> {
  const existing = await getSubscription(db, userId, id);
  if (!existing) return null;

  const updated = {
    ...existing,
    ...patch,
    updated_at: Date.now(),
  };

  await db.prepare(
    `UPDATE subscriptions SET name = ?, cost = ?, cycle = ?, category = ?, notes = ?, start_date = ?, paused = ?, updated_at = ? WHERE id = ? AND user_id = ?`
  ).bind(updated.name, updated.cost, updated.cycle, updated.category, updated.notes, updated.start_date, updated.paused, updated.updated_at, id, userId).run();

  return updated;
}

export async function deleteSubscription(db: D1Database, userId: string, id: string): Promise<boolean> {
  const res = await db.prepare('DELETE FROM subscriptions WHERE id = ? AND user_id = ?').bind(id, userId).run();
  return (res.meta.changes ?? 0) > 0;
}

export async function clearUserSubscriptions(db: D1Database, userId: string): Promise<void> {
  await db.prepare('DELETE FROM subscriptions WHERE user_id = ?').bind(userId).run();
}

export function rowToApi(row: SubscriptionRow) {
  return {
    id: row.id,
    name: row.name,
    cost: row.cost,
    cycle: row.cycle,
    category: row.category,
    notes: row.notes || undefined,
    startDate: row.start_date || undefined,
    paused: Boolean(row.paused),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Stats computation server-side (mirrors lib/subscriptions.ts logic)
export function computeMonthlyEquivalent(cost: number, cycle: string): number {
  switch (cycle) {
    case 'weekly': return (cost * 52) / 12;
    case 'monthly': return cost;
    case 'quarterly': return cost / 3;
    case 'yearly': return cost / 12;
    default: return cost;
  }
}

export function computeStats(rows: SubscriptionRow[]) {
  const active = rows.filter(r => !r.paused);
  const monthly = active.reduce((sum, r) => sum + computeMonthlyEquivalent(r.cost, r.cycle), 0);

  const perCategory = new Map<string, number>();
  for (const r of active) {
    perCategory.set(r.category, (perCategory.get(r.category) ?? 0) + computeMonthlyEquivalent(r.cost, r.cycle));
  }
  const categoryTotals = [...perCategory.entries()].map(([id, value]) => ({
    category: id,
    monthly: value,
    share: monthly > 0 ? value / monthly : 0,
  })).sort((a,b) => b.monthly - a.monthly);

  const mostExpensive = active.length === 0 ? null : active.reduce((max, r) => computeMonthlyEquivalent(r.cost, r.cycle) > computeMonthlyEquivalent(max.cost, max.cycle) ? r : max);

  return {
    monthly,
    yearly: monthly * 12,
    weekly: (monthly * 12) / 52,
    daily: (monthly * 12) / 365,
    activeCount: active.length,
    pausedCount: rows.length - active.length,
    categoryTotals,
    mostExpensive: mostExpensive ? rowToApi(mostExpensive) : null,
  };
}
