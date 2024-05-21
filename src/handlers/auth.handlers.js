import bcrypt from 'bcrypt';
import {
  checkUniqueConstraintViolation,
  createError,
} from '../utils/errors.utils.js';
import { createToken, hashPassword } from '../utils/auth.utils.js';
import { dbQuery } from '../utils/dbQueries.utils.js';
import { sendEmail } from '../utils/email.utils.js';

export async function requestRegister(req, res, next) {
  const { name, email, password } = req.body;
  const [{ exists: userAlreadyRegistered }] = await dbQuery(
    `
    SELECT EXISTS(
      SELECT 1
      FROM "user"
      WHERE email = :email
    )
    `,
    { email },
  );
  if (userAlreadyRegistered) {
    return next(
      createError(409, `User with email ${email} is already registered`),
    );
  }

  const domain = `${req.protocol}://${req.headers.host}`;
  const token = createToken({ name, email, password, type: 'register' });
  sendEmail(
    email,
    'Emote account registration confirmation',
    `
    Send POST request to given url with given header:
    - ${domain}/auth/register
    - Authorization: Bearer ${token}
    
    This will be changed to link to a page that automatically calls the above request when frontend is implemented`,
  );

  res.status(201).json({
    message: `An email has been sent to ${email}. Please click the confirmation link to create your account.`,
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
    res.status(201).json({ token: createToken({ id: user.id, type: 'user' }) });
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

  res.json({ token: createToken({ id: user.id, type: 'user' }) });
}

export async function requestResetPassword(req, res, next) {
  const { email } = req.body;
  const [{ exists: userAlreadyRegistered }] = await dbQuery(
    `
    SELECT EXISTS(
      SELECT 1
      FROM "user"
      WHERE email = :email
    )
    `,
    { email },
  );
  if (!userAlreadyRegistered) {
    return next(createError(409, `User with email ${email} is not registered`));
  }

  const domain = `${req.protocol}://${req.headers.host}`;
  const token = createToken({ email, type: 'resetPassword' });
  sendEmail(
    email,
    'Emote password reset',
    `
    Send PATCH request to given url, with given body and header:
    - ${domain}/auth/reset-password
    - { password: <new-password> }
    - Authorization: Bearer ${token}
    
    This will be changed to link to a page that automatically calls the above request when frontend is implemented`,
  );

  res.status(201).json({
    message: `An email has been sent to ${email}. Please click the link to reset your password.`,
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
  res.json({ token: createToken({ id: user.id, type: 'user' }) });
}
