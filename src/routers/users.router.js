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
      q: Joi.string(),
    }).concat(paginateSchema),
  ),
  getUsers,
);
router.patch(
  '/me',
  validateBody(
    Joi.object({
      name: Joi.string().min(3),
      coverImage: Joi.string().uri().allow(null),
      profileImage: Joi.string().uri().allow(null),
      bio: emojiSchema.allow(null),
    }),
  ),
  updateCurrentUser,
);
router.get('/:id', validateIds('id'), getUser);
