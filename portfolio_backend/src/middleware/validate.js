import { ApiError } from '../utils/ApiError.js';

export function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(
        new ApiError(422, 'Please correct the highlighted fields.', result.error.flatten()),
      );
    }
    req.validatedBody = result.data;
    return next();
  };
}
