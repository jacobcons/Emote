import { knex } from '../db/connection.js';
import {
  checkResourceExists,
  checkForeignKeyConstraintViolation,
  createError,
  checkUniqueConstraintViolation,
} from '../utils/errors.utils.js';
import { calculateOffset, dbQuery } from '../utils/dbQueries.utils.js';
import { FRIEND_REQUEST_TYPES } from '../constants.js';

export async function getFriendRequests(req, res) {
  const loggedInUserId = req.user.id;
  const { q = '', type, page = 1, limit = 10 } = req.query;
  let sql = `
  SELECT fr.id, u.id, u.name, u.profile_image
  FROM friend_request AS fr
  `;

  if (type === FRIEND_REQUEST_TYPES.INCOMING) {
    sql += `
    JOIN "user" AS u ON fr.sender_id = u.id
    WHERE receiver_id = :loggedInUserId
    `;
  } else if (type === FRIEND_REQUEST_TYPES.OUTGOING) {
    sql += `
    JOIN "user" AS u ON fr.receiver_id = u.id
    WHERE sender_id = :loggedInUserId`;
  }
  sql += ` AND u.name LIKE :q
   LIMIT :limit OFFSET :offset`;

  const friendRequests = await dbQuery(sql, {
    loggedInUserId,
    q: `%${q}%`,
    limit,
    offset: calculateOffset(page, limit),
  });

  res.json(friendRequests);
}

export async function createFriendRequest(req, res) {
  res.json({});
}

export async function deleteFriendRequest(req, res) {
  res.json({});
}
