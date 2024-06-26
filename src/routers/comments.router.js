import express from 'express';
import { emojiSchema, paginateSchema } from '../schemas.js';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from '../handlers/comments.handlers.js';
import {
  validateBody,
  validateIds,
  validateQuery,
} from '../middlewares/validation.middlewares.js';
import Joi from 'joi';

export const router = express.Router();
router.get(
  '/posts/:id/comments',
  validateIds('id'),
  validateQuery(paginateSchema),
  getComments,
);

const validateTextInBody = validateBody(
  Joi.object({ text: emojiSchema.required() }),
);
router.post(
  '/posts/:id/comments',
  validateIds('id'),
  validateTextInBody,
  createComment,
);
router
  .route('/comments/:id')
  .all(validateIds('id'))
  .patch(validateTextInBody, updateComment)
  .delete(deleteComment);
