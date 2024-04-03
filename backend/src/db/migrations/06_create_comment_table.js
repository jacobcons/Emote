import { TABLES } from '../../constants.js';
import {
  addCreatedAtColumnToTable,
  addUpdatedAtColumnToTable,
  createTriggerThatUpdatesUpdatedAt,
  dropTableFully,
  dropTriggerThatUpdatesUpdatedAt,
} from '../utils.js';

function up(knex) {
  return knex.schema
    .createTable(TABLES.COMMENT, (table) => {
      table.increments('id');
      table
        .integer('user_id')
        .notNullable()
        .references('id')
        .inTable(TABLES.USER)
        .onDelete('CASCADE');
      table
        .integer('post_id')
        .notNullable()
        .references('id')
        .inTable(TABLES.POST)
        .onDelete('CASCADE');
      addCreatedAtColumnToTable(knex, table);
      addUpdatedAtColumnToTable(knex, table);
      table.string('text').notNullable();
    })
    .then(() => createTriggerThatUpdatesUpdatedAt(knex, TABLES.COMMENT));
}

function down(knex) {
  return dropTableFully(knex, TABLES.COMMENT).then(() =>
    dropTriggerThatUpdatesUpdatedAt(knex, TABLES.COMMENT),
  );
}

export { up, down };
