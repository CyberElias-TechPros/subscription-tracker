import type { Context, Next } from 'hono';
import { verifyJwt, requireJwtSecret } from '../lib/auth';
import type { Env, JwtPayload } from '../lib/types';
import { getUserById } from '../lib/db';

export async function authMiddleware(c: Context<{ Bindings: Env; Variables: { user: any; jwtPayload: JwtPayload } }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized', message: 'Missing or invalid authorization header' }, 401);
  }

  const token = authHeader.slice(7);
  const secret = requireJwtSecret(c.env.JWT_SECRET);

  const payload = await verifyJwt(token, secret);
  if (!payload) {
    return c.json({ error: 'Unauthorized', message: 'Invalid or expired token' }, 401);
  }

  const user = await getUserById(c.env.DB, payload.sub);
  if (!user) {
    return c.json({ error: 'Unauthorized', message: 'User not found' }, 401);
  }

  c.set('user', user);
  c.set('jwtPayload', payload as JwtPayload);

  await next();
}

export async function optionalAuthMiddleware(c: Context<{ Bindings: Env; Variables: { user?: any; jwtPayload?: JwtPayload } }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const secret = requireJwtSecret(c.env.JWT_SECRET);
    const payload = await verifyJwt(token, secret);
    if (payload) {
      try {
        const user = await getUserById(c.env.DB, payload.sub);
        if (user) {
          c.set('user', user);
          c.set('jwtPayload', payload as JwtPayload);
        }
      } catch {}
    }
  }
  await next();
}
