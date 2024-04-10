import knex from 'knex';

import { TABLES } from '../../constants.js';
import { dropTableFully } from '../utils.js';

function up(knex) {
  return knex.schema.createTable('friendship', (table) => {
    table.increments('id');
    table
      .integer('user1_id')
      .notNullable()
      .references('id')
      .inTable('user')
      .onDelete('CASCADE');
    table
      .integer('user2_id')
      .notNullable()
      .references('id')
      .inTable('user')
      .onDelete('CASCADE');
    table.unique(['user1_id', 'user2_id']);
  });
}

function down(knex) {
  return dropTableFully(knex, 'friendship');
}

export { up, down };
