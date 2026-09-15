import { Hono } from 'hono';
import type { Env } from '../lib/types';
import { authMiddleware } from '../middleware/auth';
import { listSubscriptions, getSubscription, createSubscription, updateSubscription, deleteSubscription, rowToApi, clearUserSubscriptions } from '../lib/db';
import { subscriptionCreateSchema, subscriptionUpdateSchema, importSchema } from '../lib/validation';
import { generateId } from '../lib/auth';

type Variables = {
  user: any;
  jwtPayload: any;
};

const subs = new Hono<{ Bindings: Env; Variables: Variables }>();

subs.use('*', authMiddleware);

// GET / - list all subscriptions for current user
subs.get('/', async (c) => {
  const user = c.get('user');
  const rows = await listSubscriptions(c.env.DB, user.id);
  const data = rows.map(rowToApi);
  return c.json({ subscriptions: data, count: data.length });
});

// POST / - create
subs.post('/', async (c) => {
  const user = c.get('user');
  let body: unknown;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON' }, 400); }

  const parsed = subscriptionCreateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const now = Date.now();
  const id = generateId();

  const row = {
    id,
    user_id: user.id,
    name: parsed.data.name,
    cost: parsed.data.cost,
    cycle: parsed.data.cycle,
    category: parsed.data.category,
    notes: parsed.data.notes || null,
    start_date: parsed.data.startDate || null,
    paused: parsed.data.paused ? 1 : 0,
    created_at: now,
    updated_at: now,
  };

  await createSubscription(c.env.DB, row as any);

  return c.json({ subscription: rowToApi(row as any) }, 201);
});

// GET /:id
subs.get('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const row = await getSubscription(c.env.DB, user.id, id);
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json({ subscription: rowToApi(row) });
});

// PUT /:id - full update
subs.put('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  let body: unknown;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON' }, 400); }

  const parsed = subscriptionCreateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const patch = {
    name: parsed.data.name,
    cost: parsed.data.cost,
    cycle: parsed.data.cycle,
    category: parsed.data.category,
    notes: parsed.data.notes || null,
    start_date: parsed.data.startDate || null,
    paused: parsed.data.paused ? 1 : 0,
  };

  const updated = await updateSubscription(c.env.DB, user.id, id, patch as any);
  if (!updated) return c.json({ error: 'Not found' }, 404);

  return c.json({ subscription: rowToApi(updated) });
});

// PATCH /:id - partial update
subs.patch('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  let body: unknown;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON' }, 400); }

  const parsed = subscriptionUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const patch: any = {};
  if (parsed.data.name !== undefined) patch.name = parsed.data.name;
  if (parsed.data.cost !== undefined) patch.cost = parsed.data.cost;
  if (parsed.data.cycle !== undefined) patch.cycle = parsed.data.cycle;
  if (parsed.data.category !== undefined) patch.category = parsed.data.category;
  if (parsed.data.notes !== undefined) patch.notes = parsed.data.notes || null;
  if (parsed.data.startDate !== undefined) patch.start_date = parsed.data.startDate || null;
  if (parsed.data.paused !== undefined) patch.paused = parsed.data.paused ? 1 : 0;

  const updated = await updateSubscription(c.env.DB, user.id, id, patch);
  if (!updated) return c.json({ error: 'Not found' }, 404);

  return c.json({ subscription: rowToApi(updated) });
});

// POST /:id/toggle - toggle paused
subs.post('/:id/toggle', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const existing = await getSubscription(c.env.DB, user.id, id);
  if (!existing) return c.json({ error: 'Not found' }, 404);

  const updated = await updateSubscription(c.env.DB, user.id, id, { paused: existing.paused ? 0 : 1 } as any);
  return c.json({ subscription: rowToApi(updated!) });
});

// DELETE /:id
subs.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const deleted = await deleteSubscription(c.env.DB, user.id, id);
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ message: 'Deleted', id });
});

// DELETE / - clear all
subs.delete('/', async (c) => {
  const user = c.get('user');
  await clearUserSubscriptions(c.env.DB, user.id);
  return c.json({ message: 'All subscriptions cleared' });
});

// POST /import - bulk import
subs.post('/import', async (c) => {
  const user = c.get('user');
  let body: unknown;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON' }, 400); }

  const parsed = importSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const now = Date.now();
  const toCreate = parsed.data.subscriptions.map((s: any) => ({
    id: s.id || generateId(),
    user_id: user.id,
    name: s.name,
    cost: s.cost,
    cycle: s.cycle,
    category: s.category,
    notes: s.notes || null,
    start_date: s.startDate || null,
    paused: s.paused ? 1 : 0,
    created_at: s.createdAt || now,
    updated_at: s.updatedAt || now,
  }));

  // Use batch for efficiency
  const statements = toCreate.map(row =>
    c.env.DB.prepare(
      `INSERT OR REPLACE INTO subscriptions (id, user_id, name, cost, cycle, category, notes, start_date, paused, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(row.id, row.user_id, row.name, row.cost, row.cycle, row.category, row.notes, row.start_date, row.paused, row.created_at, row.updated_at)
  );

  if (statements.length > 0) {
    await c.env.DB.batch(statements);
  }

  const rows = await listSubscriptions(c.env.DB, user.id);
  return c.json({ subscriptions: rows.map(rowToApi), count: rows.length, imported: toCreate.length });
});

export default subs;
