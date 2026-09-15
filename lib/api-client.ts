/**
 * API Client for Cloudflare Workers backend
 * Handles all communication with the subscription tracker API
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export interface ApiUser {
  id: string;
  email: string;
  name: string | null;
  currency: string;
  createdAt: number;
}

export interface ApiSubscription {
  id: string;
  name: string;
  cost: number;
  cycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  category: string;
  notes?: string;
  startDate?: string;
  paused: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ApiStats {
  monthly: number;
  yearly: number;
  weekly: number;
  daily: number;
  activeCount: number;
  pausedCount: number;
  categoryTotals: Array<{ category: string; monthly: number; share: number }>;
  mostExpensive: ApiSubscription | null;
  upcoming: Array<{ subscription: ApiSubscription; date: string; daysUntil: number }>;
  upcomingTotal: number;
}

class ApiError extends Error {
  status: number;
  details?: any;
  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request<T>(
  path: string,
  options: {
    method?: string;
    body?: any;
    token?: string | null;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const { method = 'GET', body, token, headers = {} } = options;

  const url = `${API_URL}${path}`;

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers: reqHeaders,
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, config);

    const contentType = res.headers.get('content-type');
    let data: any;

    if (contentType?.includes('application/json')) {
      data = await res.json();
    } else if (contentType?.includes('text/csv')) {
      data = await res.text();
      return data as unknown as T;
    } else {
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!res.ok) {
      throw new ApiError(
        data?.error || data?.message || `Request failed with ${res.status}`,
        res.status,
        data
      );
    }

    return data as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    // Network error
    throw new ApiError(
      err instanceof Error ? err.message : 'Network error',
      0
    );
  }
}

// Auth API
export const authApi = {
  async register(email: string, password: string, name?: string): Promise<{ user: ApiUser; token: string }> {
    return request('/api/auth/register', {
      method: 'POST',
      body: { email, password, name },
    });
  },

  async login(email: string, password: string): Promise<{ user: ApiUser; token: string }> {
    return request('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  async me(token: string): Promise<{ user: ApiUser }> {
    return request('/api/auth/me', { token });
  },

  async logout(token: string): Promise<{ message: string }> {
    return request('/api/auth/logout', { method: 'POST', token });
  },
};

// Subscriptions API
export const subscriptionsApi = {
  async list(token: string): Promise<{ subscriptions: ApiSubscription[]; count: number }> {
    return request('/api/subscriptions', { token });
  },

  async get(token: string, id: string): Promise<{ subscription: ApiSubscription }> {
    return request(`/api/subscriptions/${id}`, { token });
  },

  async create(token: string, data: Omit<ApiSubscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ subscription: ApiSubscription }> {
    return request('/api/subscriptions', {
      method: 'POST',
      body: {
        name: data.name,
        cost: data.cost,
        cycle: data.cycle,
        category: data.category,
        notes: data.notes,
        startDate: data.startDate,
        paused: data.paused,
      },
      token,
    });
  },

  async update(token: string, id: string, data: Partial<Omit<ApiSubscription, 'id' | 'createdAt' | 'updatedAt'>>): Promise<{ subscription: ApiSubscription }> {
    return request(`/api/subscriptions/${id}`, {
      method: 'PUT',
      body: data,
      token,
    });
  },

  async patch(token: string, id: string, data: Partial<Omit<ApiSubscription, 'id' | 'createdAt' | 'updatedAt'>>): Promise<{ subscription: ApiSubscription }> {
    return request(`/api/subscriptions/${id}`, {
      method: 'PATCH',
      body: data,
      token,
    });
  },

  async toggle(token: string, id: string): Promise<{ subscription: ApiSubscription }> {
    return request(`/api/subscriptions/${id}/toggle`, {
      method: 'POST',
      token,
    });
  },

  async delete(token: string, id: string): Promise<{ message: string; id: string }> {
    return request(`/api/subscriptions/${id}`, {
      method: 'DELETE',
      token,
    });
  },

  async clearAll(token: string): Promise<{ message: string }> {
    return request('/api/subscriptions', {
      method: 'DELETE',
      token,
    });
  },

  async import(token: string, subscriptions: any[]): Promise<{ subscriptions: ApiSubscription[]; count: number; imported: number }> {
    return request('/api/subscriptions/import', {
      method: 'POST',
      body: { subscriptions },
      token,
    });
  },
};

// Settings API
export const settingsApi = {
  async get(token: string): Promise<{ settings: { currency: string } }> {
    return request('/api/settings', { token });
  },

  async update(token: string, currency: string): Promise<{ settings: { currency: string } }> {
    return request('/api/settings', {
      method: 'PUT',
      body: { currency },
      token,
    });
  },
};

// Stats & Export API
export const statsApi = {
  async get(token: string): Promise<{ stats: ApiStats }> {
    return request('/api/stats', { token });
  },

  async exportJson(token: string): Promise<any> {
    return request('/api/export?format=json', { token });
  },

  async exportCsv(token: string): Promise<string> {
    const url = `${API_URL}/api/export?format=csv`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new ApiError('Export failed', res.status);
    return res.text();
  },
};

export { ApiError, API_URL };
