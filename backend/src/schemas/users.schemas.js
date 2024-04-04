import Joi from 'joi';
import { emojiSchema } from './emoji.schemas.js';

export const getUsersSchema = Joi.object({
  q: Joi.string(),
  page: Joi.number().integer().positive(),
  limit: Joi.number().integer().positive(),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(3),
  coverImage: Joi.string().uri(),
  profileImage: Joi.string().uri(),
  bio: emojiSchema,
});
