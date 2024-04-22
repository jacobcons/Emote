import express from 'express';
import { paginateSchema } from '../schemas.js';
import { getFriendsPosts, getUsersPosts } from '../handlers/posts.handlers.js';
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
  '/user/:id/posts',
  validateIds('id'),
  validateQuery(
    Joi.object({
      commentLimit: Joi.number().integer().positive(),
    }).concat(paginateSchema),
  ),
  getUsersPosts,
);
