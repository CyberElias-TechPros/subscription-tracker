import type { Context, Next } from 'hono';

export function corsMiddleware(allowedOrigins: string[]) {
  return async (c: Context, next: Next) => {
    const origin = c.req.header('Origin') || '';
    const isAllowed = allowedOrigins.includes(origin) || allowedOrigins.includes('*') || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.endsWith('.vercel.app');

    if (isAllowed && origin) {
      c.header('Access-Control-Allow-Origin', origin);
    } else if (allowedOrigins.includes('*')) {
      c.header('Access-Control-Allow-Origin', '*');
    }
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    c.header('Access-Control-Allow-Credentials', 'true');
    c.header('Vary', 'Origin');

    if (c.req.method === 'OPTIONS') {
      return c.text('', { status: 204 } as any);
    }

    await next();
  };
}
