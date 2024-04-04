import { knex } from '../db/connection.js';
import { createError } from '../utils/errors.utils.js';
import { FRIENDSHIP_STATUS, TABLES } from '../constants.js';
import { paginate } from '../utils/dbQueries.utils.js';

/*
  Map user ids to the correct friendship status with the logged-in user
*/
async function getFriendshipStatuses(loggedInUserId) {
  const friendshipStatuses = new Map();

  const friendRequests = await knex(TABLES.FRIEND_REQUEST)
    .select('sender_id', 'receiver_id')
    .where({ senderId: loggedInUserId })
    .orWhere({ receiverId: loggedInUserId });
  for (const friendRequest of friendRequests) {
    const { senderId, receiverId } = friendRequest;
    senderId === loggedInUserId
      ? friendshipStatuses.set(receiverId, FRIENDSHIP_STATUS.REQUEST_SENT)
      : friendshipStatuses.set(senderId, FRIENDSHIP_STATUS.REQUEST_RECEIVED);
  }

  const friendships = await knex(TABLES.FRIENDSHIP)
    .select('user1Id', 'user2Id')
    .where('user1Id', loggedInUserId)
    .orWhere('user2Id', loggedInUserId);
  for (const friendship of friendships) {
    const { user1Id, user2Id } = friendship;
    const otherUserId = user1Id === loggedInUserId ? user2Id : user1Id;
    friendshipStatuses.set(otherUserId, FRIENDSHIP_STATUS.FRIENDS);
  }
  return friendshipStatuses;
}

export async function getUsers(req, res) {
  const loggedInUserId = req.user.id;

  const friendshipStatuses = await getFriendshipStatuses(loggedInUserId);

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
  const loggedInUserId = req.user.id;
  const userId = req.params.id;
  let friendshipStatus;

  const friendRequest = await knex(TABLES.FRIEND_REQUEST)
    .first('sender_id', 'receiver_id')
    .where({ senderId: loggedInUserId, receiverId: userId })
    .orWhere({ senderId: userId, receiverId: loggedInUserId });
  if (friendRequest) {
    const { senderId, receiverId } = friendRequest;
    if (senderId === loggedInUserId) {
      friendshipStatus = FRIENDSHIP_STATUS.REQUEST_SENT;
    } else if (receiverId === loggedInUserId) {
      friendshipStatus = FRIENDSHIP_STATUS.REQUEST_RECEIVED;
    }
  }

  if (!friendRequest) {
    const friendship = await knex(TABLES.FRIENDSHIP)
      .first('user1_id', 'user2_id')
      .where({ user1Id: loggedInUserId, user2Id: userId })
      .orWhere({ user1Id: userId, user2Id: loggedInUserId });
    friendshipStatus = friendship
      ? FRIENDSHIP_STATUS.FRIENDS
      : FRIENDSHIP_STATUS.NO_REQUEST;
  }

  const user = await knex(TABLES.USER)
    .first('id', 'name', 'email', 'cover_image', 'profile_image', 'bio')
    .where('id', userId);

  res.json({ ...user, friendshipStatus });
}

export async function updateUser(req, res) {
  res.json({});
}
