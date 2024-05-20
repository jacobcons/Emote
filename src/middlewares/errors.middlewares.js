import { createError } from '../utils/errors.utils.js';

export function errorHandler(err, req, res, next) {
  console.error(err);
  if (!err.statusCode) {
    err = createError(500, 'Something went wrong!');
  }
  return res.status(err.statusCode).json(err);
}

export function notFound(req, res, next) {
  return next(createError(404, `Cannot ${req.method} ${req.originalUrl}`));
}
