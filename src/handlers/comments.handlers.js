import { knex } from '../db/connection.js';
import {
  checkResourceExists,
  checkForeignKeyConstraintViolation,
} from '../utils/errors.utils.js';
import { calculateOffset, dbQuery } from '../utils/dbQueries.utils.js';

export async function getComments(req, res) {
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
    ORDER BY c.created_at DESC
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

export async function createComment(req, res, next) {
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
    res.status(201).json(comment);
  } catch (err) {
    checkForeignKeyConstraintViolation(err);
    return next(err);
  }
}

export async function updateComment(req, res) {
  const commentId = req.params.id;
  const userId = req.user.id;
  const { text } = req.body;

  const [comment] = await dbQuery(
    `
    UPDATE comment
    SET text = :text
    WHERE id = :commentId AND user_id = :userId 
    RETURNING *
    `,
    {
      userId,
      commentId,
      text,
    },
  );

  checkResourceExists(comment);

  res.json(comment);
}

export async function deleteComment(req, res) {
  const commentId = req.params.id;
  const userId = req.user.id;

  const { rowCount } = await knex.raw(
    `
    DELETE FROM comment
    WHERE id = :commentId AND user_id = :userId
    `,
    {
      commentId,
      userId,
    },
  );

  checkResourceExists(rowCount);

  res.status(204).end();
}
