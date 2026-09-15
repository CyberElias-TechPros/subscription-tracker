import { Hono } from 'hono';
import type { Env } from '../lib/types';
import { authMiddleware } from '../middleware/auth';
import { listSubscriptions, computeStats, rowToApi } from '../lib/db';

type Variables = { user: any; jwtPayload: any; };

const stats = new Hono<{ Bindings: Env; Variables: Variables }>();

stats.use('*', authMiddleware);

stats.get('/', async (c) => {
  const user = c.get('user');
  const rows = await listSubscriptions(c.env.DB, user.id);
  const computed = computeStats(rows);

  // Also compute upcoming payments (next 30 days) server-side
  // For simplicity, we compute next payment dates here if start_date exists
  // We'll mirror client logic but simpler: upcoming = subs with start_date within 30 days? We'll compute proper.
  // To keep consistent with client, we return same structure but without dates (client can compute)
  // Let's also compute projections for 12 months
  const now = new Date();
  const upcoming: any[] = [];

  for (const row of rows.filter(r => !r.paused && r.start_date)) {
    try {
      const start = new Date(row.start_date!);
      if (isNaN(start.getTime())) continue;
      // Simple next payment estimation
      let next = new Date(start);
      while (next < now) {
        if (row.cycle === 'weekly') next.setDate(next.getDate() + 7);
        else if (row.cycle === 'monthly') next.setMonth(next.getMonth() + 1);
        else if (row.cycle === 'quarterly') next.setMonth(next.getMonth() + 3);
        else if (row.cycle === 'yearly') next.setFullYear(next.getFullYear() + 1);
      }
      const diffDays = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 30) {
        upcoming.push({
          subscription: rowToApi(row),
          date: next.toISOString(),
          daysUntil: diffDays,
        });
      }
    } catch {}
  }

  upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const upcomingTotal = upcoming.reduce((sum, u) => sum + u.subscription.cost, 0);

  return c.json({
    stats: {
      ...computed,
      upcoming,
      upcomingTotal,
    }
  });
});

// Export endpoint
stats.get('/export', async (c) => {
  const user = c.get('user');
  const format = c.req.query('format') || 'json';
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

export default stats;
