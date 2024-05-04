import bcrypt from 'bcrypt';
import {
  checkUniqueConstraintViolation,
  createError,
} from '../utils/errors.utils.js';
import { createToken, hashPassword } from '../utils/auth.utils.js';
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
    res.status(201).json({ token: createToken(user.id) });
  } catch (err) {
    checkUniqueConstraintViolation(
      err,
      `User with email ${email} is already registered`,
    );
    return next(err);
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

  res.json({ token: createToken(user.id) });
}
