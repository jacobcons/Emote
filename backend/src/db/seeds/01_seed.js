import { hashPassword } from '../../utils/auth.utils.js';
import { TABLES } from '../../constants.js';
import { truncateTableFully } from '../utils.js';

export async function seed(knex) {
  // Deletes ALL existing entries
  let truncateTablePromises = [];
  for (const table of Object.values(TABLES)) {
    truncateTablePromises.push(truncateTableFully(knex, table));
  }
  await Promise.all(truncateTablePromises);

  // seed user table
  await knex(TABLES.USER).insert([
    {
      name: 'joe',
      email: 'joe@gmail.com',
      password: await hashPassword('1'),
      coverImage:
        'https://media.istockphoto.com/id/1208738316/photo/abstract-geometric-network-polygon-globe-graphic-background.webp?b=1&s=170667a&w=0&k=20&c=Ewa2JDeA8E9k9ch3IYWkSYdEkTEhyaMNfNLkClag-j4=',
      profileImage:
        'https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg',
      bio: 'hey there partner',
    },
    {
      name: 'bob',
      email: 'bob@gmail.com',
      password: await hashPassword('1'),
    },
    {
      name: 'leo',
      email: 'leo@gmail.com',
      password: await hashPassword('1'),
    },
    {
      name: 'cat',
      email: 'cat@gmail.com',
      password: await hashPassword('1'),
    },
    {
      name: 'bat',
      email: 'bat@gmail.com',
      password: await hashPassword('1'),
    },
    {
      name: 'mat',
      email: 'mat@gmail.com',
      password: await hashPassword('1'),
    },
    {
      name: 'lat',
      email: 'lat@gmail.com',
      password: await hashPassword('1'),
    },
  ]);

  // seed friendship table
  await knex(TABLES.FRIENDSHIP).insert([
    {
      userId: 1,
      friendId: 2,
    },
    {
      userId: 1,
      friendId: 3,
    },
    {
      userId: 2,
      friendId: 3,
    },
    {
      userId: 2,
      friendId: 4,
    },
  ]);

  // seed friend_request table
  await knex(TABLES.FRIEND_REQUEST).insert([
    {
      senderId: 1,
      receiverId: 4,
    },
    {
      senderId: 1,
      receiverId: 6,
    },
    {
      senderId: 5,
      receiverId: 1,
    },
    {
      senderId: 5,
      receiverId: 4,
    },
    {
      senderId: 4,
      receiverId: 3,
    },
  ]);

  // seed post table
  await knex(TABLES.POST).insert([
    {
      userId: 1,
      text: 'paints',
      image: 'https://shorturl.at/cFRY4',
    },
    {
      userId: 1,
      text: 'cats',
    },
    {
      userId: 2,
      text: 'dogs',
    },
    {
      userId: 4,
      text: 'bats',
    },
  ]);

  // seed comment table
  await knex(TABLES.COMMENT).insert([
    {
      userId: 2,
      postId: 1,
      text: 'nice paints!',
    },
    {
      userId: 3,
      postId: 1,
      text: 'horrible paints!',
    },
    {
      userId: 1,
      postId: 2,
      text: 'cats are the best!',
    },
    {
      userId: 4,
      postId: 3,
      text: 'i like dogs the most!',
    },
  ]);

  // seed reaction table
  await knex(TABLES.REACTION).insert([
    {
      userId: 2,
      postId: 1,
      type: 'like',
    },
    {
      userId: 3,
      postId: 1,
      type: 'like',
    },
    {
      userId: 4,
      postId: 1,
      type: 'angry',
    },
    {
      userId: 2,
      postId: 2,
      type: 'laugh',
    },
  ]);
}
