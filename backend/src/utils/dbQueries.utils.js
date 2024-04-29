import { knex } from '../db/connection.js';
import humps from 'humps';

export function paginate(query, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  return query.offset(offset).limit(limit);
}

export function calculateOffset(page = 1, limit) {
  return (page - 1) * limit;
}

export async function dbQuery(sql, bindings, conn) {
  const connection = conn || knex;
  return connection
    .raw(sql, bindings)
    .then((res) => humps.camelizeKeys(res.rows));
}

export async function dbQueryExplain(sql, bindings) {
  return dbQuery('EXPLAIN (ANALYSE, FORMAT JSON)' + sql, bindings).then(
    (rows) => {
      const queryPlan = rows[0]['QUERY PLAN'][0];
      delete queryPlan.Plan;
      return queryPlan;
    },
  );
}
