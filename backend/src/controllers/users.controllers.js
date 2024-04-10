import { knex } from '../db/connection.js';
import { checkResourceExists } from '../utils/errors.utils.js';
import { FRIENDSHIP_STATUS } from '../constants.js';
import { dbQuery } from '../utils/dbQueries.utils.js';

const getUsersSql = `
SELECT u.id, 
       name, 
       email, 
       cover_image, 
       profile_image, 
       bio,
       f.user1_id,
       f.user2_id,
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
`;

export async function getUsers(req, res) {
  const currentUserId = req.user.id;
  const users = await dbQuery(getUsersSql, { currentUserId });

  res.json(users);
}

export async function getUser(req, res, next) {
  const userId = req.params.id;
  const currentUserId = req.user.id;
  const [user] = await dbQuery(
    `
      ${getUsersSql}
      WHERE u.id = :userId
      LIMIT 1
      `,
    { userId, currentUserId },
  );

  if (!user) {
    checkResourceExists(user, userId);
  }

  res.json(user);
}

export async function updateCurrentUser(req, res) {
  const currentUserId = req.user.id;
  const [user] = await knex('user')
    .update(req.body, ['id', 'name', 'coverImage', 'profileImage', 'bio'])
    .where({ id: currentUserId });

  res.json(user);
}
