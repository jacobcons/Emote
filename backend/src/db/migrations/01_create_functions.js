function up(knex) {
  return knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
      BEGIN
         NEW.updated_at = now();
         RETURN NEW; 
      END;
      $$ language 'plpgsql';
  `);
}

function down(knex) {
  return knex.raw(`
    DROP FUNCTION IF EXISTS update_updated_at_column;
  `);
}

export { up, down };
