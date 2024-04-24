export function createError(statusCode, message) {
  return {
    statusCode,
    message,
  };
}

export const resourceNotFound = createError(404, `Resource not found`);

export function checkResourceExists(resource) {
  if (!resource) {
    throw resourceNotFound;
  }
}

export function checkUniqueConstraintViolation(err, message) {
  const UNIQUE_CONSTRAINT_VIOLATION_ERROR_CODE = '23505';
  if (err.code === UNIQUE_CONSTRAINT_VIOLATION_ERROR_CODE) {
    throw createError(409, message);
  }
}

export function checkForeignKeyConstraintViolation(err) {
  const FOREIGN_KEY_CONSTRAINT_VIOLATION_ERROR_CODE = '23503';
  if (err.code === FOREIGN_KEY_CONSTRAINT_VIOLATION_ERROR_CODE) {
    throw resourceNotFound;
  }
}
