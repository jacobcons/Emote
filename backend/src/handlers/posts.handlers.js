import { knex } from '../db/connection.js';
import { checkResourceExists } from '../utils/errors.utils.js';
import { FRIENDSHIP_STATUS } from '../constants.js';
import {
  calculateOffset,
  dbQuery,
  dbQueryExplain,
} from '../utils/dbQueries.utils.js';

export async function getFriendsPosts(req, res) {
  const currentUserId = req.user.id;
  const { page = 1, limit = 10, commentLimit = 3 } = req.query;

  const sql = `
    -- get page of friends posts, get details of post and user who made it
    WITH "friends_post" AS (
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
        ) AS "user"
      FROM "post" as p
      JOIN "friendship" as f ON (f.user1_id = :currentUserId  AND f.user2_id = p.user_id) OR (f.user2_id = :currentUserId AND f.user1_id = p.user_id)
      LEFT JOIN "user" as u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT :limit OFFSET :offset
    ),
    -- foreach post chosen earlier, get object containing reaction type and number of those reactions to said post
    "post_with_reactions" AS (
      SELECT
        post_id,
        jsonb_object_agg(reaction_type_count.type, reaction_type_count.count) AS reactions
      FROM (
        SELECT fp.id as post_id, r.type, COUNT(r.type) AS count
        FROM "friends_post" as fp
        JOIN "reaction" as r ON fp.id = r.post_id
        GROUP BY fp.id, r.type
      ) AS reaction_type_count
      GROUP BY post_id
    ),
    -- foreach post chosen earlier, get array of comment objects containing details of comment and user who made it
    "post_with_comments" AS (
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
      FROM "friends_post" as fp
      JOIN LATERAL (
        SELECT *
        FROM "comment"
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
    FROM "friends_post" as fp
    LEFT JOIN "post_with_reactions" as pr ON fp.id = pr.post_id
    LEFT JOIN "post_with_comments" as pc ON fp.id = pc.post_id
    ORDER BY fp.created_at DESC
  `;

  const posts = await dbQuery(sql, {
    currentUserId,
    limit,
    offset: calculateOffset(page, limit),
    commentLimit,
  });

  res.json(posts);
}
