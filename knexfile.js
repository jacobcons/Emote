import { knexSnakeCaseMappers } from 'objection';
import { basePath } from './src/utils/path.utils.js';

export default {
  client: 'pg',
  connection: process.env.DB_URL,
  migrations: {
    directory: basePath('src', 'db', 'migrations'),
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: basePath('src', 'db', 'seeds'),
  },
  // debug: true,
  ...knexSnakeCaseMappers(),
};
