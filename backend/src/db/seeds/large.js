import { hashPassword } from '../../utils/auth.utils.js';
import { truncateTableFully } from '../utils.js';
import { faker } from '@faker-js/faker';
import emojis from 'emoji.json/emoji-compact.json' assert { type: 'json' };

function getRandomInt({ min = 0, max, pow = 1 }) {
  return Math.floor(Math.random() ** pow * (max - min + 1)) + min;
}

function getRandomElement(arr) {
  return arr[getRandomInt({ max: arr.length - 1 })];
}

function generateEmojiStr(length = 10) {
  return Array.from({ length }, () =>
    Math.random() < 0 ? ' ' : getRandomElement(emojis),
  ).join('');
}

export async function seed(knex) {
  // Deletes ALL existing entries
  let truncateTablePromises = [];
  const tables = [
    'user',
    'friendship',
    'friend_request',
    'post',
    'comment',
    'reaction',
  ];
  for (const table of tables) {
    truncateTablePromises.push(truncateTableFully(knex, table));
  }
  await Promise.all(truncateTablePromises);

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
  await knex('user').insert(users);

  const NUMBER_OF_FRIENDSHIPS = NUMBER_OF_USERS * 25;
  const friendships = new Set();
  for (let userId = 1; userId <= NUMBER_OF_FRIENDSHIPS; userId++) {
    const user1Id = getRandomInt({ min: 1, max: NUMBER_OF_USERS });
    const user2Id = getRandomInt({ min: 1, max: NUMBER_OF_USERS });
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
  const f = Array.from(friendships).map((friendship) => JSON.parse(friendship));
  console.log(f[0]);
  await knex('friendship').insert(f);

  const NUMBER_OF_FRIEND_REQUESTS = NUMBER_OF_USERS * 5;
  const NUMBER_OF_POSTS = NUMBER_OF_USERS * 10;
  const NUMBER_OF_COMMENTS = NUMBER_OF_POSTS * 5;
  const NUMBER_OF_REACTIONS = NUMBER_OF_POSTS * 5;
}
