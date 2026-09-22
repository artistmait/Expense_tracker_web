import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runSqlFile = async (filePath, label) => {
  const sql = fs.readFileSync(filePath, 'utf8');
  await pool.query(sql);
  console.log(`[DB Initialization] ✅ ${label} applied.`);
};

export const initializeDatabase = async () => {
  console.log('[DB Initialization] Connecting to PostgreSQL database...');
  try {
    // 1. Structure (tables, indexes, extensions) — always
    await runSqlFile(path.join(__dirname, 'schema.sql'), 'Schema');

    // 2. System categories — always (safe, required by every user)
    await runSqlFile(path.join(__dirname, 'seedSystem.sql'), 'System category seed');

    // 3. SECURITY (audit fix #4): demo users/accounts/budgets with known
    // passwords must never be seeded into a production database.
    if (process.env.NODE_ENV === 'production') {
      console.log('[DB Initialization] Skipping demo seed (NODE_ENV=production).');
    } else {
      await runSqlFile(path.join(__dirname, 'seedDemo.sql'), 'Demo seed (non-production)');
    }

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
