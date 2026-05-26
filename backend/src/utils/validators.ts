/**
 * Input validators.
 *
 * WHY THIS MATTERS:
 *   - Single source of truth for password/email rules (shared by controller + client).
 *   - Common-password check blocks the top-10k worst offenders.
 *   - Detailed per-rule feedback lets the frontend render helpful hints.
 */

import authConfig from '../config/auth';

// A tiny static blocklist of the most-used passwords. In a real deployment you'd
// load the HaveIBeenPwned top-100k list into a Set at startup.
const COMMON_PASSWORDS = new Set([
  'password', '12345678', '123456789', 'qwerty123', 'password1',
  'iloveyou', 'sunshine1', 'princess1', 'football1', 'charlie1',
  'welcome1', 'shadow12', 'letmein1', 'admin123', 'monkey12',
]);

export const validateEmail = (email: string): { ok: true } | { ok: false; error: string } => {
  if (!email || typeof email !== 'string') {
    return { ok: false, error: 'Email is required.' };
  }
  if (email.length > 320) {
    return { ok: false, error: 'Email is too long.' };
  }
  // RFC 5322-lite — good enough to catch typos, not strict enough to reject valid addresses.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Invalid email format.' };
  }
  return { ok: true };
};

export const validatePassword = (
  password: string
): { ok: true } | { ok: false; error: string } => {
  const p = authConfig.passwordPolicy;

  if (!password || typeof password !== 'string') {
    return { ok: false, error: 'Password is required.' };
  }
  if (password.length < p.minLength) {
    return { ok: false, error: `Password must be at least ${p.minLength} characters.` };
  }
  if (p.requireUppercase && !/[A-Z]/.test(password)) {
    return { ok: false, error: 'Password must include an uppercase letter.' };
  }
  if (p.requireLowercase && !/[a-z]/.test(password)) {
    return { ok: false, error: 'Password must include a lowercase letter.' };
  }
  if (p.requireNumber && !/\d/.test(password)) {
    return { ok: false, error: 'Password must include a number.' };
  }
  if (p.denyCommonPasswords && COMMON_PASSWORDS.has(password.toLowerCase())) {
    return { ok: false, error: 'This password is too common.' };
  }
  return { ok: true };
};

export const validateName = (name: string): { ok: true } | { ok: false; error: string } => {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return { ok: false, error: 'Name is required.' };
  }
  if (name.length > 100) {
    return { ok: false, error: 'Name is too long.' };
  }
  return { ok: true };
};

export default { validateEmail, validatePassword, validateName };
