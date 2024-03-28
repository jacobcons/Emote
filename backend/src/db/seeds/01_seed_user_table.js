import { hashPassword } from '../../utils/auth.utils.js';
import { TABLES } from '../../constants/tables.constants.js';
import { truncateTableFully } from '../services.js';

export async function seed(knex) {
  // Deletes ALL existing entries
  await truncateTableFully(knex, TABLES.USER);
  await knex(TABLES.USER).insert([
    {
      name: 'joey',
      email: 'joey@gmail.com',
      password: await hashPassword('joeymcjoey'),
    },
    {
      name: 'bob',
      email: 'bob@gmail.com',
      password: await hashPassword('bobmcbob'),
    },
  ]);
}
