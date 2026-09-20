import winston from 'winston';
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { env } from '../config/env.js';
const fields = [
  'requestId',
  'method',
  'route',
  'status',
  'durationMs',
  'userId',
  'code',
  'errorName',
  'port',
  'assetId', 'publicId', 'version', 'mode',
];
const categories = ['application', 'http', 'auth', 'admin', 'error'];
const events = new Set([
  'http.request',
  'admin.mutation',
  'auth.login',
  'auth.login_failed',
  'auth.signup',
  'auth.logout',
  'auth.password_changed',
  'auth.google_login',
  'auth.google_pending',
  'auth.google_created',
  'auth.google_linked',
  'user.status_changed',
  'application.started',
  'application.stopped',
  'database.connected',
  'application.failed',
  'application.error',
  'seed.complete',
  'media.uploaded', 'media.deleted', 'media.background_removed', 'media.upload_failed', 'media.delete_failed', 'media.cleanup_failed',
  'resume.uploaded', 'resume.published', 'resume.archived', 'resume.deleted', 'theme.updated',
]);
export function cleanLog(category, event, metadata = {}) {
  const result = {
    category: categories.includes(category) ? category : 'application',
    event: events.has(event) ? event : 'application.error',
  };
  for (const key of fields) {
    const value = metadata[key];
    if (typeof value === 'number' && Number.isFinite(value)) result[key] = value;
    else if (typeof value === 'string') result[key] = value.replace(/[\r\n]/g, ' ').slice(0, 180);
  }
  return result;
}
export function createFileLogger(directory, { silent = false } = {}) {
  const transports = [];
  if (!silent) {
    mkdirSync(directory, { recursive: true });
    const file = (name, filter) =>
      new winston.transports.File({
        filename: path.join(directory, name + '.log'),
        maxsize: 5 * 1024 * 1024,
        maxFiles: 5,
        tailable: true,
        format: filter ? winston.format((info) => (filter(info) ? info : false))() : undefined,
      });
    transports.push(
      file('combined'),
      file('error', (i) => i.level === 'error'),
      file('http', (i) => i.category === 'http'),
      file('auth', (i) => i.category === 'auth'),
      file('admin', (i) => i.category === 'admin'),
    );
  } else transports.push(new winston.transports.Console({ silent: true }));
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports,
  });
  logger.on('error', () => {
    process.stderr.write('Portfolio logging transport unavailable.\n');
  });
  return logger;
}
export const logger = createFileLogger(env.logDir, { silent: env.nodeEnv === 'test' });
const recent = [];
export function audit(category, event, metadata = {}) {
  const safe = cleanLog(category, event, metadata);
  logger.log({ level: category === 'error' ? 'error' : 'info', message: safe.event, ...safe });
  if (category !== 'http') {
    recent.unshift({ timestamp: new Date().toISOString(), ...safe });
    if (recent.length > 50) recent.pop();
  }
}
export const recentEvents = () => recent.slice();
