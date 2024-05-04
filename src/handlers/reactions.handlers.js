import { knex } from '../db/connection.js';
import {
  checkUniqueConstraintViolation,
  checkResourceExists,
  checkForeignKeyConstraintViolation,
} from '../utils/errors.utils.js';
import { dbQuery } from '../utils/dbQueries.utils.js';

export async function createReaction(req, res, next) {
  const postId = req.params.id;
  const userId = req.user.id;
  const { type } = req.body;

  try {
    const [reaction] = await dbQuery(
      `
    INSERT INTO reaction(post_id, user_id, type) 
    VALUES (:postId, :userId, :type)
    RETURNING *
    `,
      {
        postId,
        userId,
        type,
      },
    );
    res.status(201).json(reaction);
  } catch (err) {
    checkUniqueConstraintViolation(
      err,
      `Logged in user has already reacted to this post`,
    );
    checkForeignKeyConstraintViolation(err);
    return next(err);
  }
}

export async function updateReaction(req, res) {
  const postId = req.params.id;
  const userId = req.user.id;
  const { type } = req.body;

  const [reaction] = await dbQuery(
    `
    UPDATE reaction
    SET type = :type
    WHERE post_id = :postId AND user_id = :userId 
    RETURNING *
    `,
    {
      postId,
      userId,
      type,
    },
  );

  checkResourceExists(reaction);

  res.json(reaction);
}

export async function deleteReaction(req, res) {
  const postId = req.params.id;
  const userId = req.user.id;

  const { rowCount } = await knex.raw(
    `
    DELETE FROM reaction
    WHERE post_id = :postId AND user_id = :userId 
    `,
    {
      postId,
      userId,
    },
  );

  checkResourceExists(rowCount);

  res.status(204).end();
}
