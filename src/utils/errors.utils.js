export function createError(statusCode, message) {
  return {
    statusCode,
    message,
  };
}

export function checkResourceExists(resource, message = 'Resource not found') {
  if (!resource) {
    throw createError(404, message);
  }
}

export function checkUniqueConstraintViolation(
  err,
  message = 'Unique constraint violation',
) {
  const UNIQUE_CONSTRAINT_VIOLATION_ERROR_CODE = '23505';
  if (err.code === UNIQUE_CONSTRAINT_VIOLATION_ERROR_CODE) {
    throw createError(409, message);
  }
}

export function checkForeignKeyConstraintViolation(
  err,
  message = 'Resource not found',
) {
  const FOREIGN_KEY_CONSTRAINT_VIOLATION_ERROR_CODE = '23503';
  if (err.code === FOREIGN_KEY_CONSTRAINT_VIOLATION_ERROR_CODE) {
    throw createError(404, message);
  }
}

export function checkCheckConstraintViolation(
  err,
  message = 'Check constraint violation',
) {
  const CHECK_CONSTRAINT_VIOLATION_ERROR_CODE = '23514';
  if (err.code === CHECK_CONSTRAINT_VIOLATION_ERROR_CODE) {
    throw createError(422, message);
  }
}
