import {
  addCreatedAtColumnToTable,
  addUpdatedAtColumnToTable,
  createTriggerThatUpdatesUpdatedAt,
  dropTableFully,
  dropTriggerThatUpdatesUpdatedAt,
} from '../utils.js';

function up(knex) {
  return knex.schema
    .createTable('comment', (table) => {
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
      addCreatedAtColumnToTable(knex, table);
      addUpdatedAtColumnToTable(knex, table);
      table.string('text').notNullable();
    })
    .then(() => createTriggerThatUpdatesUpdatedAt(knex, 'comment'));
}

function down(knex) {
  return dropTableFully(knex, 'comment').then(() =>
    dropTriggerThatUpdatesUpdatedAt(knex, 'comment'),
  );
}

export { up, down };
