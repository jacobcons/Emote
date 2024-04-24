import { knex } from '../db/connection.js';
import { checkResourceExists } from '../utils/errors.utils.js';
import { dbQuery } from '../utils/dbQueries.utils.js';

export async function createReaction(req, res) {
  const loggedInUserId = req.user.id;
  const postId = req.params.id;
  res.json({});
}

export async function updateReaction(req, res) {
  const loggedInUserId = req.user.id;
  const postId = req.params.id;
  res.json({});
}

export async function deleteReaction(req, res) {
  const loggedInUserId = req.user.id;
  const postId = req.params.id;
  res.json({});
}
