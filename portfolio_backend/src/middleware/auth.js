import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
export const requireAdmin = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.portfolio_admin;
  if (!token) throw new ApiError(401, 'Please sign in to continue.');
  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret, {
      algorithms: ['HS256'],
      issuer: 'portfolio-api',
      audience: 'portfolio-admin',
    });
    if (!mongoose.isObjectIdOrHexString(payload.sub)) throw new Error('Invalid subject');
  } catch {
    throw new ApiError(401, 'Your session has expired. Please sign in again.');
  }
  const user = await User.findById(payload.sub);
  if (!user || payload.version !== user.sessionVersion)
    throw new ApiError(401, 'Your session has expired. Please sign in again.');
  if (user.role !== 'admin') throw new ApiError(403, 'Administrator access is required.');
  req.user = user;
  next();
});
