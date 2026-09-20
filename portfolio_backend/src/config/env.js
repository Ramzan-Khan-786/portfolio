import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';

// Tests never load real credentials. Resolve .env from this module, not the shell.
if (process.env.NODE_ENV !== 'test')
  dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });
const production = process.env.NODE_ENV === 'production';
const secret = process.env.JWT_SECRET;
if (
  production &&
  (!secret || secret.length < 32 || /replace|change-this|development-only/.test(secret))
) {
  throw new Error('Production JWT_SECRET must be a unique secret of at least 32 characters.');
}
if (production && (!process.env.MONGODB_URI || !process.env.CLIENT_ORIGIN))
  throw new Error('Production database and client origin are required.');
const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((value) => new URL(value.trim()).origin);
const secure = production || process.env.COOKIE_SECURE === 'true';
const sameSite = process.env.COOKIE_SAME_SITE || 'lax';
if (!['lax', 'strict', 'none'].includes(sameSite) || (sameSite === 'none' && !secure))
  throw new Error('SameSite=None requires secure cookies.');
export const env = {
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
  cloudinaryFolder: /^[a-zA-Z0-9_-]{1,60}$/.test(process.env.CLOUDINARY_FOLDER || '') ? process.env.CLOUDINARY_FOLDER : 'portfolio',
  cloudinaryBackgroundRemoval: process.env.CLOUDINARY_BACKGROUND_REMOVAL_ENABLED === 'true',
  googleDriveClientId: process.env.GOOGLE_DRIVE_CLIENT_ID || '',
  googleDriveApiKey: process.env.GOOGLE_DRIVE_API_KEY || '',
  googleDriveAppId: process.env.GOOGLE_DRIVE_APP_ID || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  uploadDir:
    process.env.UPLOAD_DIR || fileURLToPath(new URL('../../uploads/resumes', import.meta.url)),
  logDir: process.env.LOG_DIR || fileURLToPath(new URL('../../logs', import.meta.url)),
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ramzan_portfolio',
  clientOrigin: origins[0],
  origins,
  jwtSecret: secret || randomBytes(48).toString('hex'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  cookieSecure: secure,
  cookieSameSite: sameSite,
  trustProxy: Number(process.env.TRUST_PROXY || 0),
};
