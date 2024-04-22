function up(knex) {
  return knex.raw(`
    CREATE INDEX idx_friendship_user1_id ON friendship (user1_id);
    CREATE INDEX idx_friendship_user2_id ON friendship (user2_id);
    CREATE INDEX idx_friend_request_sender_id ON friend_request (sender_id);
    CREATE INDEX idx_friend_request_receiver_id ON friend_request (receiver_id);
    CREATE INDEX idx_post_user_id ON post (user_id);
    CREATE INDEX idx_post_created_at ON post (created_at);
    CREATE INDEX idx_comment_user_id ON comment (user_id);
    CREATE INDEX idx_comment_post_id ON comment (post_id);
    CREATE INDEX idx_comment_created_at ON comment (created_at);
  `);
}

function down(knex) {
  return knex.raw(`
    DROP INDEX IF EXISTS idx_friendship_user1_id;
    DROP INDEX IF EXISTS idx_friendship_user2_id;
    DROP INDEX IF EXISTS idx_friend_request_sender_id;
    DROP INDEX IF EXISTS idx_friend_request_receiver_id;
    DROP INDEX IF EXISTS idx_post_created_at;
    DROP INDEX IF EXISTS idx_comment_user_id;
    DROP INDEX IF EXISTS idx_comment_post_id;
    DROP INDEX IF EXISTS idx_comment_created_at;
  `);
}

export { up, down };
