import { knex } from '../db/connection.js';
import {
  checkResourceExists,
  checkForeignKeyConstraintViolation,
  createError,
  checkUniqueConstraintViolation,
} from '../utils/errors.utils.js';
import { calculateOffset, dbQuery } from '../utils/dbQueries.utils.js';

export async function getFriendships(req, res) {
  const userId = req.params.id;
  const { page = 1, limit = 10, q = '' } = req.query;

  const friendships = await dbQuery(
    `
    SELECT 
      f.id,
      CASE 
        WHEN f.user1_id = :userId THEN f.user2_id
        ELSE f.user1_id
      END "userId",
      u.name,
      u.profile_image
    FROM friendship AS f
    JOIN "user" AS u ON (f.user1_id = u.id AND f.user2_id = :userId) OR (f.user2_id = u.id AND f.user1_id = :userId)
    WHERE (user1_id = :userId OR user2_id = :userId) AND u.name ILIKE :q
    LIMIT :limit OFFSET :offset
    `,
    {
      userId,
      q: `%${q}%`,
      limit,
      offset: calculateOffset(page, limit),
    },
  );

  res.json(friendships);
}

export async function createFriendship(req, res, next) {
  const userId = req.params.userId;
  const loggedInUserId = req.user.id;
  await knex.transaction(async (trx) => {
    const { rowCount } = await trx.raw(
      `
      DELETE FROM friend_request
      WHERE sender_id = :userId AND receiver_id = :loggedInUserId
      `,
      {
        userId,
        loggedInUserId,
      },
    );
    checkResourceExists(
      rowCount,
      `Incoming friend request from user with ID <${userId}> not found`,
    );

    const [friendship] = await dbQuery(
      `INSERT INTO friendship(user1_id, user2_id)
       VALUES (:userId, :loggedInUserId)
       RETURNING *`,
      { userId, loggedInUserId },
      trx,
    );
    await trx.commit();
    return res.status(201).json(friendship);
  });
}

export async function deleteFriendship(req, res, next) {
  const userId = req.params.userId;
  const loggedInUserId = req.user.id;

  const { rowCount } = await knex.raw(
    `
      DELETE FROM friendship
      WHERE (user1_id = :userId AND user2_id = :loggedInUserId) OR (user1_id = :loggedInUserId AND user2_id = :userId)
      `,
    {
      userId,
      loggedInUserId,
    },
  );

  checkResourceExists(
    rowCount,
    `Friendship with user with ID <${userId}> not found`,
  );

  res.status(204).end();
}
