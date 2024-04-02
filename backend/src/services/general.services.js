export const paginate = (query, page) => {
  const pageWithFallback = page || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  return query.offset(offset).limit(limit);
};
