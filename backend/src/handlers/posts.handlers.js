import { knex } from '../db/connection.js';
import { checkResourceExists } from '../utils/errors.utils.js';
import { FRIENDSHIP_STATUS } from '../constants.js';
import { calculateOffset, dbQuery } from '../utils/dbQueries.utils.js';

export async function getFriendsPosts(req, res) {
  const currentUserId = req.user.id;
  const { page = 1, limit = 10 } = req.query;

  const sql = `
    WITH "reaction_counts" AS (
      SELECT post_id, type, COUNT(type) AS reaction_count
      FROM reaction
      GROUP BY post_id, type
    ),
    "post_with_reactions" AS (
      SELECT
          post_id,
          COALESCE(jsonb_object_agg(rc.type, rc.reaction_count) FILTER (WHERE rc.type IS NOT NULL), '{}') AS reactions
      FROM "reaction_counts" as rc
      GROUP BY post_id
    ),
    "post_with_comments" AS (
      SELECT
        jsonb_object_agg(c.text, c.user_id) AS comments
      FROM "comment" as c 
      GROUP BY post_id
    )
    SELECT *
    FROM "post" as p
    JOIN "post_with_reactions" as pr
      ON p.id = pr.post_id
    LEFT JOIN "post_with_comments" as pc
      ON p.id = pc.post_id
  `;
  const posts = await dbQuery(sql, {
    currentUserId,
    limit,
    offset: calculateOffset(page, limit),
  });

  // json_build_object(
  //   'id', u.id,
  //   'name', u.name,
  //   'profile_image', u.profile_image
  // ) as user

  res.json(posts);
}
