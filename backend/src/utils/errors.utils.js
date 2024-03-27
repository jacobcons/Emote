const createError = (statusCode, message) => {
  return {
    statusCode,
    message
  };
};

const checkResourceExists = (resource, id) => {
  if (!resource) {
    throw createError(404, `Resource with id <${id}> not found`);
  }
};

export { createError, checkResourceExists };
