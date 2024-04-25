import { knex } from '../db/connection.js';
import {
  checkUniqueConstraintViolation,
  checkResourceExists,
  checkForeignKeyConstraintViolation,
} from '../utils/errors.utils.js';
import { calculateOffset, dbQuery } from '../utils/dbQueries.utils.js';

export async function getPostComments(req, res) {
  const postId = req.params.id;
  const { page = 1, limit = 10 } = req.query;

  const comments = await dbQuery(
    `
    SELECT *
    FROM comment as c 
    WHERE c.post_id = :postId
    LIMIT :limit OFFSET :offset
    `,
    {
      postId,
      limit,
      offset: calculateOffset(page, limit),
    },
  );

  res.json(comments);
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
