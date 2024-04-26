import express from 'express';
import { paginateSchema } from '../schemas.js';
import { getUserFriendships } from '../handlers/friendships.handlers.js';
import {
  validateIds,
  validateQuery,
} from '../middlewares/validation.middlewares.js';
import Joi from 'joi';

export const router = express.Router();
router.get(
  '/users/:id/friendships',
  validateIds('id'),
  validateQuery(
    Joi.object({
      q: Joi.string(),
    }).concat(paginateSchema),
  ),
  getUserFriendships,
);
