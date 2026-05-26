/**
 * Auth service — all authentication primitives in one place.
 *
 * KEY IMPROVEMENTS:
 *   1. Separate access + refresh secrets (defense in depth).
 *   2. Refresh tokens are ROTATED — each use issues a new one and revokes the old.
 *   3. Refresh token reuse detection: if a revoked token is presented, the entire
 *      family is nuked (indicates theft).
 *   4. Tokens stored hashed (SHA-256) — DB leak does not leak sessions.
 *   5. Short-lived access tokens (15 min default) limit blast radius.
 */

import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import config from '../config/env';
import authConfig from '../config/auth';
import RefreshToken, { IRefreshToken } from '../models/RefreshToken';

export interface TokenPair {
  accessToken: string;
  refreshToken: string; // raw — caller stores hashed copy in DB + sends via cookie
  refreshTokenFamily: string;
  refreshExpiresAt: Date;
}

export interface AccessTokenPayload {
  sub: string; // user id
  email: string;
  plan: string;
  role: string;
}

export interface RefreshTokenPayload {
  sub: string;
  family: string;
  jti: string; // unique id per refresh token (for revocation)
}

const hashToken = (raw: string): string =>
  crypto.createHash('sha256').update(raw).digest('hex');

const generateAccessToken = (payload: AccessTokenPayload): string => {
  const opts: SignOptions = {
    expiresIn: config.jwt.accessExpiresInSec,
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
    algorithm: 'HS256',
  };
  return jwt.sign(payload, config.jwt.accessSecret, opts);
};

const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  const opts: SignOptions = {
    expiresIn: config.jwt.refreshExpiresInSec,
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
    algorithm: 'HS256',
  };
  return jwt.sign(payload, config.jwt.refreshSecret, opts);
};

const hashPassword = async (password: string): Promise<string> =>
  bcrypt.hash(password, authConfig.bcryptSaltRounds);

const comparePassword = async (password: string, hash: string): Promise<boolean> =>
  bcrypt.compare(password, hash);

/**
 * Issue a fresh access + refresh token pair. Called on:
 *   - initial signup / login
 *   - successful refresh rotation
 */
export const issueTokenPair = async (
  user: { _id: any; email: string; subscriptionPlan: string; role: string },
  meta: { userAgent?: string; ip?: string },
  familyOverride?: string
): Promise<TokenPair> => {
  const family = familyOverride || crypto.randomUUID();
  const jti = crypto.randomUUID();

  const accessToken = generateAccessToken({
    sub: user._id.toString(),
    email: user.email,
    plan: user.subscriptionPlan,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    sub: user._id.toString(),
    family,
    jti,
  });

  const refreshExpiresAt = new Date(
    Date.now() + config.jwt.refreshExpiresInSec * 1000
  );

  // Persist hashed refresh token for rotation / revocation.
  await RefreshToken.create({
    tokenHash: hashToken(refreshToken),
    userId: user._id,
    family,
    expiresAt: refreshExpiresAt,
    userAgent: meta.userAgent,
    ip: meta.ip,
  });

  return { accessToken, refreshToken, refreshTokenFamily: family, refreshExpiresAt };
};

/**
 * Rotate a refresh token: validate, revoke old, issue new in the same family.
 *
 * REUSE DETECTION:
 *   If the presented token was already revoked (i.e. someone replayed a stolen
 *   token after the legitimate user rotated), we nuke the entire family.
 *   This is the "refresh token theft detection" pattern recommended by OAuth 2.1.
 */
export const rotateRefreshToken = async (
  rawToken: string,
  meta: { userAgent?: string; ip?: string }
): Promise<{ ok: true; pair: TokenPair } | { ok: false; code: string; message: string }> => {
  let decoded: RefreshTokenPayload;
  try {
    decoded = jwt.verify(rawToken, config.jwt.refreshSecret, {
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    }) as RefreshTokenPayload;
  } catch {
    return { ok: false, code: 'invalid_token', message: 'Invalid refresh token.' };
  }

  const stored = await RefreshToken.findOne({ tokenHash: hashToken(rawToken) });

  if (!stored) {
    // Unknown token — could be a forgery attempt. Don't leak info.
    return { ok: false, code: 'unknown_token', message: 'Unknown refresh token.' };
  }

  if (stored.revokedAt) {
    // REUSE DETECTED: someone is presenting a token that was already rotated out.
    // Nuke the entire family — safest response.
    await RefreshToken.updateMany(
      { family: stored.family, revokedAt: null },
      { $set: { revokedAt: new Date(), revokedReason: 'reuse_detected' } }
    );
    return {
      ok: false,
      code: 'reuse_detected',
      message: 'Refresh token reuse detected. All sessions in this family revoked.',
    };
  }

  if (stored.expiresAt < new Date()) {
    await stored.updateOne({ $set: { revokedAt: new Date(), revokedReason: 'logout' } });
    return { ok: false, code: 'expired', message: 'Refresh token expired.' };
  }

  // Revoke the old token (rotation).
  await stored.updateOne({ $set: { revokedAt: new Date(), revokedReason: 'rotation' } });

  // Look up the user to issue a new pair.
  const User = (await import('../models/User')).default;
  const user = await User.findById(decoded.sub).select('-password');
  if (!user) {
    return { ok: false, code: 'user_not_found', message: 'User no longer exists.' };
  }

  const pair = await issueTokenPair(user, meta, stored.family);
  return { ok: true, pair };
};

/**
 * Revoke a single refresh token (logout from one device).
 */
export const revokeRefreshToken = async (rawToken: string): Promise<void> => {
  const hash = hashToken(rawToken);
  await RefreshToken.updateOne(
    { tokenHash: hash, revokedAt: null },
    { $set: { revokedAt: new Date(), revokedReason: 'logout' } }
  );
};

/**
 * Revoke every active session for a user (password change, account compromise, admin action).
 */
export const revokeAllRefreshTokens = async (userId: string, reason: IRefreshToken['revokedReason'] = 'admin'): Promise<number> => {
  const result = await RefreshToken.updateMany(
    { userId, revokedAt: null },
    { $set: { revokedAt: new Date(), revokedReason: reason } }
  );
  return result.modifiedCount;
};

/**
 * Verify an access token. Returns the decoded payload or null.
 */
export const verifyAccessToken = (
  token: string
): AccessTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret, {
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    }) as JwtPayload & AccessTokenPayload;
    return {
      sub: decoded.sub,
      email: decoded.email,
      plan: decoded.plan,
      role: decoded.role,
    };
  } catch {
    return null;
  }
};

const validateEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default {
  hashPassword,
  comparePassword,
  issueTokenPair,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllRefreshTokens,
  verifyAccessToken,
  validateEmail,
  hashToken,
};
