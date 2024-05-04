import express from 'express';
import { paginateSchema } from '../schemas.js';
import {
  getFriendRequests,
  createFriendRequest,
  deleteFriendRequest,
} from '../handlers/friendRequests.handlers.js';
import {
  validateIds,
  validateQuery,
} from '../middlewares/validation.middlewares.js';
import Joi from 'joi';
import { FRIEND_REQUEST_TYPES } from '../constants.js';

export const router = express.Router();
router.get(
  '/',
  validateQuery(
    Joi.object({
      q: Joi.string(),
      type: Joi.valid(...Object.values(FRIEND_REQUEST_TYPES)).required(),
    }).concat(paginateSchema),
  ),
  getFriendRequests,
);
router
  .route('/:userId')
  .all(validateIds('userId'))
  .post(createFriendRequest)
  .delete(deleteFriendRequest);
