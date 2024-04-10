import { TABLES } from '../../constants.js';
import { dropTableFully } from '../utils.js';

function up(knex) {
  return knex.schema.createTable('user', (table) => {
    table.increments('id');
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.string('cover_image');
    table.string('profile_image');
    table.string('bio');
  });
}

function down(knex) {
  return dropTableFully(knex, 'user');
}

export { up, down };
