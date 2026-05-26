/**
 * Centralized environment configuration.
 *
 * WHY THIS MATTERS:
 *   - Fail-fast at boot if any required secret is missing or insecure.
 *   - Single source of truth: every module imports from here, never reads process.env directly.
 *   - Production rejects weak/default secrets; dev mode can auto-generate them.
 *   - Typed config object gives IDE autocomplete + compile-time safety.
 */

type NodeEnv = 'development' | 'test' | 'production' | 'staging';

interface AppConfig {
  nodeEnv: NodeEnv;
  isProduction: boolean;
  port: number;
  frontendUrl: string;
  apiPrefix: string;

  // Database
  mongoUri: string;
  mongoPoolSize: number;
  mongoConnectTimeoutMs: number;

  // Auth secrets — NEVER default in production
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresInSec: number;
    refreshExpiresInSec: number;
    issuer: string;
    audience: string;
  };

  // Cookies
  cookieSecret: string;

  // Rate limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    authWindowMs: number;
    authMaxRequests: number;
  };

  // CORS
  cors: {
    origins: string[];
    credentials: boolean;
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`[env] Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim() !== '' ? value : fallback;
}

function requireStrongSecret(name: string, isProduction: boolean): string {
  const value = process.env[name];

  if (!value || value.trim() === '' || value === 'secret' || value.length < 32) {
    if (isProduction) {
      throw new Error(
        `[env] ${name} is missing or too weak in production. ` +
          `Must be >= 32 chars and not a default value. Generate with: openssl rand -base64 48`
      );
    }
    // Dev: generate a random one so we don't accidentally deploy with "secret"
    const crypto = require('crypto');
    const generated = crypto.randomBytes(48).toString('base64url');
    console.warn(
      `[env] ${name} not set or too weak — auto-generated ephemeral value for ${process.env.NODE_ENV || 'development'}.`
    );
    return generated;
  }
  return value;
}

function parseOrigins(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseIntEnv(name: string, fallback: number, min = 0): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < min) {
    throw new Error(`[env] ${name} must be a number >= ${min}, got "${raw}"`);
  }
  return n;
}

export function loadConfig(): AppConfig {
  const nodeEnv = (optionalEnv('NODE_ENV', 'development') as NodeEnv);
  const isProduction = nodeEnv === 'production';

  // In production, we MUST have an explicit frontend URL (no wildcard CORS)
  const frontendUrl = isProduction
    ? requireEnv('FRONTEND_URL')
    : optionalEnv('FRONTEND_URL', 'http://localhost:3000');

  return {
    nodeEnv,
    isProduction,
    port: parseIntEnv('PORT', 5000, 1),
    frontendUrl,
    apiPrefix: '/api/v1',

    mongoUri: optionalEnv('MONGO_URI', 'mongodb://localhost:27017/neuro-core'),
    mongoPoolSize: parseIntEnv('MONGO_POOL_SIZE', 10, 1),
    mongoConnectTimeoutMs: parseIntEnv('MONGO_CONNECT_TIMEOUT_MS', 10000, 1000),

    jwt: {
      accessSecret: requireStrongSecret('JWT_ACCESS_SECRET', isProduction),
      refreshSecret: requireStrongSecret('JWT_REFRESH_SECRET', isProduction),
      accessExpiresInSec: parseIntEnv('JWT_ACCESS_EXPIRES_SEC', 15 * 60, 60), // 15 min
      refreshExpiresInSec: parseIntEnv('JWT_REFRESH_EXPIRES_SEC', 7 * 24 * 60 * 60, 60 * 60), // 7 days
      issuer: optionalEnv('JWT_ISSUER', 'neurocore-api'),
      audience: optionalEnv('JWT_AUDIENCE', 'neurocore-client'),
    },

    cookieSecret: requireStrongSecret('COOKIE_SECRET', isProduction),

    rateLimit: {
      windowMs: parseIntEnv('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000, 1000),
      maxRequests: parseIntEnv('RATE_LIMIT_MAX', 100, 1),
      authWindowMs: parseIntEnv('AUTH_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000, 1000),
      authMaxRequests: parseIntEnv('AUTH_RATE_LIMIT_MAX', 10, 1),
    },

    cors: {
      origins: parseOrigins(
        optionalEnv('CORS_ORIGINS', frontendUrl)
      ),
      credentials: optionalEnv('CORS_CREDENTIALS', 'true') === 'true',
    },
  };
}

// Singleton — load once at startup. Any failure throws and aborts boot.
export const config: AppConfig = loadConfig();

export default config;
