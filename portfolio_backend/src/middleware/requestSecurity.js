import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

// A custom header forces cross-origin preflight; Origin checks protect cookie mutations.
export function requestSecurity(req, _res, next) {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const origin = req.get('origin');
    if ((origin && !env.origins.includes(origin)) || req.get('x-portfolio-request') !== 'cms') {
      return next(new ApiError(403, 'Request origin could not be verified.'));
    }
    if (req.get('sec-fetch-site') === 'cross-site' && !origin)
      return next(new ApiError(403, 'Request origin is required.'));
  }
  next();
}
