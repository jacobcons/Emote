export function createError(statusCode, message) {
  return {
    statusCode,
    message,
  };
}

export function checkResourceExists(resource) {
  if (!resource) {
    throw createError(404, `Resource not found`);
  }
}
