/**
 * AppContext — production auth integration with NeuroCore backend.
 *
 * WHAT THIS DOES:
 *   - On mount: attempts to restore the session via POST /auth/refresh (cookie-based).
 *   - Provides login / signup / logout functions that call the real backend.
 *   - Protects routes: unauthenticated users visiting /dashboard are redirected to /auth.
 *   - Maintains a reactive auth lifecycle: loading → authenticated / unauthenticated.
 *
 * WHAT WAS REMOVED:
 *   - localStorage["nc_users"] — the browser-side user DB with SHA-256 hashes.
 *   - sessionStorage["nc_session"] — the in-tab session cache.
 *   - All SHA-256 password hashing in the browser.
 *   - Plan mutation without server validation.
 *
 * WHAT REMAINS:
 *   - The hash-based router (window.location.hash) — still the navigation mechanism.
 *   - The User type shape is preserved for UI compatibility.
 *   - setPlan still updates local state AND persists via the backend.
 */

import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from 'react';
import { authApi, dashboardApi, setAccessToken, onAuthStateChange } from '../lib/api';
import { ApiError } from '../lib/api';
import type { User } from '../types/api';

// -----------------------------------------------------------------------
// Public type — the shape the UI components depend on
// -----------------------------------------------------------------------

/**
 * Normalized user shape used across the frontend.
 * Maps the backend's `subscriptionPlan` → `plan` for backwards compatibility
 * with existing UI components.
 */
export type { User } from '../types/api';

type AppContextType = {
  /** The authenticated user, or null if unauthenticated. */
  user: User | null;

  /** True while the initial session-restore request is in flight. */
  loading: boolean;

  /** Log in with email + password. */
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;

  /** Register a new account. */
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;

  /** Sign out — revokes token on server and clears local state. */
  logout: () => void;

  /** Change the user's subscription plan (calls backend). */
  setPlan: (plan: string) => void;

  /** Current hash-based route (without the leading #). */
  route: string;

  /** Navigate to a new hash route. */
  navigate: (path: string) => void;
};

// -----------------------------------------------------------------------
// Context + provider
// -----------------------------------------------------------------------

const AppContext = createContext<AppContextType | null>(null);

/**
 * Map backend plan string to frontend display string.
 * Backend: "free" | "pro" | "enterprise"
 * Frontend: "Free" | "Pro" | "Enterprise"
 */
function normalizePlan(raw: string): 'Free' | 'Pro' | 'Enterprise' {
  switch (raw.toLowerCase()) {
    case 'pro': return 'Pro';
    case 'enterprise': return 'Enterprise';
    default: return 'Free';
  }
}

/**
 * Convert backend User (with subscriptionPlan) to frontend User (with plan).
 */
function toFrontendUser(backend: any): User {
  return {
    id: backend.id,
    email: backend.email,
    name: backend.name,
    role: backend.role ?? 'user',
    subscriptionPlan: backend.subscriptionPlan ?? 'free',
    plan: normalizePlan(backend.subscriptionPlan ?? 'free'),
    createdAt: backend.createdAt ?? backend.usage?.createdAt ?? new Date().toISOString(),
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState<string>(() => window.location.hash.replace(/^#/, '') || '/');

  // ---- Navigation ----
  const navigate = useCallback((path: string) => {
    window.location.hash = path;
    setRoute(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ---- Session restoration on mount ----
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Try to refresh the cookie → get a new access token → fetch /me.
        const restored = await authApi.restoreSession();
        if (!cancelled && restored) {
          setUser(toFrontendUser(restored));
        }
      } catch {
        // No active session — user is unauthenticated. That's fine.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // ---- React to forced logout (e.g. refresh token reuse detection) ----
  useEffect(() => {
    return onAuthStateChange((authenticated) => {
      if (!authenticated) {
        setUser(null);
        setAccessToken(null);
      }
    });
  }, []);

  // ---- Hash change listener ----
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.replace(/^#/, '') || '/');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // ---- Redirect to /auth if accessing protected route while unauthenticated ----
  useEffect(() => {
    if (!loading && !user && route === '/dashboard') {
      navigate('/auth?mode=login');
    }
  }, [loading, user, route, navigate]);

  // ---- Auth operations ----
  const login: AppContextType['login'] = async (email, password) => {
    try {
      const res = await authApi.login(email, password);
      setUser(toFrontendUser(res.data.user));
      navigate('/dashboard');
      return { ok: true };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Login failed. Please try again.';
      return { ok: false, error: message };
    }
  };

  const signup: AppContextType['signup'] = async (name, email, password) => {
    try {
      const res = await authApi.register(name, email, password);
      setUser(toFrontendUser(res.data.user));
      navigate('/dashboard');
      return { ok: true };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Registration failed. Please try again.';
      return { ok: false, error: message };
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    navigate('/');
  };

  const setPlan = async (plan: string) => {
    if (!user) return;
    try {
      await dashboardApi.updateSubscription(plan.toLowerCase());
      const updated = { ...user, plan: normalizePlan(plan) };
      setUser(updated);
    } catch {
      // Backend failed — keep local state as-is.
    }
  };

  // ---- Value ----
  const value = useMemo<AppContextType>(
    () => ({ user, loading, login, signup, logout, setPlan, route, navigate }),
    [user, loading, login, signup, logout, setPlan, route, navigate]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
