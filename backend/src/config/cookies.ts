/**
 * Cookie option factories.
 *
 * WHY THIS MATTERS:
 *   - Refresh tokens live in httpOnly cookies — misconfiguration = XSS token theft.
 *   - SameSite=Strict prevents CSRF on modern browsers.
 *   - Secure flag enforced in production (cookies never travel over plain HTTP).
 *   - signed: true uses cookieSecret so tampered cookies are rejected.
 */

import type { CookieOptions } from 'express';
import config from './env';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function refreshTokenCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: config.isProduction, // true in prod — HTTPS only
    sameSite: config.isProduction ? 'strict' : 'lax',
    signed: true,
    path: '/',
    maxAge: config.jwt.refreshExpiresInSec * 1000,
    // Prevent JavaScript access — critical defense against XSS.
  };
}

export function clearCookieOptions(): CookieOptions {
  // To delete a cookie, send the same path/domain with maxAge=0.
  return {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'strict' : 'lax',
    signed: true,
    path: '/',
    maxAge: 0,
  };
}

export const COOKIE_NAMES = {
  REFRESH_TOKEN: 'nc_refresh_token',
} as const;

export { ONE_DAY_MS };
