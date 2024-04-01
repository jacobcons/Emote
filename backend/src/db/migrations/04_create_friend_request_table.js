import { TABLES } from '../../constants/tables.constants.js';
import { dropTableFully } from '../services.js';

function up(knex) {
  return knex.schema.createTable(TABLES.FRIEND_REQUEST, (table) => {
    table.increments('id');
    table
      .integer('sender_id')
      .notNullable()
      .references('id')
      .inTable(TABLES.USER);
    table
      .integer('receiver_id')
      .notNullable()
      .references('id')
      .inTable(TABLES.USER);
    table.unique(['sender_id', 'receiver_id']);
  });
}

function down(knex) {
  return dropTableFully(knex, TABLES.FRIEND_REQUEST);
}

export { up, down };
