import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export const cookieOptions = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: env.cookieSameSite,
  path: '/api',
};
export const safeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  providers: user.googleId ? ['password', 'google'] : ['password'],
});
export function issueSession(res, user) {
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
