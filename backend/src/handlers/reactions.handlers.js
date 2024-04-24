import { knex } from '../db/connection.js';
import {
  checkUniqueConstraintViolation,
  checkResourceExists,
  checkForeignKeyConstraintViolation,
} from '../utils/errors.utils.js';
import { dbQuery } from '../utils/dbQueries.utils.js';

export async function createReaction(req, res) {
  const userId = req.user.id;
  const postId = req.params.id;
  const { type } = req.body;

  try {
    const [reaction] = await dbQuery(
      `
    INSERT INTO reaction(user_id, post_id, type) 
    VALUES (:userId, :postId, :type)
    RETURNING *
    `,
      {
        userId,
        postId,
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
    throw err;
  }
}

export async function updateReaction(req, res) {
  const userId = req.user.id;
  const postId = req.params.id;
  const { type } = req.body;

  const [reaction] = await dbQuery(
    `
    UPDATE reaction
    SET type = :type
    WHERE user_id = :userId AND post_id = :postId
    RETURNING *
    `,
    {
      userId,
      postId,
      type,
    },
  );

  checkResourceExists(reaction);

  res.json(reaction);
}

export async function deleteReaction(req, res) {
  const userId = req.user.id;
  const postId = req.params.id;

  const { rowCount } = await knex.raw(
    `
    DELETE FROM reaction
    WHERE user_id = :userId AND post_id = :postId
    `,
    {
      userId,
      postId,
    },
  );

  checkResourceExists(rowCount);

  res.status(204).end();
}
