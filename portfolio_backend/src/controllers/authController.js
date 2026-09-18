import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
const cookieOptions = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: env.cookieSameSite,
  path: '/api',
};
const safeUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role });
const dummyHash = bcrypt.hashSync('unused-comparison-password', 12);
function issueSession(res, user) {
  const token = jwt.sign({ sub: user.id, version: user.sessionVersion || 0 }, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: env.jwtExpiresIn,
    issuer: 'portfolio-api',
    audience: 'portfolio-admin',
  });
  const payload = jwt.decode(token);
  res.cookie('portfolio_admin', token, {
    ...cookieOptions,
    maxAge: (payload.exp - payload.iat) * 1000,
  });
}
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validatedBody;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  const valid = await bcrypt.compare(password, user?.passwordHash || dummyHash);
  if (!user || !valid) throw new ApiError(401, 'Invalid email or password.');
  if (user.role !== 'admin') throw new ApiError(403, 'Administrator access is required.');
  issueSession(res, user);
  res.json({ ok: true, data: { user: safeUser(user) } });
});
export const logout = asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.user.id }, { $inc: { sessionVersion: 1 } });
  res.clearCookie('portfolio_admin', cookieOptions);
  res.json({ ok: true, data: null });
});
export const me = (req, res) => res.json({ ok: true, data: { user: safeUser(req.user) } });
export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+passwordHash');
  if (!(await bcrypt.compare(req.validatedBody.currentPassword, user.passwordHash)))
    throw new ApiError(401, 'Current password is incorrect.');
  user.passwordHash = await bcrypt.hash(req.validatedBody.newPassword, 12);
  user.sessionVersion += 1;
  await user.save();
  issueSession(res, user);
  res.json({ ok: true, data: null });
});
