import { knex } from '../db/connection.js';
import {
  checkUniqueConstraintViolation,
  checkResourceExists,
  checkForeignKeyConstraintViolation,
} from '../utils/errors.utils.js';
import { dbQuery } from '../utils/dbQueries.utils.js';

export async function getPostComments(req, res) {
  res.json({});
}

export async function createPostComment(req, res) {
  res.json({});
}

export async function updateComment(req, res) {
  res.json({});
}

export async function deleteComment(req, res) {
  res.json({});
}
