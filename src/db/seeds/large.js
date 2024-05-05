import { hashPassword } from '../../utils/auth.utils.js';
import { truncateAllTables, truncateTableFully } from '../utils.js';
import { faker } from '@faker-js/faker';
import emojis from 'emoji.json/emoji-compact.json' with { type: 'json' };
import { REACTION_TYPES } from '../../constants.js';
import { subYears } from 'date-fns';

export async function seed(knex) {
  console.time();
  // Deletes ALL existing entries
  await truncateAllTables(knex);

  // generate users to insert
  const NUMBER_OF_USERS = 10000;
  const users = [];
  const hashedPassword = await hashPassword('123');
  for (let userId = 1; userId <= NUMBER_OF_USERS; userId++) {
    users.push({
      name: faker.person.fullName(),
      email: `${userId}@gmail.com`,
      password: hashedPassword,
      cover_image: faker.image.url(),
      profile_image: faker.image.avatar(),
      bio: generateEmojiStr(),
    });
  }

  // generates friendships to insert
  const NUMBER_OF_FRIENDSHIPS = NUMBER_OF_USERS * 25;
  const friendships = new Set();
  for (let i = 1; i <= NUMBER_OF_FRIENDSHIPS; i++) {
    const user1Id = randomId(NUMBER_OF_USERS);
    const user2Id = randomId(NUMBER_OF_USERS);

    if (user1Id === user2Id) {
      continue;
    }

    friendships.add(
      JSON.stringify({
        user1Id: Math.min(user1Id, user2Id),
        user2Id: Math.max(user1Id, user2Id),
      }),
    );
  }

  // generates friend requests to insert
  const NUMBER_OF_FRIEND_REQUESTS = NUMBER_OF_USERS * 5;
  const friendRequests = new Set();
  for (let i = 1; i <= NUMBER_OF_FRIEND_REQUESTS; i++) {
    const senderId = randomId(NUMBER_OF_USERS);
    const receiverId = randomId(NUMBER_OF_USERS);

    const alreadyFriends = friendships.has(
      JSON.stringify({
        user1Id: Math.min(senderId, receiverId),
        user2Id: Math.max(senderId, receiverId),
      }),
    );
    const alreadyFriendRequestInOtherDirection = friendRequests.has(
      JSON.stringify({
        senderId: receiverId,
        receiverId: senderId,
      }),
    );
    if (
      senderId === receiverId ||
      alreadyFriends ||
      alreadyFriendRequestInOtherDirection
    ) {
      continue;
    }

    friendRequests.add(JSON.stringify({ senderId, receiverId }));
  }

  // generates posts to insert
  const NUMBER_OF_POSTS = NUMBER_OF_USERS * 10;
  const posts = [];
  const currentDate = new Date();
  const earliestPossiblePostCreatedAt = subYears(currentDate, 2);
  const latestPossiblePostCreatedAt = subYears(currentDate, 1);
  for (let i = 1; i <= NUMBER_OF_POSTS; i++) {
    const userId = randomId(NUMBER_OF_USERS);
    const createdAt = randomDate(
      earliestPossiblePostCreatedAt,
      latestPossiblePostCreatedAt,
    );
    const updatedAt =
      Math.random() < 0.05 ? randomDate(createdAt, currentDate) : null;
    posts.push({
      userId,
      text: generateEmojiStr(),
      image: faker.image.url(),
      createdAt,
      updatedAt,
    });
  }

  // generate comments to insert
  const NUMBER_OF_COMMENTS = NUMBER_OF_POSTS * 5;
  const comments = [];
  for (let i = 1; i <= NUMBER_OF_COMMENTS; i++) {
    const userId = randomId(NUMBER_OF_USERS);
    const postId = randomId(NUMBER_OF_POSTS);
    const createdAt = randomDate(latestPossiblePostCreatedAt, currentDate);
    const updatedAt =
      Math.random() < 0.05 ? randomDate(createdAt, currentDate) : null;
    comments.push({
      userId,
      postId,
      text: generateEmojiStr(),
      createdAt,
      updatedAt,
    });
  }

  // generate reactions to insert
  const NUMBER_OF_REACTIONS = NUMBER_OF_POSTS * 5;
  const reactions_no_type = new Set();
  for (let i = 1; i <= NUMBER_OF_REACTIONS; i++) {
    const userId = randomId(NUMBER_OF_USERS);
    const postId = randomId(NUMBER_OF_POSTS);
    reactions_no_type.add(
      JSON.stringify({
        userId,
        postId,
      }),
    );
  }
  const reactions = [];
  for (let reaction of reactions_no_type) {
    reactions.push({
      ...JSON.parse(reaction),
      type: getRandomElement(REACTION_TYPES),
    });
  }

  // insert everything into db
  await batchInsert(knex, 'user', users);
  await Promise.all([
    batchInsert(knex, 'friendship', convertSetToArray(friendships)),
    batchInsert(knex, 'friend_request', convertSetToArray(friendRequests)),
    batchInsert(knex, 'post', posts).then(() => {
      return Promise.all([
        batchInsert(knex, 'comment', comments),
        batchInsert(knex, 'reaction', reactions),
      ]);
    }),
  ]);

  console.timeEnd();
}

function randomInt({ min = 0, max, pow = 1 }) {
  return Math.floor(Math.random() ** pow * (max - min + 1)) + min;
}

function getRandomElement(array) {
  return array[randomInt({ max: array.length - 1 })];
}

function generateEmojiStr(minLength = 1, maxLength = 10) {
  const length = randomInt({ min: minLength, max: maxLength });
  return Array.from({ length }, () =>
    Math.random() < 0.1 ? ' ' : getRandomElement(emojis),
  ).join('');
}

function randomId(n) {
  return randomInt({ min: 1, max: n });
}

// insert all elements in array into db, insert as many at once as possible
function batchInsert(knex, tableName, array) {
  const POSTGRES_PARAM_LIMIT = 65535;
  const paramsPerObject = Object.keys(array[0]).length;
  return knex.batchInsert(
    tableName,
    array,
    Math.floor(POSTGRES_PARAM_LIMIT / paramsPerObject),
  );
}

// convert set of json strings to array of json objects
function convertSetToArray(set) {
  return Array.from(set).map((el) => JSON.parse(el));
}

function randomDate(min, max) {
  return new Date(randomInt({ min: min.getTime(), max: max.getTime() }));
}
