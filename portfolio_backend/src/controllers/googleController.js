import { randomBytes, createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import AuthAttempt from '../models/AuthAttempt.js';
import { env } from '../config/env.js';
import { cookieOptions, issueSession, safeUser } from '../services/session.js';
import { verifyGoogleIdentity } from '../services/googleIdentity.js';
import { audit } from '../services/logger.js';
import { newPassword } from '../validation/schemas.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
const hash = (value) => createHash('sha256').update(value).digest('hex');
const options = { ...cookieOptions, maxAge: 10 * 60 * 1000 };
const validAttempt = (token, purpose) => ({
  tokenHash: hash(token || ''),
  ...(purpose ? { purpose } : {}),
  expiresAt: { $gt: new Date() },
});
async function pending(res, purpose, data) {
  const token = randomBytes(32).toString('hex');
  await AuthAttempt.create({
    tokenHash: hash(token),
    purpose,
    data,
    expiresAt: new Date(Date.now() + options.maxAge),
  });
  res.cookie('portfolio_google_pending', token, options);
}
export const googleChallenge = asyncHandler(async (req, res) => {
  if (!env.googleClientId) return res.json({ ok: true, data: { configured: false } });
  if (req.cookies.portfolio_google_challenge)
    await AuthAttempt.deleteOne({
      tokenHash: hash(req.cookies.portfolio_google_challenge),
      purpose: 'challenge',
    });
  const nonce = randomBytes(32).toString('hex');
  await AuthAttempt.create({
    tokenHash: hash(nonce),
    purpose: 'challenge',
    expiresAt: new Date(Date.now() + options.maxAge),
  });
  res.cookie('portfolio_google_challenge', nonce, options);
  res.json({ ok: true, data: { configured: true, clientId: env.googleClientId, nonce } });
});
export const googleAuthenticate = asyncHandler(async (req, res) => {
  const nonce = req.cookies.portfolio_google_challenge;
  if (!nonce) throw new ApiError(401, 'Start Google sign-in again.');
  const identity = await verifyGoogleIdentity(req.validatedBody.credential, nonce);
  if (!(await AuthAttempt.findOneAndDelete(validAttempt(nonce, 'challenge'))))
    throw new ApiError(401, 'Google sign-in challenge expired or was already used.');
  res.clearCookie('portfolio_google_challenge', cookieOptions);
  const linked = await User.findOne({ googleId: identity.googleId });
  if (linked) {
    if (linked.disabled) throw new ApiError(403, 'This account is suspended.');
    issueSession(res, linked);
    audit('auth', 'auth.google_login', { userId: linked.id });
    return res.json({ ok: true, data: { user: safeUser(linked) } });
  }
  const existing = await User.findOne({ email: identity.email });
  if (existing?.disabled) throw new ApiError(403, 'This account is suspended.');
  if (existing?.googleId)
    throw new ApiError(
      409,
      'This email is linked to another Google identity. Sign in with your portfolio password.',
    );
  const purpose = existing ? 'link' : 'create';
  await pending(res, purpose, {
    ...identity,
    ...(existing ? { userId: existing.id, version: existing.sessionVersion } : {}),
  });
  audit('auth', 'auth.google_pending');
  res.json({ ok: true, data: { step: purpose, email: identity.email, name: identity.name } });
});
export const completeGoogle = asyncHandler(async (req, res) => {
  const query = validAttempt(req.cookies.portfolio_google_pending);
  query.purpose = { $in: ['create', 'link'] };
  const attempt = await AuthAttempt.findOne(query);
  if (!attempt) throw new ApiError(401, 'Google sign-in expired. Please start again.');
  const { googleId, email, name, userId, version } = attempt.data;
  const password = req.validatedBody.password;
  let user;
  if (attempt.purpose === 'link') {
    user = await User.findById(userId).select('+passwordHash');
    const valid = user && (await bcrypt.compare(password, user.passwordHash));
    if (!valid || user.disabled || user.sessionVersion !== version || user.googleId)
      throw new ApiError(
        401,
        'Account could not be linked. Check your portfolio password or start again.',
      );
  } else {
    const parsed = newPassword.safeParse(password);
    if (!parsed.success)
      throw new ApiError(
        422,
        'Use a portfolio password of 12 characters or more, up to 72 UTF-8 bytes.',
      );
  }
  // Atomically consume the short-lived proof before creating or linking; concurrent requests cannot reuse it.
  if (!(await AuthAttempt.findOneAndDelete(query)))
    throw new ApiError(401, 'This sign-in attempt was already completed.');
  if (attempt.purpose === 'link') {
    user = await User.findOneAndUpdate(
      {
        _id: userId,
        sessionVersion: version,
        disabled: { $ne: true },
        googleId: { $exists: false },
      },
      { googleId, emailVerified: true },
      { new: true },
    );
    if (!user) throw new ApiError(409, 'Account changed. Start Google sign-in again.');
  } else {
    user = await User.create({
      email,
      name,
      googleId,
      emailVerified: true,
      role: 'user',
      passwordHash: await bcrypt.hash(password, 12),
    });
  }
  res.clearCookie('portfolio_google_pending', cookieOptions);
  issueSession(res, user);
  audit('auth', attempt.purpose === 'link' ? 'auth.google_linked' : 'auth.google_created', {
    userId: user.id,
  });
  res
    .status(attempt.purpose === 'link' ? 200 : 201)
    .json({ ok: true, data: { user: safeUser(user) } });
});
