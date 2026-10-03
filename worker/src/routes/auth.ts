import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../lib/types';
import { hashPassword, verifyPassword, signJwt, generateId, requireJwtSecret } from '../lib/auth';
import { getUserByEmail, createUser, getUserById } from '../lib/db';
import { registerSchema, loginSchema } from '../lib/validation';

type Variables = {
  user?: any;
};

const auth = new Hono<{ Bindings: Env; Variables: Variables }>();

auth.post('/register', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const { email, password, name } = parsed.data;

  const existing = await getUserByEmail(c.env.DB, email);
  if (existing) {
    return c.json({ error: 'Email already registered' }, 409);
  }

  const id = generateId();
  const now = Date.now();
  const password_hash = await hashPassword(password);

  const user = {
    id,
    email,
    password_hash,
    name: name || null,
    currency: 'USD',
    created_at: now,
    updated_at: now,
  };

  await createUser(c.env.DB, user);

  const secret = requireJwtSecret(c.env.JWT_SECRET);
  const token = await signJwt({ sub: id, email }, secret);

  return c.json({
    user: {
      id,
      email,
      name: name || null,
      currency: 'USD',
      createdAt: now,
    },
    token,
  }, 201);
});

auth.post('/login', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const { email, password } = parsed.data;

  const user = await getUserByEmail(c.env.DB, email);
  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const secret = requireJwtSecret(c.env.JWT_SECRET);
  const token = await signJwt({ sub: user.id, email: user.email }, secret);

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      currency: user.currency,
      createdAt: user.created_at,
    },
    token,
  });
});

auth.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const token = authHeader.slice(7);
  const secret = requireJwtSecret(c.env.JWT_SECRET);
  const { verifyJwt } = await import('../lib/auth');
  const payload = await verifyJwt(token, secret);
  if (!payload) return c.json({ error: 'Invalid token' }, 401);

  const user = await getUserById(c.env.DB, payload.sub);
  if (!user) return c.json({ error: 'User not found' }, 404);

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      currency: user.currency,
      createdAt: user.created_at,
    }
  });
});

auth.post('/logout', async (c) => {
  // Stateless JWT - client discards token. Endpoint exists for symmetry and future blocklist via KV.
  return c.json({ message: 'Logged out' });
});

export default auth;
