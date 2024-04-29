import express from 'express';
import { paginateSchema } from '../schemas.js';
import {
  getFriendRequests,
  createFriendRequest,
  deleteFriendRequest,
} from '../handlers/friendships.handlers.js';
import {
  validateIds,
  validateQuery,
} from '../middlewares/validation.middlewares.js';
import Joi from 'joi';

export const router = express.Router();
router.get(
  '/',
  validateQuery(
    Joi.object({
      q: Joi.string(),
      type: Joi.valid(['incoming', 'outgoing']).required(),
    }).concat(paginateSchema),
  ),
  getFriendRequests,
);
router
  .route('/:userId')
  .all(validateIds('userId'))
  .post(createFriendRequest)
  .delete(deleteFriendRequest);
