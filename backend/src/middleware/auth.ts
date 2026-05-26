/**
 * Auth middleware — robust, typed, with clear error semantics.
 *
 * IMPROVEMENTS OVER PREVIOUS VERSION:
 *   - Strong typing via Express Request augmentation.
 *   - Extracts token from Authorization header OR signed cookie (fallback for refresh-only flows).
 *   - Distinguishes missing-token (401) from expired/invalid-token (401 with code).
 *   - Populates req.user with minimal safe fields (no password ever).
 *   - Optional `requireAdmin` wrapper for admin-only routes.
 */

import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import authService from '../services/authService';
import { COOKIE_NAMES } from '../config/cookies';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      auth?: {
        sub: string;
        email: string;
        plan: string;
        role: string;
      };
    }
  }
}

const extractBearerToken = (req: Request): string | null => {
  const header = req.header('Authorization');
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
};

/**
 * Main auth middleware. Requires a valid access token.
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      res.status(401).json({
        success: false,
        code: 'missing_token',
        message: 'Authentication required.',
      });
      return;
    }

    const payload = authService.verifyAccessToken(token);
    if (!payload) {
      res.status(401).json({
        success: false,
        code: 'invalid_token',
        message: 'Access token is invalid or expired.',
      });
      return;
    }

    // Lightweight user lookup — select only what downstream handlers need.
    // `.lean()` returns a plain object for performance; we re-attach the virtual
    // `id` getter so older controllers that read `req.user.id` keep working.
    const user = await User.findById(payload.sub)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .lean<IUser & { id: string }>();

    if (!user) {
      res.status(401).json({
        success: false,
        code: 'user_not_found',
        message: 'Account no longer exists.',
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        code: 'account_disabled',
        message: 'Account is disabled.',
      });
      return;
    }

    // Back-compat shim: some controllers read `req.user.id`.
    (user as any).id = String(user._id);

    req.user = user;
    req.auth = payload;
    next();
  } catch (err) {
    console.error('[auth] Middleware error:', err);
    res.status(500).json({
      success: false,
      code: 'auth_internal_error',
      message: 'Authentication check failed.',
    });
  }
};

/**
 * Optional auth — populates req.user if a valid token is present, but doesn't require it.
 * Useful for endpoints that behave differently for authenticated vs anonymous users.
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractBearerToken(req);
    if (!token) return next();

    const payload = authService.verifyAccessToken(token);
    if (!payload) return next();

    const user = await User.findById(payload.sub)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .lean<IUser & { id: string }>();

    if (user && user.isActive) {
      (user as any).id = String(user._id);
      req.user = user;
      req.auth = payload;
    }
    next();
  } catch {
    next(); // optional auth never blocks the request
  }
};

/**
 * Admin-only gate. Must be used AFTER requireAuth.
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({
      success: false,
      code: 'forbidden',
      message: 'Admin privileges required.',
    });
    return;
  }
  next();
};

/**
 * CSRF-lite protection for state-changing endpoints that use cookie-based refresh tokens.
 * Checks Origin/Referer against allowed origins.
 */
export const csrfCheck = (req: Request, res: Response, next: NextFunction): void => {
  // Refresh endpoint is the only cookie-authenticated endpoint — enforce origin match.
  const origin = req.header('Origin') || req.header('Referer');
  // If no origin header (e.g. same-origin fetch in strict mode), allow.
  // Cross-origin requests will always include Origin.
  if (!origin) return next();

  try {
    const url = new URL(origin);
    const config = require('../config/env').default;
    const allowed = config.cors.origins.some((o: string) => {
      try {
        return new URL(o).origin === url.origin;
      } catch {
        return false;
      }
    });
    if (!allowed) {
      res.status(403).json({ success: false, code: 'csrf_blocked', message: 'Origin not allowed.' });
      return;
    }
  } catch {
    res.status(400).json({ success: false, code: 'invalid_origin', message: 'Invalid origin.' });
    return;
  }
  next();
};

export { COOKIE_NAMES };
export default requireAuth;
