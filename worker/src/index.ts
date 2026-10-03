import { Hono } from 'hono';
import { logger } from 'hono/logger';
import type { Env } from './lib/types';
import { corsMiddleware } from './middleware/cors';
import authRoutes from './routes/auth';
import subscriptionRoutes from './routes/subscriptions';
import settingsRoutes from './routes/settings';
import statsRoutes from './routes/stats';

type Variables = {
  user?: any;
  jwtPayload?: any;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use('*', logger());

// CORS - allow frontend and local dev
app.use('*', async (c, next) => {
  const frontendUrl = c.env.FRONTEND_URL || 'http://localhost:3000';
  const allowed = [frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000', 'https://subscription-tracker.vercel.app'];
  const middleware = corsMiddleware(allowed);
  return middleware(c, next);
});

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'Subscription Tracker API',
    version: '1.0.0',
    status: 'ok',
    environment: c.env.ENVIRONMENT || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth/*',
      subscriptions: '/api/subscriptions',
      settings: '/api/settings',
      stats: '/api/stats',
    }
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() });
});

// API routes
app.route('/api/auth', authRoutes);
app.route('/api/subscriptions', subscriptionRoutes);
app.route('/api/settings', settingsRoutes);
app.route('/api/stats', statsRoutes);

// Also mount stats export under /api/export for convenience
app.get('/api/export', async (c) => {
  // Proxy to stats export logic but requires auth
  const authHeader = c.req.header('Authorization');
  if (!authHeader) return c.json({ error: 'Unauthorized' }, 401);

  // Reuse stats route logic - redirect internally
  const url = new URL(c.req.url);
  const format = url.searchParams.get('format') || 'json';

  // We'll handle here directly to avoid duplication
  const { verifyJwt, requireJwtSecret } = await import('./lib/auth');
  const secret = requireJwtSecret(c.env.JWT_SECRET);
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const payload = await verifyJwt(token, secret);
  if (!payload) return c.json({ error: 'Invalid token' }, 401);

  const { getUserById, listSubscriptions } = await import('./lib/db');
  const { rowToApi } = await import('./lib/db');
  const user = await getUserById(c.env.DB, payload.sub);
  if (!user) return c.json({ error: 'User not found' }, 404);

  const rows = await listSubscriptions(c.env.DB, user.id);
  const data = rows.map(rowToApi);

  if (format === 'csv') {
    const headers = ['id','name','cost','cycle','category','notes','startDate','paused','createdAt','updatedAt'];
    const csvRows = [
      headers.join(','),
      ...data.map(s => [
        s.id,
        `"${s.name.replace(/"/g, '""')}"`,
        s.cost,
        s.cycle,
        s.category,
        s.notes ? `"${s.notes.replace(/"/g, '""')}"` : '',
        s.startDate || '',
        s.paused,
        s.createdAt,
        s.updatedAt,
      ].join(','))
    ];
    const csv = csvRows.join('\n');
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="subscriptions-${new Date().toISOString().slice(0,10)}.csv"`,
      }
    });
  }

  return c.json({
    version: 1,
    exportedAt: new Date().toISOString(),
    user: { id: user.id, email: user.email, currency: user.currency },
    subscriptions: data,
    settings: { currency: user.currency },
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found', path: c.req.path }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({
    error: 'Internal server error',
    message: c.env.ENVIRONMENT === 'development' ? err.message : 'Something went wrong',
  }, 500);
});

export default app;
