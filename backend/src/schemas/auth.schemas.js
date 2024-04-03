import Joi from 'joi';
export const registerSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});
