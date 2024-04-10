import { TABLES } from '../../constants.js';
import {
  addCreatedAtColumnToTable,
  addUpdatedAtColumnToTable,
  createTriggerThatUpdatesUpdatedAt,
  dropTableFully,
  dropTriggerThatUpdatesUpdatedAt,
} from '../utils.js';

function up(knex) {
  return knex.schema.createTable('reaction', (table) => {
    table.increments('id');
    table
      .integer('user_id')
      .notNullable()
      .references('id')
      .inTable('user')
      .onDelete('CASCADE');
    table
      .integer('post_id')
      .notNullable()
      .references('id')
      .inTable('post')
      .onDelete('CASCADE');
    table
      .enum('type', ['like', 'love', 'laugh', 'shock', 'sad', 'angry'])
      .notNullable();
    table.unique(['user_id', 'post_id', 'type']);
  });
}

function down(knex) {
  return dropTableFully(knex, 'reaction');
}

export { up, down };
