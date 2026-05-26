/**
 * Auth controller — login / register / refresh / logout / me.
 *
 * FLOW:
 *   1. login    → validates creds, checks lockout, issues access (JSON) + refresh (httpOnly cookie).
 *   2. register → validates inputs, creates user, issues tokens.
 *   3. refresh  → reads signed refresh cookie, rotates, sets new cookie.
 *   4. logout   → revokes the refresh token (cookie + DB), clears cookie.
 *   5. me       → returns the current user (requires access token).
 */

import { Request, Response } from 'express';
import User from '../models/User';
import authService from '../services/authService';
import userService from '../services/userService';
import { validateEmail, validatePassword, validateName } from '../utils/validators';
import { COOKIE_NAMES, refreshTokenCookieOptions, clearCookieOptions } from '../config/cookies';
import config from '../config/env';
import authConfig from '../config/auth';

const extractClientMeta = (req: Request) => ({
  userAgent: req.header('User-Agent'),
  ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip,
});

const sendTokenPair = (res: Response, pair: ReturnType<typeof authService.issueTokenPair> extends Promise<infer T> ? T : never, user: any) => {
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, pair.refreshToken, refreshTokenCookieOptions());
  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
      },
      accessToken: pair.accessToken,
      accessTokenExpiresInSec: config.jwt.accessExpiresInSec,
    },
  });
};

const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, name } = req.body ?? {};

    const emailCheck = validateEmail(email);
    if (!emailCheck.ok) return res.status(400).json({ success: false, message: emailCheck.error });
    const passCheck = validatePassword(password);
    if (!passCheck.ok) return res.status(400).json({ success: false, message: passCheck.error });
    const nameCheck = validateName(name);
    if (!nameCheck.ok) return res.status(400).json({ success: false, message: nameCheck.error });

    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail }).select('_id');
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = await authService.hashPassword(password);
    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      name: String(name).trim(),
    });

    const pair = await authService.issueTokenPair(user, extractClientMeta(req));
    return sendTokenPair(res, pair, user);
  } catch (err: any) {
    // Mongoose duplicate-key error
    if (err?.code === 11000) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }
    console.error('[auth] register error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    // Generic message — don't reveal whether the email exists.
    if (!user) {
      return res.status(401).json({ success: false, code: 'invalid_credentials', message: 'Invalid credentials.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, code: 'account_disabled', message: 'Account is disabled.' });
    }

    // Lockout check
    if (user.isLocked()) {
      return res.status(423).json({
        success: false,
        code: 'account_locked',
        message: 'Too many failed attempts. Try again later.',
        retryAfterMs: user.lockUntil ? user.lockUntil.getTime() - Date.now() : 0,
      });
    }

    const isMatch = await authService.comparePassword(password, user.password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      return res.status(401).json({ success: false, code: 'invalid_credentials', message: 'Invalid credentials.' });
    }

    // Successful login — reset lockout counter and update lastLogin
    await user.resetLoginAttempts();
    await userService.updateLastLogin(user._id.toString());

    const pair = await authService.issueTokenPair(user, extractClientMeta(req));
    return sendTokenPair(res, pair, user);
  } catch (err) {
    console.error('[auth] login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

/**
 * Refresh endpoint — rotates refresh token, issues new access token.
 * Called by the frontend when access token expires. Cookie-only (no Bearer).
 */
const refresh = async (req: Request, res: Response): Promise<any> => {
  try {
    const rawToken = req.signedCookies?.[COOKIE_NAMES.REFRESH_TOKEN];
    if (!rawToken) {
      return res.status(401).json({ success: false, code: 'no_refresh_token', message: 'No refresh token.' });
    }

    const result = await authService.rotateRefreshToken(rawToken, extractClientMeta(req));
    if (!result.ok) {
      // Clear the (now-invalid) cookie regardless of the error reason.
      res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, clearCookieOptions());
      const status = result.code === 'reuse_detected' ? 403 : 401;
      return res.status(status).json({ success: false, code: result.code, message: result.message });
    }

    // Decode the new refresh token (without verifying — we already verified during rotation)
    // to extract the user id for the response payload.
    const User = (await import('../models/User')).default;
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.decode(result.pair.refreshToken) as { sub: string } | null;
    const freshUser = decoded ? await User.findById(decoded.sub).select('-password').lean() : null;

    if (!freshUser) {
      res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, clearCookieOptions());
      return res.status(401).json({ success: false, code: 'user_not_found', message: 'User no longer exists.' });
    }

    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, result.pair.refreshToken, refreshTokenCookieOptions());
    return res.json({
      success: true,
      data: {
        accessToken: result.pair.accessToken,
        accessTokenExpiresInSec: config.jwt.accessExpiresInSec,
        user: {
          id: (freshUser as any)._id,
          email: (freshUser as any).email,
          name: (freshUser as any).name,
          role: (freshUser as any).role,
          subscriptionPlan: (freshUser as any).subscriptionPlan,
        },
      },
    });
  } catch (err) {
    console.error('[auth] refresh error:', err);
    return res.status(500).json({ success: false, message: 'Server error during token refresh.' });
  }
};

/**
 * Logout — revoke the presented refresh token and clear the cookie.
 */
const logout = async (req: Request, res: Response): Promise<any> => {
  try {
    const rawToken = req.signedCookies?.[COOKIE_NAMES.REFRESH_TOKEN];
    if (rawToken) {
      await authService.revokeRefreshToken(rawToken);
    }
    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, clearCookieOptions());
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    console.error('[auth] logout error:', err);
    return res.status(500).json({ success: false, message: 'Server error during logout.' });
  }
};

/**
 * Logout all devices — revoke every active refresh token for the user.
 * Useful after password change or suspected compromise.
 */
const logoutAll = async (req: Request, res: Response): Promise<any> => {
  try {
    const count = await authService.revokeAllRefreshTokens(req.user!._id.toString(), 'logout');
    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, clearCookieOptions());
    return res.json({ success: true, message: `Revoked ${count} active session(s).` });
  } catch (err) {
    console.error('[auth] logoutAll error:', err);
    return res.status(500).json({ success: false, message: 'Server error during logout all.' });
  }
};

/**
 * GET /me — current authenticated user.
 */
const getProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = await User.findById(req.user!._id).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true, data: { user } });
  } catch (err) {
    console.error('[auth] getProfile error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

export default {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getProfile,
};
