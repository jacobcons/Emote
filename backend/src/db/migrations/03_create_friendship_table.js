import knex from 'knex';

import { TABLES } from '../../constants.js';
import { dropTableFully } from '../utils.js';

function up(knex) {
  return knex.schema.createTable(TABLES.FRIENDSHIP, (table) => {
    table.increments('id');
    table
      .integer('user_id')
      .notNullable()
      .references('id')
      .inTable(TABLES.USER)
      .onDelete('CASCADE');
    table
      .integer('friend_id')
      .notNullable()
      .references('id')
      .inTable(TABLES.USER)
      .onDelete('CASCADE');
    table.unique(['user_id', 'friend_id']);
  });
}

function down(knex) {
  return dropTableFully(knex, TABLES.FRIENDSHIP);
}

export { up, down };
