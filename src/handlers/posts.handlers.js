import { knex } from '../db/connection.js';
import { checkResourceExists } from '../utils/errors.utils.js';
import {
  calculateOffset,
  dbQuery,
  dbQueryExplain,
} from '../utils/dbQueries.utils.js';

export async function getFriendsPosts(req, res) {
  const userId = req.user.id;
  const { page = 1, limit = 10, commentLimit = 3 } = req.query;

  const posts = await dbQuery(
    `
    -- get page of friends posts, get details of post and user who made it
    WITH friends_post AS (
      SELECT
        p.id,
        p.created_at,
        p.updated_at,
        p.text,
        p.image,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'profile_image', u.profile_image
        ) AS "user",
        r.type AS "loggedInUserReaction"
      FROM post as p
      JOIN friendship as f ON (f.user1_id = :userId  AND f.user2_id = p.user_id) OR (f.user2_id = :userId AND f.user1_id = p.user_id)
      LEFT JOIN "user" as u ON p.user_id = u.id
      LEFT JOIN "reaction" as r ON p.id = r.post_id AND r.user_id = :userId
      ORDER BY p.created_at DESC
      LIMIT :limit OFFSET :offset
    ),
    -- foreach post chosen earlier, get object containing reaction type and number of those reactions to said post
    post_with_reactions AS (
      SELECT
        post_id,
        jsonb_object_agg(reaction_type_count.type, reaction_type_count.count) AS reactions
      FROM (
        SELECT fp.id as post_id, r.type, COUNT(r.type) AS count
        FROM friends_post as fp
        JOIN reaction as r ON fp.id = r.post_id
        GROUP BY fp.id, r.type
      ) AS reaction_type_count
      GROUP BY post_id
    ),
    -- foreach post chosen earlier, get array of comment objects containing details of comment and user who made it
    post_with_comments AS (
      SELECT
        fp.id as post_id,
        json_agg(
          json_build_object(
            'id', c.id,
            'created_at', c.created_at,
            'updated_at', c.updated_at,
            'text', c.text,
            'user', json_build_object(
                      'id', u.id,
                      'name', u.name,
                      'profile_image', u.profile_image
                    )
          )
          ORDER BY c.created_at DESC) AS comments
      FROM friends_post as fp
      JOIN LATERAL (
        SELECT *
        FROM comment
        WHERE post_id = fp.id
        ORDER BY created_at DESC
        LIMIT :commentLimit
      ) AS c on true
      JOIN "user" as u ON c.user_id = u.id
      GROUP BY fp.id
    )
    
    -- join up the posts chosen earlier along with its reactions and comments
    SELECT 
      fp.*,
      COALESCE(pr.reactions, '{}') AS reactions,
      COALESCE(pc.comments, '[]') AS comments
    FROM friends_post as fp
    LEFT JOIN post_with_reactions as pr ON fp.id = pr.post_id
    LEFT JOIN post_with_comments as pc ON fp.id = pc.post_id
    ORDER BY fp.created_at DESC
    `,
    {
      userId,
      limit,
      offset: calculateOffset(page, limit),
      commentLimit,
    },
  );

  res.json(posts);
}

export async function getUserPosts(req, res) {
  const loggedInUserId = req.user.id;
  const userId = req.params.id;
  const { page = 1, limit = 10, commentLimit = 3 } = req.query;

  const posts = await dbQuery(
    `
    -- get page of posts by given user, get details of post, user who made it and reaction made by logged in user
    WITH users_post AS (
      SELECT
        p.id,
        p.created_at,
        p.updated_at,
        p.text,
        p.image,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'profile_image', u.profile_image
        ) AS "user",
        r.type AS "loggedInUserReaction"
      FROM post as p
      LEFT JOIN "user" as u ON p.user_id = u.id
      LEFT JOIN "reaction" as r ON p.id = r.post_id AND r.user_id = :loggedInUserId
      WHERE p.user_id = :userId
      ORDER BY p.created_at DESC
      LIMIT :limit OFFSET :offset
    ),
    -- foreach post chosen earlier, get object containing reaction type and number of those reactions to said post
    post_with_reactions AS (
      SELECT
        post_id,
        jsonb_object_agg(reaction_type_count.type, reaction_type_count.count) AS reactions
      FROM (
        SELECT up.id as post_id, r.type, COUNT(r.type) AS count
        FROM users_post as up
        JOIN reaction as r ON up.id = r.post_id
        GROUP BY up.id, r.type
      ) AS reaction_type_count
      GROUP BY post_id
    ),
    -- foreach post chosen earlier, get array of comment objects containing details of comment and user who made it
    post_with_comments AS (
      SELECT
        up.id as post_id,
        json_agg(
          json_build_object(
            'id', c.id,
            'created_at', c.created_at,
            'updated_at', c.updated_at,
            'text', c.text,
            'user', json_build_object(
                      'id', u.id,
                      'name', u.name,
                      'profile_image', u.profile_image
                    )
          )
          ORDER BY c.created_at DESC) AS comments
      FROM users_post as up
      JOIN LATERAL (
        SELECT *
        FROM comment
        WHERE post_id = up.id
        ORDER BY created_at DESC
        LIMIT :commentLimit
      ) AS c on true
      JOIN "user" as u ON c.user_id = u.id
      GROUP BY up.id
    )
    
    -- join up the posts chosen earlier along with its reactions and comments
    SELECT 
      up.*,
      COALESCE(pr.reactions, '{}') AS reactions,
      COALESCE(pc.comments, '[]') AS comments
    FROM users_post as up
    LEFT JOIN post_with_reactions as pr ON up.id = pr.post_id
    LEFT JOIN post_with_comments as pc ON up.id = pc.post_id
    ORDER BY up.created_at DESC
    `,
    {
      loggedInUserId,
      userId,
      limit,
      offset: calculateOffset(page, limit),
      commentLimit,
    },
  );

  res.json(posts);
}

export async function createPost(req, res) {
  const userId = req.user.id;
  const [post] = await knex('post').insert({ ...req.body, userId }, ['*']);

  res.status(201).json(post);
}

export async function updatePost(req, res) {
  const postId = req.params.id;
  const userId = req.user.id;
  const [post] = await knex('post')
    .update(req.body, ['*'])
    .where({ id: postId, userId });

  checkResourceExists(
    post,
    `Post with ID <${postId}> belonging to the logged-in user not found`,
  );

  res.json(post);
}

export async function deletePost(req, res) {
  const postId = req.params.id;
  const userId = req.user.id;
  const { rowCount } = await knex.raw(
    `
    DELETE FROM post
    WHERE id = :postId AND user_id = :userId
    `,
    {
      postId,
      userId,
    },
  );

  checkResourceExists(
    rowCount,
    `Post with ID <${postId}> belonging to the logged-in user not found`,
  );

  res.status(204).end();
}
