import express from 'express';
import { emojiSchema, paginateSchema } from '../schemas.js';
import {
  getFriendsPosts,
  getUsersPosts,
  createPost,
} from '../handlers/posts.handlers.js';
import {
  validateBody,
  validateIds,
  validateQuery,
} from '../middlewares/validation.middlewares.js';
import { paginate } from '../utils/dbQueries.utils.js';
import Joi from 'joi';

export const router = express.Router();
router.get(
  '/friendships/posts',
  validateQuery(
    Joi.object({
      commentLimit: Joi.number().integer().positive(),
    }).concat(paginateSchema),
  ),
  getFriendsPosts,
);
router.get(
  '/users/:id/posts',
  validateIds('id'),
  validateQuery(
    Joi.object({
      commentLimit: Joi.number().integer().positive(),
    }).concat(paginateSchema),
  ),
  getUsersPosts,
);
router.post(
  '/posts',
  validateBody(
    Joi.object({ text: emojiSchema.required(), image: Joi.string().uri() }),
  ),
  createPost,
);
