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
    .createTable('post', (table) => {
      table.increments('id');
      table
        .integer('user_id')
        .notNullable()
        .references('id')
        .inTable('user')
        .onDelete('CASCADE');
      addCreatedAtColumnToTable(knex, table);
      addUpdatedAtColumnToTable(knex, table);
      table.string('text').notNullable();
      table.string('image');
    })
    .then(() =>
      knex.raw(`
      CREATE TRIGGER update_job_updated_at 
      BEFORE UPDATE ON post 
      FOR EACH ROW 
      EXECUTE PROCEDURE update_updated_at_column();
    `),
    );
}

function down(knex) {
  return dropTableFully(knex, 'post').then(() =>
    dropTriggerThatUpdatesUpdatedAt(knex, 'post'),
  );
}

export { up, down };
