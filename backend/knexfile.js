import './src/utils/env.utils.js';
import { knexSnakeCaseMappers } from 'objection';
import { basePath } from './src/utils/path.utils.js';

export default {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  migrations: {
    directory: basePath('src', 'db', 'migrations'),
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: basePath('src', 'db', 'seeds'),
  },
  ...knexSnakeCaseMappers(),
};
