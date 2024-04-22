import { hashPassword } from '../../utils/auth.utils.js';
import { truncateAllTables, truncateTableFully } from '../utils.js';

export async function seed(knex) {
  // Deletes ALL existing entries
  await truncateAllTables(knex);

  // seed user table
  await knex('user').insert([
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
    {
      name: 'kat',
      email: 'kat@gmail.com',
      password: await hashPassword('1'),
    },
  ]);

  // seed friendship table
  await knex('friendship').insert([
    {
      user1Id: 1,
      user2Id: 2,
    },
    {
      user1Id: 1,
      user2Id: 3,
    },
    {
      user1Id: 2,
      user2Id: 3,
    },
    {
      user1Id: 2,
      user2Id: 4,
    },
    {
      user1Id: 7,
      user2Id: 1,
    },
  ]);

  // seed friend_request table
  await knex('friend_request').insert([
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
  await knex('post').insert([
    {
      userId: 2,
      text: 'paints',
      image: 'https://shorturl.at/cFRY4',
    },
    {
      userId: 3,
      text: 'cats',
    },
    {
      userId: 7,
      text: 'dogs',
    },
    {
      userId: 4,
      text: 'bats',
    },
  ]);

  // seed comment table
  await knex('comment').insert([
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
      userId: 4,
      postId: 1,
      text: 'paint',
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
  await knex('reaction').insert([
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
    {
      userId: 5,
      postId: 2,
      type: 'laugh',
    },
    {
      userId: 6,
      postId: 2,
      type: 'laugh',
    },
  ]);
}
