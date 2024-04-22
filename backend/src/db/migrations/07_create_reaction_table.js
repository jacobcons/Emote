import { dropTableFully } from '../utils.js';
import { REACTION_TYPES } from '../../constants.js';

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
    table.enum('type', REACTION_TYPES).notNullable();
    table.unique(['user_id', 'post_id', 'type']);
  });
}

function down(knex) {
  return dropTableFully(knex, 'reaction');
}

export { up, down };
