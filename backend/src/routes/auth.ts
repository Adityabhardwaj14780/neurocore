/**
 * Auth routes.
 *
 * CHANGES:
 *   - /refresh is CSRF-protected and uses cookie auth (no Bearer).
 *   - /logout and /logout-all require a valid access token (prevents CSRF-triggered logout from other tabs).
 *   - Login rate limit is configurable via env.
 */

import express from 'express';
import authController from '../controllers/authController';
import { requireAuth, csrfCheck } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';

const router = express.Router();

// Public — rate-limited
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);

// Public — refresh uses cookie auth, so CSRF check is mandatory.
router.post('/refresh', csrfCheck, authController.refresh);

// Protected — require access token
router.get('/me', requireAuth, authController.getProfile);
router.post('/logout', requireAuth, authController.logout);
router.post('/logout-all', requireAuth, authController.logoutAll);

export default router;
