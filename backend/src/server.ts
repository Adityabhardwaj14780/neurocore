/**
 * Server entry point.
 *
 * BOOTSTRAP ORDER MATTERS:
 *   1. dotenv loads .env before ANYTHING else (so config/env.ts can read it).
 *   2. config/env.ts validates all secrets at import time — any failure throws here.
 *   3. Security middleware (helmet, cors, cookieParser) runs before routes.
 *   4. Routes are mounted under /api/v1 (versioned).
 *   5. DB connects last — we want to fail fast on config issues before opening sockets.
 */

// 1. Load .env FIRST — must happen before any config import.
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// 2. Config — validates env, throws on missing secrets.
import config from './config/env';
import connectDB from './config/database';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import aiRoutes from './routes/ai';
import dashboardRoutes from './routes/dashboard';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import globalLimiter from './middleware/rateLimit';

const app = express();

// ---------- Security headers ----------
// Helmet sets ~12 security headers (CSP, HSTS, X-Frame-Options, etc.) in one call.
app.use(helmet({
  contentSecurityPolicy: config.isProduction ? undefined : false, // relax in dev for Vite HMR
  crossOriginEmbedderPolicy: false,
}));

// ---------- CORS ----------
// Explicit origin list from env — never use '*' with credentials:true.
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server / curl (no origin header)
      if (!origin) return callback(null, true);
      if (config.cors.origins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// ---------- Body parsing ----------
app.use(express.json({ limit: '1mb' })); // 1mb default — tighten unless needed
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ---------- Cookie parsing ----------
// cookieParser(config.cookieSecret) enables req.signedCookies — tampered cookies return false.
app.use(cookieParser(config.cookieSecret));

// ---------- Rate limiting ----------
app.use('/api/', globalLimiter);

// ---------- Health check (no auth, no rate limit dependency on DB) ----------
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
  });
});

app.get('/ready', async (_req: Request, res: Response) => {
  // Cheap DB liveness probe — used by load balancers / k8s readiness.
  try {
    const mongoose = await import('mongoose');
    if (mongoose.default.connection.readyState === 1) {
      return res.json({ success: true, status: 'ready' });
    }
    return res.status(503).json({ success: false, status: 'not_ready' });
  } catch {
    return res.status(503).json({ success: false, status: 'not_ready' });
  }
});

// ---------- API routes (versioned) ----------
app.use(`${config.apiPrefix}/auth`, authRoutes);
app.use(`${config.apiPrefix}/user`, userRoutes);
app.use(`${config.apiPrefix}/ai`, aiRoutes);
app.use(`${config.apiPrefix}/dashboard`, dashboardRoutes);

// ---------- 404 ----------
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, code: 'not_found', message: 'Route not found.' });
});

// ---------- Error handler (must be last) ----------
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // CORS errors bubble up as regular Errors — surface them cleanly.
  if (err?.message?.startsWith('CORS blocked')) {
    return res.status(403).json({ success: false, code: 'cors_blocked', message: err.message });
  }
  errorHandler(err, req, res, next);
});

// ---------- Boot ----------
const start = async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`[server] Neuro Core API listening on port ${config.port} (${config.nodeEnv})`);
    console.log(`[server] API prefix: ${config.apiPrefix}`);
    console.log(`[server] CORS origins: ${config.cors.origins.join(', ')}`);
  });
};

start().catch((err) => {
  console.error('[server] Fatal startup error:', err);
  process.exit(1);
});

export default app;
