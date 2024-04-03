import { celebrate, celebrator, Segments } from 'celebrate';
import Joi from 'joi';
export const validate = celebrator(undefined, { abortEarly: false });
export const validateBody = (schema) => {
  return validate({ [Segments.BODY]: schema });
};

export const validateQuery = (schema) => {
  return validate({ [Segments.QUERY]: schema });
};

export const validateParams = (schema) => {
  return validate({ [Segments.PARAMS]: schema });
};

export const validateIds = (...ids) => {
  let idSchema = {};
  for (const id of ids) {
    idSchema[id] = Joi.number().integer().positive();
  }
  return validateParams(Joi.object(idSchema));
};
