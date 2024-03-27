import { knex } from '../db/connection.js';
import bcrypt from 'bcrypt';
import { createError } from '../utils/errors.utils.js';
import {
  attachTokenCookieToResponse,
  hashPassword,
} from '../utils/auth.utils.js';
import { TABLES } from '../constants/tables.constants.js';

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const [user] = await knex(TABLES.USER)
      .insert({
        name,
        email,
        password: await hashPassword(password),
      })
      .returning('id');
    attachTokenCookieToResponse(user.id, res);
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    const UNIQUE_CONSTRAINT_VIOLATION = '23505';
    const userWithSameEmail = err.code === UNIQUE_CONSTRAINT_VIOLATION;
    if (userWithSameEmail) {
      return next(
        createError(409, `User with email ${email} is already registered`),
      );
    }
    return next(err);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await knex(TABLES.USER).first('id', 'password').where({ email });
  const incorrectLoginError = createError(401, 'Incorrect login details');
  if (!user) {
    return next(incorrectLoginError);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return next(incorrectLoginError);
  }

  attachTokenCookieToResponse(user.id, res);
  res.json({ message: 'Login successful' });
};

export const logout = async (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
};
