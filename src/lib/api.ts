/**
 * NeuroCore API client — typed, authenticated, auto-refreshing.
 *
 * TOKEN ARCHITECTURE:
 *   - Access token: in-memory ONLY (module-level variable). Lost on page refresh → triggers /refresh.
 *   - Refresh token: httpOnly, secure, signed cookie managed entirely by the browser. Never seen by JS.
 *
 * 401 / REFRESH FLOW:
 *   - When any request returns 401, the client attempts a single POST /auth/refresh.
 *   - On success: the new access token is stored in memory, and the original request is retried once.
 *   - On failure: the token is cleared, listeners are notified, and the user is effectively logged out.
 *   - Only ONE refresh can happen at a time; concurrent 401s are queued and share the single refresh call.
 *
 * SECURITY:
 *   - No token is ever written to localStorage, sessionStorage, or any persistent storage.
 *   - Refresh is cookie-only; the browser sends it automatically with credentials: 'include'.
 *   - Access token is never sent as a cookie — it goes in the Authorization header, which is
 *     not auto-sent cross-origin (defense-in-depth against CSRF on non-refresh endpoints).
 */

import type { AuthResponse, User, RefreshResponse, ApiResponse } from '../types/api';

// -----------------------------------------------------------------------
// Environment
// -----------------------------------------------------------------------

const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000').replace(/\/+$/, '');

// -----------------------------------------------------------------------
// In-memory token state (the ONLY place the access token lives)
// -----------------------------------------------------------------------

let accessToken: string | null = null;

/**
 * Set or clear the in-memory access token.
 * Never persists anywhere else.
 */
export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/**
 * Returns whether we currently hold an access token in memory.
 */
export function hasAccessToken(): boolean {
  return accessToken !== null;
}

// -----------------------------------------------------------------------
// Refresh deduplication
// -----------------------------------------------------------------------

type RefreshState = 'idle' | 'refreshing' | 'failed';
let refreshState: RefreshState = 'idle';
let refreshPromise: Promise<string | null> | null = null;

/**
 * Attempt to refresh the access token via the cookie-based refresh endpoint.
 *
 * Only ONE refresh can be in-flight at a time. Concurrent callers share
 * the same Promise and get the same result.
 *
 * Returns the new access token string, or null if refresh failed.
 */
async function doRefresh(): Promise<string | null> {
  // If already refreshing, return the existing promise.
  if (refreshState === 'refreshing' && refreshPromise) {
    return refreshPromise;
  }

  // If we know refresh has already failed, don't try again.
  if (refreshState === 'failed') {
    return null;
  }

  refreshState = 'refreshing';
  refreshPromise = (async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) return null;

      const body: RefreshResponse = await res.json();
      if (!body.success || !body.data?.accessToken) return null;

      return body.data.accessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
      refreshState = 'idle';
    }
  })();

  return refreshPromise;
}

// -----------------------------------------------------------------------
// Auth state change listeners (so AppContext can react to forced logout)
// -----------------------------------------------------------------------

type AuthStateListener = (authenticated: boolean) => void;
const listeners = new Set<AuthStateListener>();

export function onAuthStateChange(fn: AuthStateListener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

function notifyListeners(authenticated: boolean): void {
  listeners.forEach((fn) => fn(authenticated));
}

// -----------------------------------------------------------------------
// Generic request function
// -----------------------------------------------------------------------

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
  /** If true, don't attempt auto-refresh on 401 (the caller will handle it). */
  noRetry?: boolean;
}

/**
 * Core request function.
 *
 * - Automatically attaches the access token (if present) as `Authorization: Bearer ...`.
 * - Serializes `body` objects as JSON.
 * - On 401 (and noRetry is false), attempts one refresh + retry.
 * - Returns the parsed JSON response (type T).
 */
