import { randomUUID } from 'node:crypto';
import { audit } from '../services/logger.js';
export function requestLog(req, res, next) {
  req.requestId = randomUUID();
  res.set('X-Request-Id', req.requestId);
  const started = performance.now();
  res.on('finish', () => {
    const data = {
      requestId: req.requestId,
      method: req.method,
      route: req.route?.path || 'unmatched',
      status: res.statusCode,
      durationMs: Math.round(performance.now() - started),
      userId: req.user?.id,
    };
    audit('http', 'http.request', data);
    if (
      req.originalUrl.startsWith('/api/admin/') &&
      !['GET', 'HEAD', 'OPTIONS'].includes(req.method)
    )
      audit('admin', 'admin.mutation', data);
  });
  next();
}
