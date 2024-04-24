import express from 'express';
import { emojiSchema, paginateSchema } from '../schemas.js';
import {
  createReaction,
  updateReaction,
  deleteReaction,
} from '../handlers/reactions.handlers.js';
import { validateBody } from '../middlewares/validation.middlewares.js';
import Joi from 'joi';
import { REACTION_TYPES } from '../constants.js';

export const router = express.Router();
const typeInBody = validateBody(
  Joi.object({
    type: Joi.string()
      .valid(...REACTION_TYPES)
      .required(),
  }),
);
router
  .route('/posts/:id/reactions')
  .post(typeInBody, createReaction)
  .patch(typeInBody, updateReaction)
  .delete(deleteReaction);
