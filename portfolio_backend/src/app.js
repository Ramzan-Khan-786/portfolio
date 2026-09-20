import express from 'express';
import { getResume } from './controllers/resumeController.js';
import { getThemes } from './controllers/themeController.js';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { requestLog } from './middleware/requestLog.js';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import { requestSecurity } from './middleware/requestSecurity.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
const app = express();
app.disable('x-powered-by');
app.use(requestLog);
app.set('trust proxy', env.trustProxy);
app.use(helmet());
app.use(
  cors({
    origin: env.origins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'X-Portfolio-Request'],
  }),
);
app.use(express.json({ limit: '256kb' }));
app.use(cookieParser());
app.get('/health', (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res
    .status(ready ? 200 : 503)
    .json({ ok: ready, data: { status: ready ? 'healthy' : 'database-unavailable' } });
});
app.use('/api', requestSecurity);
app.use(['/api/auth', '/api/admin'], (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
const limiter = (max) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      ok: false,
      error: { message: 'Too many requests. Please try again in 15 minutes.' },
    },
  });
app.use('/api/auth/login', limiter(15));
app.use('/api/auth/admin/login', limiter(15));
app.use('/api/auth/signup', limiter(15));
app.use('/api/auth/google', limiter(40));
app.use('/api/auth/google/complete', limiter(15));
app.use('/api/auth/password', limiter(10));
app.use('/api/auth', authRoutes);
app.get('/api/resume/current', getResume);
app.get('/api/theme/settings', getThemes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', limiter(500), adminRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;
