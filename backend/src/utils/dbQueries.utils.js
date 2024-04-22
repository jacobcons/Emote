import { knex } from '../db/connection.js';

export function paginate(query, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  return query.offset(offset).limit(limit);
}

export function calculateOffset(page = 1, limit) {
  return (page - 1) * limit;
}

export async function dbQuery(sql, bindings) {
  return knex.raw(sql, bindings).then((res) => res.rows);
}

export async function explainDbQuery(sql, bindings) {
  return dbQuery('EXPLAIN (ANALYSE, FORMAT JSON)' + sql, bindings).then(
    (rows) => {
      const queryPlan = rows[0]['QUERY PLAN'][0];
      delete queryPlan.Plan;
      return queryPlan;
    },
  );
}
