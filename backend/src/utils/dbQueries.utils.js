import { knex } from '../db/connection.js';
import { TABLES } from '../constants.js';

export function paginate(query, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  return query.offset(offset).limit(limit);
}

export async function getFriendIds(userId) {
  const friendIdsA = knex('friendship')
    .select('user2Id as friendId')
    .where('user1Id', userId);
  const friendIdsB = knex('friendship')
    .select('user1Id as friendId')
    .where('user2Id', userId);
  await Promise.all([friendIdsA, friendIdsB]);
  return knex
    .union(friendIdsA, friendIdsB)
    .then((friendIds) => friendIds.map(({ friendId }) => friendId));
}

export async function dbQuery(sql, bindings) {
  return knex.raw(sql, bindings).then((res) => res.rows);
}
