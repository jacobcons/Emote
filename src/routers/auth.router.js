import express from 'express';
import {
  requestRegister,
  register,
  login,
  requestResetPassword,
  resetPassword,
} from '../handlers/auth.handlers.js';
import { validateBody } from '../middlewares/validation.middlewares.js';
import Joi from 'joi';
import { verifyToken } from '../middlewares/auth.middlewares.js';

export const router = express.Router();
const passwordSchema = Joi.string().min(3).required();
router.post(
  '/request-register',
  validateBody(
    Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: passwordSchema,
    }),
  ),
  requestRegister,
);

router.post('/register', verifyToken('register'), register);

router.post(
  '/login',
  validateBody(
    Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    }),
  ),
  login,
);

router.post(
  '/request-reset-password',
  validateBody(Joi.object({ email: Joi.string().required() })),
  requestResetPassword,
);

router.patch(
  '/reset-password',
  verifyToken('resetPassword'),
  validateBody(Joi.object({ password: passwordSchema })),
  resetPassword,
);
