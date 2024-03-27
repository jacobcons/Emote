import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import ms from 'ms';

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};
export const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
};

export function attachTokenCookieToResponse(id, res) {
  const token = createToken(id);
  res.cookie('token', token, {
    expires: new Date(Date.now() + ms(process.env.JWT_LIFETIME)),
    httpOnly: process.env.NODE_ENV === 'production',
    secure: true,
  });
}
