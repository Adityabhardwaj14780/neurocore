/**
 * Rate limiters.
 *
 * WHY THIS MATTERS:
 *   - Auth endpoints need stricter limits than general API (brute force).
 *   - Per-IP key prevents a single attacker from exhausting global budget.
 *   - Standard headers (X-RateLimit-*) help clients back off.
 */

import rateLimit from 'express-rate-limit';
import config from '../config/env';

export const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, code: 'rate_limited', message: 'Too many requests, please slow down.' },
});

export const authLimiter = rateLimit({
  windowMs: config.rateLimit.authWindowMs,
  max: config.rateLimit.authMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: {
    success: false,
    code: 'auth_rate_limited',
    message: 'Too many authentication attempts, please try again later.',
  },
});

export default globalLimiter;
