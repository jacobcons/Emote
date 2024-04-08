import { knex } from '../db/connection.js';
import { checkResourceExists, createError } from '../utils/errors.utils.js';
import { FRIENDSHIP_STATUS, TABLES } from '../constants.js';
import { getFriendIds, paginate } from '../utils/dbQueries.utils.js';

/*
  Map user ids to the correct friendship status with the logged-in user
*/
async function getFriendshipStatuses(currentUserId) {
  const friendshipStatuses = new Map();

  const friendRequests = await knex(TABLES.FRIEND_REQUEST)
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
  let query = knex(TABLES.USER)
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
  const user = await knex(TABLES.USER)
    .first('id', 'name', 'email', 'cover_image', 'profile_image', 'bio')
    .where('id', userId);
  if (!user) {
    checkResourceExists(user, userId);
  }

  const currentUserId = req.user.id;
  let friendshipStatus;
  const friendRequest = await knex(TABLES.FRIEND_REQUEST)
    .first('sender_id', 'receiver_id')
    .where({ senderId: currentUserId, receiverId: userId })
    .orWhere({ senderId: userId, receiverId: currentUserId });
  if (friendRequest) {
    const { senderId } = friendRequest;
    friendshipStatus =
      senderId === currentUserId
        ? FRIENDSHIP_STATUS.REQUEST_SENT
        : FRIENDSHIP_STATUS.REQUEST_RECEIVED;
  } else {
    const friendship = await knex(TABLES.FRIENDSHIP)
      .first('user1_id', 'user2_id')
      .where({ user1Id: currentUserId, user2Id: userId })
      .orWhere({ user1Id: userId, user2Id: currentUserId });
    friendshipStatus = friendship
      ? FRIENDSHIP_STATUS.FRIENDS
      : FRIENDSHIP_STATUS.NO_REQUEST;
  }

  res.json({ ...user, friendshipStatus });
}

export async function updateCurrentUser(req, res) {
  const currentUserId = req.user.id;
  const [user] = await knex(TABLES.USER)
    .update(req.body, ['id', 'name', 'coverImage', 'profileImage', 'bio'])
    .where({ id: currentUserId });

  res.json(user);
}
