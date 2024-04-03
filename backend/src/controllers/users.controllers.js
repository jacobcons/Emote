import { knex } from '../db/connection.js';
import { createError } from '../utils/errors.utils.js';
import { FRIENDSHIP_STATUS, TABLES } from '../constants.js';
import { paginate } from '../utils/dbQueries.utils.js';

export async function getUsers(req, res) {
  const { q, page } = req.query;
  const idOfLoggedInUser = req.user.id;

  const sentFriendRequestIds = new Set(
    await knex(TABLES.FRIEND_REQUEST)
      .pluck('receiver_id')
      .where('senderId', idOfLoggedInUser),
  );
  const receivedFriendRequestIds = new Set(
    await knex(TABLES.FRIEND_REQUEST)
      .pluck('sender_id')
      .where('receiver_id', idOfLoggedInUser),
  );
  const friendIds = new Set(
    (
      await knex(TABLES.FRIENDSHIP)
        .select('user_id', 'friend_id')
        .where('user_id', idOfLoggedInUser)
        .orWhere('friend_id', idOfLoggedInUser)
    ).map(({ userId, friendId }) =>
      userId === idOfLoggedInUser ? friendId : userId,
    ),
  );

  let query = knex(TABLES.USER)
    .select('id', 'name', 'profileImage')
    .whereNot('id', idOfLoggedInUser);
  if (q) {
    query = query.whereILike('name', `%${q}%`);
  }
  const users = (await paginate(query, page)).map((user) => {
    const { id } = user;
    let friendshipStatus;
    if (sentFriendRequestIds.has(id)) {
      friendshipStatus = FRIENDSHIP_STATUS.REQUEST_SENT;
    } else if (receivedFriendRequestIds.has(id)) {
      friendshipStatus = FRIENDSHIP_STATUS.REQUEST_RECEIVED;
    } else if (friendIds.has(id)) {
      friendshipStatus = FRIENDSHIP_STATUS.FRIENDS;
    } else {
      friendshipStatus = FRIENDSHIP_STATUS.NO_REQUEST;
    }
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
