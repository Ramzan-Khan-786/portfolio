import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { cookieOptions, issueSession, safeUser } from '../services/session.js';
import { audit } from '../services/logger.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
const dummyHash = bcrypt.hashSync('unused-comparison-password', 12);
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.validatedBody;
  if (await User.exists({ email: email.toLowerCase() }))
    throw new ApiError(409, 'An account with this email already exists. Sign in instead.');
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    role: 'user',
    passwordHash: await bcrypt.hash(password, 12),
  });
  issueSession(res, user);
  audit('auth', 'auth.signup', { userId: user.id });
  res.status(201).json({ ok: true, data: { user: safeUser(user) } });
});
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validatedBody;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  const valid = await bcrypt.compare(password, user?.passwordHash || dummyHash);
  if (!user || !valid || user.disabled) {
    audit('auth', 'auth.login_failed', { requestId: req.requestId });
    throw new ApiError(401, 'Invalid email or password.');
  }
  if (req.path === '/admin/login' && user.role !== 'admin')
    throw new ApiError(403, 'Administrator access is required.');
  issueSession(res, user);
  audit('auth', 'auth.login', { userId: user.id });
  res.json({ ok: true, data: { user: safeUser(user) } });
});
export const logout = asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.user.id }, { $inc: { sessionVersion: 1 } });
  res.clearCookie('portfolio_admin', cookieOptions);
  audit('auth', 'auth.logout', { userId: req.user.id });
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
  audit('auth', 'auth.password_changed', { userId: user.id });
  res.json({ ok: true, data: null });
});
