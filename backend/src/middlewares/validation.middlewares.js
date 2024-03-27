import {celebrate, celebrator, Segments} from 'celebrate';
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
