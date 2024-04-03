import Joi from 'joi';

export const getUsersSchema = Joi.object({
  q: Joi.string(),
  page: Joi.number().integer().positive(),
  limit: Joi.number().integer().positive(),
});
