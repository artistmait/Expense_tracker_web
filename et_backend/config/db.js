import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// PostgreSQL Connection Pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'expense_tracker',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Mmp234456',
  max: 20, // Max concurrent connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Event listeners for pool monitoring
pool.on('connect', () => {
  // Connected successfully
});

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]:', err.message);
});

// Query helper with query logging in development
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Executed Query] (${duration}ms):`, text.split('\n')[0]);
    }
    return res;
  } catch (err) {
    console.error('[Query Error]:', err.message, '\nQuery:', text);
    throw err;
  }
};

// Health Check Helper
export const checkDbConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW() as now, current_database() as db');
    return {
      connected: true,
      time: res.rows[0].now,
      database: res.rows[0].db,
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message,
    };
  }
};

export default pool;
