import { knex } from '../db/connection.js';
import { createError } from '../utils/errors.utils.js';
import { FRIENDSHIP_STATUS, TABLES } from '../constants.js';
import { paginate } from '../utils/dbQueries.utils.js';

/*
  Map each id in ids to the given friendshipStatus
*/
function setFriendshipStatuses(friendshipStatuses, ids, friendshipStatus) {
  for (const id of ids) {
    friendshipStatuses.set(id, friendshipStatus);
  }
}

/*
  Map user ids to the correct friendship status with the logged in user
*/
async function getFriendshipStatuses(id) {
  let friendshipStatuses = new Map();

  const sentFriendRequestIds = await knex(TABLES.FRIEND_REQUEST)
    .pluck('receiver_id')
    .where('senderId', id);
  setFriendshipStatuses(
    friendshipStatuses,
    sentFriendRequestIds,
    FRIENDSHIP_STATUS.REQUEST_SENT,
  );

  const receivedFriendRequestIds = await knex(TABLES.FRIEND_REQUEST)
    .pluck('sender_id')
    .where('receiver_id', id);
  setFriendshipStatuses(
    friendshipStatuses,
    receivedFriendRequestIds,
    FRIENDSHIP_STATUS.REQUEST_RECEIVED,
  );

  const friendIds = (
    await knex(TABLES.FRIENDSHIP)
      .select('user_id', 'friend_id')
      .where('user_id', id)
      .orWhere('friend_id', id)
  ).map(({ userId, friendId }) => (userId === id ? friendId : userId));
  setFriendshipStatuses(
    friendshipStatuses,
    friendIds,
    FRIENDSHIP_STATUS.FRIENDS,
  );
  return friendshipStatuses;
}

export async function getUsers(req, res) {
  const loggedInUserId = req.user.id;
  let friendshipStatuses = await getFriendshipStatuses(loggedInUserId);

  const { q, page } = req.query;
  let query = knex(TABLES.USER)
    .select('id', 'name', 'profileImage')
    .whereNot('id', loggedInUserId);
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

export async function getUser(req, res) {
  res.json({});
}

export async function updateUser(req, res) {
  res.json({});
}
