/**
 * RefreshToken model — stored hashed, one document per issued refresh token.
 *
 * WHY THIS MATTERS:
 *   - Tokens are hashed before storage. DB breach → no usable tokens.
 *   - `family` field enables rotation: issuing a new refresh token within the same
 *     family invalidates older ones. If a stolen token is reused after rotation,
 *     we detect it (family has a newer token) and revoke the entire family.
 *   - `expiresAt` TTL index auto-cleans stale rows.
 *   - `userAgent/ip` aid forensics on compromised accounts.
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IRefreshToken extends Document {
  tokenHash: string; // SHA-256 of the raw JWT — never store raw
  userId: mongoose.Types.ObjectId;
  family: string; // groups rotated tokens together
  expiresAt: Date;
  revokedAt?: Date;
  revokedReason?: 'logout' | 'rotation' | 'reuse_detected' | 'admin';
  userAgent?: string;
  ip?: string;
  createdAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    tokenHash: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    family: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }, // TTL index
    revokedAt: { type: Date, default: null },
    revokedReason: { type: String, default: null },
    userAgent: { type: String },
    ip: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Compound index: fast lookup of a user's active tokens in a family.
RefreshTokenSchema.index({ userId: 1, family: 1, revokedAt: 1 });

export default mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
