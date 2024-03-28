import knex from 'knex';

import { TABLES } from '../../constants/tables.constants.js';
import {
  addCreatedAtColumnToTable,
  addUpdatedAtColumnToTable,
  createTriggerThatUpdatesUpdatedAt,
  dropTableFully,
  dropTriggerThatUpdatesUpdatedAt,
} from '../services.js';

function up(knex) {
  return knex.schema.createTable(TABLES.REACTION, (table) => {
    table.increments('id');
    table
      .integer('user_id')
      .notNullable()
      .references('id')
      .inTable(TABLES.USER);
    table
      .integer('post_id')
      .notNullable()
      .references('id')
      .inTable(TABLES.POST);
    table
      .enum('type', ['like', 'love', 'laugh', 'shock', 'sad', 'angry'])
      .notNullable();
  });
}

function down(knex) {
  return dropTableFully(knex, TABLES.REACTION);
}

export { up, down };
