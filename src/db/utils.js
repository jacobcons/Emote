import { dbQuery } from '../utils/dbQueries.utils.js';

export function dropTableFully(knex, tableName) {
  return knex.raw(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
}

export function truncateTableFully(knex, tableName) {
  return knex.raw(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`);
}

export async function truncateAllTables(knex) {
  const tables = await knex.raw(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public' AND tablename NOT IN ('knex_migrations', 'knex_migrations_lock')
    `);

  // Generate an array of truncation promises
  const truncateTablePromises = tables.rows.map(({ tablename }) =>
    knex.raw(`TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE`),
  );

  // Execute all truncations
  await Promise.all(truncateTablePromises);
}

export function createTriggerThatUpdatesUpdatedAt(knex, tableName) {
  return knex.raw(`
    CREATE TRIGGER update_${tableName}_updated_at
    BEFORE UPDATE ON ${tableName}
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
  `);
}

export function dropTriggerThatUpdatesUpdatedAt(knex, tableName) {
  return knex.raw(
    `DROP TRIGGER IF EXISTS update_${tableName}_updated_at ON ${tableName};`,
  );
}

export function addCreatedAtColumnToTable(knex, table) {
  return table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
}
export function addUpdatedAtColumnToTable(knex, table) {
  table.timestamp('updated_at');
}
