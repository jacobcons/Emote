import { createError } from '../utils/errors.utils.js';
import {isCelebrateError} from 'celebrate';

const errorHandler = (err, req, res, next) => {
  console.error(err);
  if (!err.statusCode) {
    err = createError(500, 'Something went wrong!');
  }
  return res
    .status(err.statusCode)
    .json(err);
};
const notFound = (req, res, next) => {
  next(createError(404, `Cannot ${req.method} ${req.originalUrl}`));
};

export { errorHandler, notFound };
