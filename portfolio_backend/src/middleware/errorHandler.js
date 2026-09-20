import { ApiError } from '../utils/ApiError.js';
import { audit } from '../services/logger.js';
export function notFound(_req, _res, next) {
  next(new ApiError(404, 'This API route does not exist.'));
}
export function errorHandler(error, _req, res, _next) {
  let status = 500;
  let message = 'The service could not complete this request. Please try again.';
  if (error instanceof ApiError) {
    status = error.statusCode;
    message = error.message;
  } else if (error.code === 11000) {
    status = 409;
    message = 'That email, slug, or key already exists.';
  } else if (error.name === 'MulterError') {
    status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 422;
    message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'File exceeds the upload limit. Images: 8 MB; icons: 2 MB; PDFs: 5 MB.'
        : 'Upload one supported file using the file field.';
  } else if (error.name === 'CastError') {
    status = 400;
    message = 'Invalid record identifier.';
  } else if (error.name === 'ValidationError') {
    status = 422;
    message = 'The record contains invalid fields.';
  } else if (error.type === 'entity.parse.failed') {
    status = 400;
    message = 'Request body must be valid JSON.';
  } else if (error.type === 'entity.too.large') {
    status = 413;
    message = 'Request body is too large.';
  }
  if (status >= 500)
    audit('error', 'application.error', {
      requestId: _req.requestId,
      errorName: error.name,
      status,
    });
  res.status(status).json({
    ok: false,
    error: {
      message,
      ...(error instanceof ApiError && error.details ? { details: error.details } : {}),
    },
  });
}
