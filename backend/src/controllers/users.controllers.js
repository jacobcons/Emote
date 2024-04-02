import { knex } from '../db/connection.js';
import { createError } from '../utils/errors.utils.js';
import { TABLES } from '../constants/tables.constants.js';

export const getUsers = async (req, res) => {
  const { q, page, limit } = req.query;
  let query = knex(TABLES.USER).select('*');
  if (q) {
    query = query.whereILike('name', `%${q}%`);
  }
  const users = await paginate(query, page);
  res.json(users);
};

export const getUser = (req, res) => {
  res.json({});
};

export const updateUser = (req, res) => {
  res.json({});
};
