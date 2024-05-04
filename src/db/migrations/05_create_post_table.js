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
      createTriggerThatUpdatesUpdatedAt(knex, 'post')
    );
}

function down(knex) {
  return dropTableFully(knex, 'post').then(() =>
    dropTriggerThatUpdatesUpdatedAt(knex, 'post'),
  );
}

export { up, down };
