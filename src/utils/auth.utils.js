import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}
export function createToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
}
