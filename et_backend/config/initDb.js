import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const initializeDatabase = async () => {
  console.log('[DB Initialization] Connecting to PostgreSQL database...');
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(schemaSql);
    console.log('[DB Initialization] ✅ PostgreSQL tables and indexes created successfully.');
    return { success: true };
  } catch (err) {
    console.error('[DB Initialization Error]:', err.message);
    throw err;
  }
};

// If run directly via `node config/initDb.js` or `npm run db:init`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase()
    .then(() => {
      console.log('[DB Initialization] Finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[DB Initialization Failed]:', err);
      process.exit(1);
    });
}
