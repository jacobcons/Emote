import { knex } from '../db/connection.js';
import {
  checkResourceExists,
  checkForeignKeyConstraintViolation,
} from '../utils/errors.utils.js';
import { calculateOffset, dbQuery } from '../utils/dbQueries.utils.js';

export async function getUserFriendships(req, res) {
  const userId = req.params.id;
  const { page = 1, limit = 10, q = '%' } = req.query;

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
