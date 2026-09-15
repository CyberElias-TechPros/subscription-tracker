import { Hono } from 'hono';
import type { Env } from '../lib/types';
import { authMiddleware } from '../middleware/auth';
import { updateUserCurrency } from '../lib/db';
import { settingsSchema } from '../lib/validation';

type Variables = { user: any; jwtPayload: any; };

const settings = new Hono<{ Bindings: Env; Variables: Variables }>();

settings.use('*', authMiddleware);

settings.get('/', async (c) => {
  const user = c.get('user');
  return c.json({
    settings: {
      currency: user.currency,
    }
  });
});

settings.put('/', async (c) => {
  const user = c.get('user');
  let body: unknown;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON' }, 400); }

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  await updateUserCurrency(c.env.DB, user.id, parsed.data.currency);

  return c.json({
    settings: {
      currency: parsed.data.currency,
    }
  });
});

export default settings;