async function request<T = ApiResponse>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { noRetry, headers: customHeaders, body: requestBody, signal, method } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string> ?? {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: method ?? 'GET',
    headers,
    signal,
    body: requestBody
      ? typeof requestBody === 'string'
        ? requestBody
        : JSON.stringify(requestBody)
      : undefined,
    credentials: 'include',
  });

  // ---------- 401 handling ----------
  if (res.status === 401 && !noRetry) {
    const newToken = await doRefresh();

    if (newToken) {
      setAccessToken(newToken);
      // Retry the original request with the new token — only once (noRetry=true).
      return request<T>(path, { ...options, noRetry: true });
    }

    // Refresh failed — force logout.
    setAccessToken(null);
    notifyListeners(false);
    throw new ApiError('Session expired. Please sign in again.', 401, 'session_expired');
  }

  // ---------- Parse body ----------
  let data: unknown;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  }

  // ---------- Non-2xx ----------
  if (!res.ok) {
    const message = (data as ApiResponse)?.message || `Request failed with status ${res.status}`;
    const code = (data as ApiResponse)?.code;
    throw new ApiError(message, res.status, code);
  }

  return data as T;
}

// -----------------------------------------------------------------------
// Error type
// -----------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// -----------------------------------------------------------------------
// Auth API
// -----------------------------------------------------------------------

export const authApi = {
  /**
   * Register a new user. Returns access token + user data.
   * Refresh token is set by the server as an httpOnly cookie.
   */
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
    setAccessToken(res.data.accessToken);
    notifyListeners(true);
    return res;
  },

  /**
   * Log in. Returns access token + user data.
   * Refresh token is set by the server as an httpOnly cookie.
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setAccessToken(res.data.accessToken);
    notifyListeners(true);
    return res;
  },

  /**
   * Log out. Revokes the refresh token (server-side) and clears the cookie.
   * Also clears the in-memory access token.
   */
  async logout(): Promise<void> {
    try {
      await request('/api/v1/auth/logout', { method: 'POST', noRetry: true });
    } catch {
      // Network error — still clear local state.
    } finally {
      setAccessToken(null);
      notifyListeners(false);
    }
  },

  /**
   * Fetch the current user profile. Uses the access token from memory.
   */
  async me(): Promise<{ success: boolean; data: { user: User } }> {
    return request('/api/v1/auth/me');
  },

  /**
   * Attempt to restore a session by refreshing.
   * Called on app startup to rehydrate the access token from the cookie.
   * Returns the user data on success, or null if no active session exists.
   */
  async restoreSession(): Promise<User | null> {
    const token = await doRefresh();
    if (!token) return null;
    setAccessToken(token);
    notifyListeners(true);

    try {
      const { data } = await authApi.me();
      return data.user;
    } catch {
      setAccessToken(null);
      notifyListeners(false);
      return null;
    }
  },
};

// -----------------------------------------------------------------------
// Dashboard / User API
// -----------------------------------------------------------------------

export const dashboardApi = {
  async getDashboard(): Promise<{ success: boolean; data: { dashboardData: any } }> {
    return request('/api/v1/dashboard');
  },

  async updateSubscription(plan: string): Promise<{ success: boolean; data: { user: User } }> {
    return request('/api/v1/dashboard/subscription', {
      method: 'PUT',
      body: { plan },
    });
  },
};

export const userApi = {
  async updateProfile(updates: { name?: string }): Promise<{ success: boolean; data: { user: User } }> {
    return request('/api/v1/user/update', {
      method: 'PUT',
      body: updates,
    });
  },

  async deleteAccount(): Promise<{ success: boolean }> {
    return request('/api/v1/user/delete', { method: 'DELETE' });
  },
};

// -----------------------------------------------------------------------
// AI API
// -----------------------------------------------------------------------

export const aiApi = {
  async chat(message: string, conversationId?: string): Promise<{
    success: boolean;
    data: { userMessage: any; aiResponse: string; conversationId: string };
  }> {
    return request('/api/v1/ai/chat', {
      method: 'POST',
      body: { message, conversationId },
    });
  },

  async getConversations(): Promise<{ success: boolean; data: { conversations: any[] } }> {
    return request('/api/v1/ai/conversations');
  },

  async getConversation(id: string): Promise<{ success: boolean; data: { conversation: any } }> {
    return request(`/api/v1/ai/conversation/${id}`);
  },
};

// -----------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------

export { API_BASE };
export default request;
