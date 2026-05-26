/**
 * User model.
 *
 * CHANGES FROM ORIGINAL:
 *   - Added loginAttempts + lockUntil fields for brute-force protection.
 *   - Added lastPasswordChange for forced re-auth on password changes.
 *   - Removed unused resetPassword* fields if not yet wired (kept for compatibility).
 *   - Explicit indexes on email (unique) and createdAt for queries.
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string; // bcrypt hash
  name: string;
  role: 'user' | 'admin';
  subscriptionPlan: 'free' | 'pro' | 'enterprise';
  usage: {
    apiCalls: number;
    lastLogin: Date;
    createdAt: Date;
  };
  isActive: boolean;

  // Brute-force lockout
  loginAttempts: number;
  lockUntil: Date | null;

  // Password change tracking — used to invalidate sessions older than this.
  lastPasswordChange: Date;

  // Legacy / future password reset flow
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;

  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 8 },
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 100 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    subscriptionPlan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
    usage: {
      apiCalls: { type: Number, default: 0 },
      lastLogin: { type: Date, default: Date.now },
      createdAt: { type: Date, default: Date.now },
    },
    isActive: { type: Boolean, default: true },

    loginAttempts: { type: Number, default: 0, required: true },
    lockUntil: { type: Date, default: null },

    lastPasswordChange: { type: Date, default: Date.now },

    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

// Case-insensitive unique email lookup is covered by the lowercase transform + unique index above.

UserSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

UserSchema.methods.incrementLoginAttempts = async function (): Promise<void> {
  const authConfig = require('../config/auth').default;

  // If lock has expired, reset the counter.
  if (this.lockUntil && this.lockUntil < new Date()) {
    await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
    return;
  }

  const updates: any = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= authConfig.maxLoginAttempts && !this.isLocked()) {
    updates.$set = { lockUntil: new Date(Date.now() + authConfig.lockoutDurationMs) };
  }
  await this.updateOne(updates);
};

UserSchema.methods.resetLoginAttempts = async function (): Promise<void> {
  await this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

export default mongoose.model<IUser>('User', UserSchema);
