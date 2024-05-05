import express from 'express';
import { login, register } from '../handlers/auth.handlers.js';
import { validateBody } from '../middlewares/validation.middlewares.js';
import Joi from 'joi';

export const router = express.Router();
router.post(
  '/register',
  validateBody(
    Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(3).required(),
    }),
  ),
  register,
);
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
