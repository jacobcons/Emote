import knexLib from 'knex';
import knexConfig from '../../knexfile.js';

const knex = knexLib(knexConfig);

export { knex };
