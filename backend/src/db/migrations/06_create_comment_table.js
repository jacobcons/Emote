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
  return knex.schema
    .createTable(TABLES.COMMENT, (table) => {
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
      addCreatedAtColumnToTable(knex, table);
      addUpdatedAtColumnToTable(knex, table);
      table.string('text').notNullable();
    })
    .then(() => createTriggerThatUpdatesUpdatedAt(TABLES.COMMENT));
}

function down(knex) {
  return dropTableFully(knex, TABLES.COMMENT).then(() =>
    dropTriggerThatUpdatesUpdatedAt(TABLES.COMMENT),
  );
}

export { up, down };
