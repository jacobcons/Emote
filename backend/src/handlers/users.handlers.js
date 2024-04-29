import { knex } from '../db/connection.js';
import { checkResourceExists } from '../utils/errors.utils.js';
import { FRIENDSHIP_STATUS } from '../constants.js';
import { calculateOffset, dbQuery } from '../utils/dbQueries.utils.js';

export async function getUsers(req, res) {
  const loggedInUserId = req.user.id;
  const { page = 1, limit = 10, q = '' } = req.query;

  const users = await dbQuery(
    `
    SELECT
      u.id,
      name,
      profile_image,
      CASE
        WHEN fr.sender_id = :loggedInUserId THEN '${FRIENDSHIP_STATUS.REQUEST_SENT}'
        WHEN fr.receiver_id = :loggedInUserId THEN '${FRIENDSHIP_STATUS.REQUEST_RECEIVED}'
        WHEN f.user1_id IS NOT NULL THEN '${FRIENDSHIP_STATUS.FRIENDS}'
        WHEN u.id = :loggedInUserId THEN '${FRIENDSHIP_STATUS.SELF}'
        ELSE '${FRIENDSHIP_STATUS.NO_REQUEST}'
        END friendship_status
    FROM "user" AS u
    LEFT JOIN "friend_request" AS fr
      ON (u.id = fr.sender_id AND fr.receiver_id = :loggedInUserId) OR (u.id = fr.receiver_id AND fr.sender_id = :loggedInUserId)
    LEFT JOIN "friendship" AS f
      ON (u.id = f.user1_id AND f.user2_id = :loggedInUserId) OR (u.id = f.user2_id AND f.user1_id = :loggedInUserId)
    WHERE name ILIKE :q
    LIMIT :limit OFFSET :offset
    `,
    {
      loggedInUserId,
      q: `%${q}%`,
      limit,
      offset: calculateOffset(page, limit),
    },
  );

  res.json(users);
}

export async function getUser(req, res, next) {
  const userId = req.params.id;
  const loggedInUserId = req.user.id;

  const [user] = await dbQuery(
    `
    SELECT 
      u.id, 
      name, 
      email, 
      cover_image, 
      profile_image, 
      bio,
    CASE
      WHEN fr.sender_id = :loggedInUserId THEN '${FRIENDSHIP_STATUS.REQUEST_SENT}'
      WHEN fr.receiver_id = :loggedInUserId THEN '${FRIENDSHIP_STATUS.REQUEST_RECEIVED}'
      WHEN f.user1_id IS NOT NULL THEN '${FRIENDSHIP_STATUS.FRIENDS}'
      WHEN u.id = :loggedInUserId THEN '${FRIENDSHIP_STATUS.SELF}'
    ELSE '${FRIENDSHIP_STATUS.NO_REQUEST}'
    END friendship_status
    FROM "user" AS u
    LEFT JOIN "friend_request" AS fr
      ON (u.id = fr.sender_id AND fr.receiver_id = :loggedInUserId) OR (u.id = fr.receiver_id AND fr.sender_id = :loggedInUserId)
    LEFT JOIN "friendship" AS f
      ON (u.id = f.user1_id AND f.user2_id = :loggedInUserId) OR (u.id = f.user2_id AND f.user1_id = :loggedInUserId)
    WHERE u.id = :userId
    LIMIT 1
    `,
    { userId, loggedInUserId },
  );

  checkResourceExists(user);

  res.json(user);
}

export async function updateCurrentUser(req, res) {
  const userId = req.user.id;
  const [user] = await knex('user')
    .update(req.body, ['id', 'name', 'coverImage', 'profileImage', 'bio'])
    .where({ id: userId });

  res.json(user);
}
