import { knex } from '../db/connection.js';
import { checkResourceExists } from '../utils/errors.utils.js';
import { FRIENDSHIP_STATUS } from '../constants.js';
import { calculateOffset, dbQuery } from '../utils/dbQueries.utils.js';

export async function getFriendsPosts(req, res) {
  const { page = 1, limit = 10 } = req.query;

  res.json({});
}
