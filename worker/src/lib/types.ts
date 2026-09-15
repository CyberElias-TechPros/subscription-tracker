export type Env = {
  DB: D1Database;
  STORAGE: R2Bucket;
  CACHE: KVNamespace;
  JWT_SECRET: string;
  FRONTEND_URL: string;
  ENVIRONMENT: string;
};

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  currency: string;
  created_at: number;
  updated_at: number;
}

export interface SubscriptionRow {
  id: string;
  user_id: string;
  name: string;
  cost: number;
  cycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  category: string;
  notes: string | null;
  start_date: string | null;
  paused: number;
  created_at: number;
  updated_at: number;
}

export interface JwtPayload {
  sub: string; // user id
  email: string;
  exp: number;
  iat: number;
}
