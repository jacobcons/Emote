import express from 'express';
import { login, register, requestRegister } from '../handlers/auth.handlers.js';
import { validateBody } from '../middlewares/validation.middlewares.js';
import Joi from 'joi';
import { verifyToken } from '../middlewares/auth.middlewares.js';

export const router = express.Router();
router.post(
  '/request-register',
  validateBody(
    Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(3).required(),
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
