export function paginate(query, page) {
  const pageWithFallback = page || 1;
  const limit = 100;
  const offset = (pageWithFallback - 1) * limit;
  return query.offset(offset).limit(limit);
}
