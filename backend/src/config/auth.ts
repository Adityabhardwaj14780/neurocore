/**
 * Auth configuration constants — all derived from config/env.ts.
 *
 * WHY THIS MATTERS:
 *   - Single place to tweak auth behavior.
 *   - Avoids magic numbers and inline env reads scattered across the codebase.
 *   - Makes it trivial to write tests that override values per-suite.
 */

import config from './env';

export const authConfig = {
  // Bcrypt cost factor. 12 is current best-practice balance (~250ms on modern CPUs).
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),

  // Refresh token stored hashed in DB (never the raw JWT). Prevents DB-leak → session hijack.
  refreshTokenHashRounds: 10,

  // Account lockout after N consecutive failed logins (defense in depth against brute force).
  maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
  lockoutDurationMs: parseInt(process.env.LOCKOUT_DURATION_MS || String(15 * 60 * 1000), 10),

  // Password policy (enforced in validator + frontend).
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    // Disallow the 10k most common passwords — cheap, high-value check.
    denyCommonPasswords: true,
  },

  // Token lifetimes (mirrored from env for easy access).
  accessToken: {
    expiresInSec: config.jwt.accessExpiresInSec,
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  },
  refreshToken: {
    expiresInSec: config.jwt.refreshExpiresInSec,
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  },
} as const;

export default authConfig;
