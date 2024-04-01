import knex from 'knex';

import { TABLES } from '../../constants/tables.constants.js';
import { dropTableFully } from '../services.js';

function up(knex) {
  return knex.schema.createTable(TABLES.FRIENDSHIP, (table) => {
    table.increments('id');
    table
      .integer('user_id')
      .notNullable()
      .references('id')
      .inTable(TABLES.USER);
    table
      .integer('friend_id')
      .notNullable()
      .references('id')
      .inTable(TABLES.USER);
    table.unique(['user_id', 'friend_id']);
  });
}

function down(knex) {
  return dropTableFully(knex, TABLES.FRIENDSHIP);
}

export { up, down };
