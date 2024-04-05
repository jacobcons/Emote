export function paginate(query, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  return query.offset(offset).limit(limit);
}
