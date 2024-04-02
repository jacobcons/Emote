import Joi from 'joi';

const getUsersSchema = Joi.object({
  q: Joi.string(),
  page: Joi.number().integer().positive(),
  limit: Joi.number().integer().positive(),
});

export { getUsersSchema };
