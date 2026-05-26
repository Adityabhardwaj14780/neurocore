/**
 * Shared type definitions for NeuroCore API responses and domain models.
 *
 * This is the single source of truth for data shapes flowing between
 * frontend and backend. If it's not here, it doesn't exist.
 */

// -----------------------------------------------------------------------
// Core domain types
// -----------------------------------------------------------------------

export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

export type UserRole = 'user' | 'admin';

/**
 * User — the domain model shared between frontend and backend.
 *
 * `subscriptionPlan` is the canonical field (matches backend exactly).
 * `plan` is a derived, frontend-friendly alias set during normalization.
 *   - Backend: "free" | "pro" | "enterprise"
 *   - plan alias: "Free" | "Pro" | "Enterprise"
 *
 * UI components should prefer `plan` for display labels.
 * API calls should use `subscriptionPlan` for the backend canonical values.
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  subscriptionPlan: SubscriptionPlan;
  /** Frontend-friendly alias — set by toFrontendUser() in AppContext. */
  plan?: 'Free' | 'Pro' | 'Enterprise';
  createdAt?: string;
  usage?: {
    apiCalls: number;
    lastLogin: string;
  };
}

// -----------------------------------------------------------------------
// API envelope
// -----------------------------------------------------------------------

export interface ApiResponse {
  success: boolean;
  message?: string;
  code?: string;
  data?: unknown;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    accessTokenExpiresInSec?: number;
  };
}

export interface RefreshResponse {
  success: boolean;
  data: {
    accessToken: string;
    accessTokenExpiresInSec?: number;
    user?: User;
  };
}

// -----------------------------------------------------------------------
// Plan mapping (frontend-friendly labels ↔ backend canonical values)
// -----------------------------------------------------------------------

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  free: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

/**
 * Convert backend plan string ("free"/"pro"/"enterprise") to
 * frontend display label ("Starter"/"Pro"/"Enterprise").
 */
export function planLabel(plan: SubscriptionPlan | string): string {
  return PLAN_LABELS[plan as SubscriptionPlan] ?? plan;
}

// -----------------------------------------------------------------------
// Token usage limits (must match backend)
// -----------------------------------------------------------------------

export const TOKEN_LIMITS: Record<SubscriptionPlan, number> = {
  free: 100_000,
  pro: 10_000_000,
  enterprise: 500_000_000,
};
