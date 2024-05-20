import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export function hashPassword(password) {
  return bcrypt.hash(password, 10);
}
export function createToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
}
