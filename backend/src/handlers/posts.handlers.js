import { knex } from '../db/connection.js';
import { checkResourceExists } from '../utils/errors.utils.js';
import { FRIENDSHIP_STATUS } from '../constants.js';
import { calculateOffset, dbQuery } from '../utils/dbQueries.utils.js';

export async function getFriendsPosts(req, res) {
  const currentUserId = req.user.id;
  const { page = 1, limit = 10, commentLimit = 3 } = req.query;

  const sql = `
    WITH "post_with_reactions" AS (
      SELECT
        post_id,
        jsonb_object_agg(rc.type, rc.reaction_count) AS reactions
      FROM (
        SELECT post_id, type, COUNT(type) AS reaction_count
        FROM "reaction" as r
        JOIN "post" as p ON r.post_id = p.id
        JOIN "friendship" as f ON (f.user1_id = :currentUserId AND f.user2_id = p.user_id) OR (f.user2_id = :currentUserId AND f.user1_id = p.user_id)
        GROUP BY post_id, type
      ) AS rc
      GROUP BY post_id
    ),
    "post_with_comments" AS (
      SELECT
        p.id as post_id,
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
        ) AS comments
      FROM "post" as p
      JOIN LATERAL (
        SELECT *
        FROM "comment"
        WHERE post_id = p.id
        ORDER BY created_at DESC
        LIMIT :commentLimit
      ) AS c on true
      JOIN "user" as u ON c.user_id = u.id
      JOIN "friendship" as f ON (f.user1_id = :currentUserId AND f.user2_id = p.user_id) OR (f.user2_id = :currentUserId AND f.user1_id = p.user_id)
      GROUP BY p.id
    )
    
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
      COALESCE(pr.reactions, '{}') AS reactions,
      COALESCE(pc.comments, '[]') AS comments
    FROM "post" as p
    JOIN "friendship" as f ON (f.user1_id = :currentUserId  AND f.user2_id = p.user_id) OR (f.user2_id = :currentUserId  AND f.user1_id = p.user_id)
    LEFT JOIN "user" as u ON p.user_id = u.id
    LEFT JOIN "post_with_reactions" as pr ON p.id = pr.post_id
    LEFT JOIN "post_with_comments" as pc ON p.id = pc.post_id
    ORDER BY p.id
    LIMIT :limit OFFSET :offset
  `;
  const posts = await dbQuery(sql, {
    currentUserId,
    limit,
    offset: calculateOffset(page, limit),
    commentLimit,
  });

  res.json(posts);
}
