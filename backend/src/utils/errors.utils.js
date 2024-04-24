export function createError(statusCode, message) {
  return {
    statusCode,
    message,
  };
}

export function assertResourceExists(resource) {
  if (!resource) {
    throw createError(404, `Resource not found`);
  }
}

export function assertNoUniqueConstraintViolation(err, message) {
  const UNIQUE_CONSTRAINT_VIOLATION = '23505';
  if (err.code === UNIQUE_CONSTRAINT_VIOLATION) {
    throw createError(409, message);
  }
}

export function assertNoForeignKeyViolation(err, message) {
  const UNIQUE_CONSTRAINT_VIOLATION = '23505';
  if (err.code === UNIQUE_CONSTRAINT_VIOLATION) {
    throw createError(409, message);
  }
}
