import { knex } from '../db/connection.js';
import { createError } from '../utils/errors.utils.js';
import { TABLES } from '../constants/tables.constants.js';
import { paginate } from '../utils/dbQueries.utils.js';

export const getUsers = async (req, res) => {
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
  const users = (await paginate(query, page)).map((user) => { ...user, friendStatus:  });

  res.json(users);
};

export const getUser = (req, res) => {
  res.json({});
};

export const updateUser = (req, res) => {
  res.json({});
};
