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
  const userId = req.params.userId;
  const loggedInUserId = req.user.id;
  await knex.transaction(async (trx) => {
    const [{ exists: areFriends }] = await dbQuery(
      `
      SELECT EXISTS(
        SELECT 1
        FROM friendship
        WHERE (user1_id = :userId AND user2_id = :loggedInUserId) OR (user1_id = :loggedInUserId AND user2_id = :userId)
      )
      `,
      { userId, loggedInUserId },
      trx,
    );
    if (areFriends) {
      throw createError(409, `You are already friends with user<${userId}>`);
    }

    const [{ exists: isFriendRequest }] = await dbQuery(
      `
      SELECT EXISTS(
          SELECT 1
          FROM friend_request
          WHERE (sender_id = :userId AND receiver_id = :loggedInUserId) OR (sender_id = :loggedInUserId AND receiver_id = :userId)
      )
      `,
      { userId, loggedInUserId },
      trx,
    );
    if (isFriendRequest) {
      throw createError(
        409,
        `Friend request with user<${userId}> already exists`,
      );
    }

    try {
      const [friendRequest] = await dbQuery(
        `INSERT INTO friend_request(sender_id, receiver_id)
       VALUES (:loggedInUserId, :userId)
       RETURNING *`,
        { userId, loggedInUserId },
        trx,
      );
      await trx.commit();
      return res.status(201).json(friendRequest);
    } catch (err) {
      checkForeignKeyConstraintViolation(
        err,
        `User with ID <${userId}> not found`,
      );
      throw err;
    }
  });
}

export async function deleteFriendRequest(req, res) {
  const userId = req.params.userId;
  const loggedInUserId = req.user.id;

  const { rowCount } = await knex.raw(
    `
      DELETE FROM friend_request
      WHERE (sender_id = :userId AND receiver_id = :loggedInUserId) OR (sender_id = :loggedInUserId AND receiver_id = :userId)
      `,
    {
      userId,
      loggedInUserId,
    },
  );

  checkResourceExists(
    rowCount,
    `Friend request with user with ID <${userId}> not found`,
  );

  res.status(204).end();
}
