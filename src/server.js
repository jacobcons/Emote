import { app } from './app.js';
import { dbQuery } from './utils/dbQueries.utils.js';

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});

// ping supabase on server startup and every day to prevent shutdown
await dbQuery('SELECT 1');
setInterval(async () => await dbQuery('SELECT 1'), 1000 * 60 * 60 * 24);
