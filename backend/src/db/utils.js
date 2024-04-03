import { TABLES } from '../constants.js';

export const dropTableFully = (knex, tableName) =>
  knex.raw(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);

export const truncateTableFully = (knex, tableName) =>
  knex.raw(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`);

export const createTriggerThatUpdatesUpdatedAt = (knex, tableName) =>
  knex.raw(`
    CREATE TRIGGER update_${tableName}_updated_at
    BEFORE UPDATE ON ${tableName}
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
  `);

export const dropTriggerThatUpdatesUpdatedAt = (knex, tableName) =>
  knex.raw(
    `DROP TRIGGER IF EXISTS update_${tableName}_updated_at ON ${tableName};`,
  );

export const addCreatedAtColumnToTable = (knex, table) =>
  table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
export const addUpdatedAtColumnToTable = (knex, table) =>
  table.timestamp('updated_at');
