import { knex } from '../db/connection.js';
import { checkResourceExists } from '../utils/errors.utils.js';
import { FRIENDSHIP_STATUS } from '../constants.js';
import { calculateOffset, dbQuery } from '../utils/dbQueries.utils.js';

export async function getUsers(req, res) {
  const currentUserId = req.user.id;
  const { q, page = 1, limit = 10 } = req.query;

  const sql = `
    SELECT 
      u.id, 
      name, 
      profile_image, 
      CASE
        WHEN fr.sender_id = :currentUserId THEN '${FRIENDSHIP_STATUS.REQUEST_SENT}'
        WHEN fr.receiver_id = :currentUserId THEN '${FRIENDSHIP_STATUS.REQUEST_RECEIVED}'
        WHEN f.user1_id IS NOT NULL THEN '${FRIENDSHIP_STATUS.FRIENDS}'
        ELSE '${FRIENDSHIP_STATUS.NO_REQUEST}'
      END friendship_status
    FROM "user" AS u
    LEFT JOIN "friend_request" AS fr
      ON (u.id = fr.sender_id AND fr.receiver_id = :currentUserId) OR (u.id = fr.receiver_id AND fr.sender_id = :currentUserId)
    LEFT JOIN "friendship" AS f
      ON (u.id = f.user1_id AND f.user2_id = :currentUserId) OR (u.id = f.user2_id AND f.user1_id = :currentUserId)
    WHERE name LIKE :q
    LIMIT :limit OFFSET :offset
  `;
  const users = await dbQuery(sql, {
    currentUserId,
    q: `%${q}%`,
    limit,
    offset: calculateOffset(page, limit),
  });

  res.json(users);
}

export async function getUser(req, res, next) {
  const userId = req.params.id;
  const currentUserId = req.user.id;

  const sql = `
    SELECT 
      u.id, 
      name, 
      email, 
      cover_image, 
      profile_image, 
      bio,
      CASE
        WHEN fr.sender_id = :currentUserId THEN '${FRIENDSHIP_STATUS.REQUEST_SENT}'
        WHEN fr.receiver_id = :currentUserId THEN '${FRIENDSHIP_STATUS.REQUEST_RECEIVED}'
        WHEN f.user1_id IS NOT NULL THEN '${FRIENDSHIP_STATUS.FRIENDS}'
      ELSE '${FRIENDSHIP_STATUS.NO_REQUEST}'
      END friendship_status
    FROM "user" AS u
    LEFT JOIN "friend_request" AS fr
      ON (u.id = fr.sender_id AND fr.receiver_id = :currentUserId) OR (u.id = fr.receiver_id AND fr.sender_id = :currentUserId)
    LEFT JOIN "friendship" AS f
      ON (u.id = f.user1_id AND f.user2_id = :currentUserId) OR (u.id = f.user2_id AND f.user1_id = :currentUserId)
    WHERE u.id = :userId
    LIMIT 1
  `;
  const [user] = await dbQuery(sql, { userId, currentUserId });

  checkResourceExists(user, userId);

  res.json(user);
}

export async function updateCurrentUser(req, res) {
  const currentUserId = req.user.id;
  const [user] = await knex('user')
    .update(req.body, ['id', 'name', 'coverImage', 'profileImage', 'bio'])
    .where({ id: currentUserId });

  res.json(user);
}
