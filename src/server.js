import { app } from './app.js';

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});

// ping supabase on server startup and every 6 days to prevent shutdown
await sql`SELECT 1`.execute(db);
setInterval(
  async () => await sql`SELECT 1`.execute(db),
  1000 * 60 * 60 * 24 * 6,
);
