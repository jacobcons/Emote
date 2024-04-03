import jwt from 'jsonwebtoken';
import { createError } from '../utils/errors.utils.js';

const verifyToken = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(createError(401, 'No token provided'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return next(createError(401, 'Invalid token'));
  }
};
export { verifyToken };
