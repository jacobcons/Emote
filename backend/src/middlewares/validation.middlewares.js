import { celebrate, celebrator, Segments } from 'celebrate';
import Joi from 'joi';

export const validate = celebrator(undefined, { abortEarly: false });

export function validateBody(schema) {
  return validate({ [Segments.BODY]: schema });
}

export function validateQuery(schema) {
  return validate({ [Segments.QUERY]: schema });
}

export function validateParams(schema) {
  return validate({ [Segments.PARAMS]: schema });
}

export function validateId(...ids) {
  let idSchema = {};
  for (const id of ids) {
    idSchema[id] = Joi.number().integer().positive();
  }
  return validateParams(Joi.object(idSchema));
}
