import { TABLES } from '../../constants/tables.constants.js';
import {
  addCreatedAtColumnToTable,
  addUpdatedAtColumnToTable,
  createTriggerThatUpdatesUpdatedAt,
  dropTableFully,
  dropTriggerThatUpdatesUpdatedAt,
} from '../utils.js';

function up(knex) {
  return knex.schema
    .createTable(TABLES.POST, (table) => {
      table.increments('id');
      table
        .integer('user_id')
        .notNullable()
        .references('id')
        .inTable(TABLES.USER);
      addCreatedAtColumnToTable(knex, table);
      addUpdatedAtColumnToTable(knex, table);
      table.string('text').notNullable();
      table.string('image');
    })
    .then(() =>
      knex.raw(`
      CREATE TRIGGER update_job_updated_at 
      BEFORE UPDATE ON ${TABLES.POST} 
      FOR EACH ROW 
      EXECUTE PROCEDURE update_updated_at_column();
    `),
    );
}

function down(knex) {
  return dropTableFully(knex, TABLES.POST).then(() =>
    dropTriggerThatUpdatesUpdatedAt(knex, TABLES.POST),
  );
}

export { up, down };
