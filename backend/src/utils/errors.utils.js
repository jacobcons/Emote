export function createError(statusCode, message) {
  return {
    statusCode,
    message,
  };
}

export function checkResourceExists(resource, id) {
  if (!resource) {
    throw createError(404, `Resource with id <${id}> not found`);
  }
}
