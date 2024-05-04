import jwt from 'jsonwebtoken';
import { createError } from '../utils/errors.utils.js';

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError(401, 'No token provided'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return next(createError(401, 'Invalid token'));
  }
}
