import { knex } from '../db/connection.js';
import { checkResourceExists, createError } from '../utils/errors.utils.js';
import { FRIENDSHIP_STATUS, TABLES } from '../constants.js';
import { getFriendIds, paginate } from '../utils/dbQueries.utils.js';

/*
  Map user ids to the correct friendship status with the logged-in user
*/
async function getFriendshipStatuses(currentUserId) {
  const friendshipStatuses = new Map();

  const friendRequests = await knex('friend_request')
    .select('sender_id', 'receiver_id')
    .where({ senderId: currentUserId })
    .orWhere({ receiverId: currentUserId });
  for (const friendRequest of friendRequests) {
    const { senderId, receiverId } = friendRequest;
    senderId === currentUserId
      ? friendshipStatuses.set(receiverId, FRIENDSHIP_STATUS.REQUEST_SENT)
      : friendshipStatuses.set(senderId, FRIENDSHIP_STATUS.REQUEST_RECEIVED);
  }

  for (const friendId of await getFriendIds(currentUserId)) {
    friendshipStatuses.set(friendId, FRIENDSHIP_STATUS.FRIENDS);
  }
  return friendshipStatuses;
}

export async function getUsers(req, res) {
  const currentUserId = req.user.id;

  const friendshipStatuses = await getFriendshipStatuses(currentUserId);

  const { q, page } = req.query;
  let query = knex('user')
    .select('id', 'name', 'profileImage')
    .whereNot('id', currentUserId);
  if (q) {
    query = query.whereILike('name', `%${q}%`);
  }
  const users = (await paginate(query, page)).map((user) => {
    const { id } = user;
    const friendshipStatus =
      friendshipStatuses.get(id) || FRIENDSHIP_STATUS.NO_REQUEST;
    return { ...user, friendshipStatus };
  });

  res.json(users);
}

export async function getUser(req, res, next) {
  const userId = req.params.id;
  const currentUserId = req.user.id;
  const user = await knex
    .raw(
      `
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
    WHERE u.id = :userId
    LIMIT 1
    `,
      { userId, currentUserId },
    )
    .then((res) => Object.values(res.rows));

  if (!user) {
    checkResourceExists(user, userId);
  }

  res.json({ ...user });
}

export async function updateCurrentUser(req, res) {
  const currentUserId = req.user.id;
  const [user] = await knex('user')
    .update(req.body, ['id', 'name', 'coverImage', 'profileImage', 'bio'])
    .where({ id: currentUserId });

  res.json(user);
}
