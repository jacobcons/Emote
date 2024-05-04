import { dropTableFully } from '../utils.js';

function up(knex) {
  return knex.schema.createTable('friend_request', (table) => {
    table.increments('id');
    table
      .integer('sender_id')
      .notNullable()
      .references('id')
      .inTable('user')
      .onDelete('CASCADE');
    table
      .integer('receiver_id')
      .notNullable()
      .references('id')
      .inTable('user')
      .onDelete('CASCADE');
    table.unique(['sender_id', 'receiver_id']);
    table.check('sender_id != receiver_id');
  });
}

function down(knex) {
  return dropTableFully(knex, 'friend_request');
}

export { up, down };
