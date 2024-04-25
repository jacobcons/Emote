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
    SELECT 
      c.id, 
      c.created_at, 
      c.updated_at,
      c.text,
      json_build_object(
        'id', u.id,
        'name', u.name,
        'profile_image', u.profile_image
      ) AS "user"
    FROM comment as c
    JOIN "user" as u ON c.user_id = u.id
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
  const userId = req.user.id;
  const postId = req.params.id;
  const { text } = req.body;

  try {
    const [comment] = await dbQuery(
      `
    INSERT INTO comment(user_id, post_id, text) 
    VALUES (:userId, :postId, :text)
    RETURNING *
    `,
      {
        userId,
        postId,
        text,
      },
    );
    res.json(comment);
  } catch (err) {
    checkForeignKeyConstraintViolation(err);
    throw err;
  }
}

export async function updateComment(req, res) {
  res.json({});
}

export async function deleteComment(req, res) {
  res.json({});
}
