import mongoose from 'mongoose';
import { cloudinaryConfigured } from '../services/cloudinary/service.js';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { audit, recentEvents } from '../services/logger.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
export const users = asyncHandler(async (req, res) => {
  const page = Math.max(1, Math.min(10000, Number.parseInt(req.query.page, 10) || 1)),
    limit = 25;
  const [items, total] = await Promise.all([
    User.find()
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('name email role disabled googleId createdAt')
      .lean(),
    User.countDocuments(),
  ]);
  res.json({
    ok: true,
    data: {
      items: items.map(({ googleId, ...item }) => ({
        ...item,
        providers: googleId ? ['password', 'google'] : ['password'],
      })),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});
export const setUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, role: 'user' },
    { $set: { disabled: req.validatedBody.disabled }, $inc: { sessionVersion: 1 } },
    { new: true },
  );
  if (!user)
    throw new ApiError(403, 'Only normal user accounts can be suspended or restored here.');
  audit('admin', 'user.status_changed', { userId: req.user.id });
  res.json({ ok: true, data: { id: user.id, disabled: user.disabled } });
});
export const operations = (_req, res) =>
  res.json({
    ok: true,
    data: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'unavailable',
      googleConfigured: Boolean(env.googleClientId),
      cloudinaryConfigured: cloudinaryConfigured(),
      driveImportConfigured: Boolean(env.googleDriveClientId && env.googleDriveApiKey && env.googleDriveAppId),
      fileLogging: env.nodeEnv !== 'test',
      logFiles: ['error.log', 'combined.log', 'http.log', 'auth.log', 'admin.log'],
      rotation: '5 MB per file, 5 retained files per category',
      uptimeSeconds: Math.round(process.uptime()),
      recentEvents: recentEvents(),
    },
  });
