import bcrypt from 'bcrypt';
import {
  checkUniqueConstraintViolation,
  createError,
} from '../utils/errors.utils.js';
import { createToken, hashPassword } from '../utils/auth.utils.js';
import { dbQuery, getIsUserRegistered } from '../utils/dbQueries.utils.js';
import { sendEmail } from '../utils/email.utils.js';
import { getOrigin } from '../utils/url.utils.js';

export async function requestRegister(req, res, next) {
  const { name, email, password } = req.body;
  const isUserRegistered = await getIsUserRegistered(email);

  if (!isUserRegistered) {
    const origin = getOrigin(req);
    const token = createToken({ name, email, password, type: 'register' });
    sendEmail(
      email,
      'Emote account registration confirmation',
      `
    Send POST request to given url with given header:
    - ${origin}/auth/register
    - Authorization: Bearer ${token}
    
    This will be changed to link to a page that automatically calls the above request when frontend is implemented`,
    );
  }

  res.status(201).json({
    message: `If you are not already registered, you will receive a confirmation email.`,
  });
}

export async function register(req, res, next) {
  const { name, email, password } = req.user;
  try {
    const [user] = await dbQuery(
      `
      INSERT INTO "user"(name, email, password) 
      VALUES (:name, :email, :password)
      RETURNING id
      `,
      { name, email, password: await hashPassword(password) },
    );
    res
      .status(201)
      .json({ userToken: createToken({ id: user.id, type: 'user' }) });
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

  res.json({ userToken: createToken({ id: user.id, type: 'user' }) });
}

export async function requestResetPassword(req, res, next) {
  const { email } = req.body;
  const isUserRegistered = await getIsUserRegistered(email);

  if (isUserRegistered) {
    const origin = getOrigin(req);
    const token = createToken({ email, type: 'resetPassword' });
    sendEmail(
      email,
      'Emote password reset',
      `
    Send PATCH request to given url, with given body and header:
    - ${origin}/auth/reset-password
    - { password: <new-password> }
    - Authorization: Bearer ${token}
    
    This will be changed to link to a page that automatically calls the above request when frontend is implemented`,
    );
  }

  res.status(201).json({
    message: `If you're registered, you will receive a password reset link`,
  });
}

export async function resetPassword(req, res, next) {
  const { email } = req.user;
  const { password } = req.body;

  const [user] = await dbQuery(
    `
    UPDATE "user"
    SET password = :password
    WHERE email = :email
    RETURNING id
    `,
    { email, password: await hashPassword(password) },
  );

  res.json({ userToken: createToken({ id: user.id, type: 'user' }) });
}
