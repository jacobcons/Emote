import { knex } from '../db/connection.js';
import bcrypt from 'bcrypt';
import {
  checkUniqueConstraintViolation,
  createError,
} from '../utils/errors.utils.js';
import {
  attachTokenCookieToResponse,
  hashPassword,
} from '../utils/auth.utils.js';
import { dbQuery } from '../utils/dbQueries.utils.js';

export async function register(req, res, next) {
  const { name, email, password } = req.body;

  try {
    const [user] = await dbQuery(
      `
      INSERT INTO "user"(name, email, password)
      VALUES (:name, :email, :password)
      RETURNING id
    `,
      { name, email, password: await hashPassword(password) },
    );
    attachTokenCookieToResponse(user.id, res);
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    checkUniqueConstraintViolation(
      err,
      `User with email ${email} is already registered`,
    );
    throw err;
  }
}

export async function login(req, res, next) {
  const { email, password } = req.body;

  const [user] = await dbQuery(
    `
    SELECT id, password
    FROM "user"
    WHERE email = :email
    LIMIT 1
    `,
    { email },
  );
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
}

export function logout(req, res) {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
}
