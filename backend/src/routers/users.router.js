import express from 'express';
import {
  getUser,
  getUsers,
  updateCurrentUser,
} from '../handlers/users.handlers.js';
import {
  validateBody,
  validateIds,
  validateQuery,
} from '../middlewares/validation.middlewares.js';
import Joi from 'joi';
import { emojiSchema, paginateSchema } from '../schemas.js';

export const router = express.Router();
router.get(
  '/',
  validateQuery(
    Joi.object({
      q: Joi.string().required(),
    }).concat(paginateSchema),
  ),
  getUsers,
);
router.patch(
  '/me',
  validateBody(
    Joi.object({
      name: Joi.string().min(3),
      coverImage: Joi.string().uri(),
      profileImage: Joi.string().uri(),
      bio: emojiSchema,
    }),
  ),
  updateCurrentUser,
);
router.get('/:id', validateIds('id'), getUser);
