import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../auth/authRoutes.js';
import accountRoutes from '../accounts/accountRoutes.js';
import transactionRoutes from '../transactions/transactionRoutes.js';
import categoryRoutes from '../categories/categoryRoutes.js';
import budgetRoutes from '../budgets/budgetRoutes.js';
import advisorRoutes from '../advisor/advisorRoutes.js';
import { checkDbConnection } from '../config/db.js';
import { initializeDatabase } from '../config/initDb.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// SECURITY (audit fix #5): allowlist the browser origins that may call this API
// instead of reflecting every origin. Wildcard + credentials is never valid CORS.
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:4173,http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow same-origin / curl / server-to-server calls with no Origin header
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false); // do not echo disallowed origins (no CORS headers)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
};

// SECURITY (audit fix #6): basic rate limiting.
// Strict on credential endpoints (brute-force), generous on the rest of the API.
let rateLimit;
try {
  const rateLimitPkg = await import('express-rate-limit');
  rateLimit = rateLimitPkg.default;
} catch {
  console.warn('[Config] express-rate-limit not installed — running WITHOUT rate limiting.');
}
const rateLimiter = (opts) => (req, res, next) =>
  rateLimit ? rateLimit(opts)(req, res, next) : next();

const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' },
});

const apiLimiter = rateLimiter({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});

// Global Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging middleware in development
app.use((req, res, next) => {
  if (!isProd && process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Root & Health Check Routes (health exempt from rate limits for monitors)
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'BudgetMate API Server',
    version: '1.1.0',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        profile: 'PUT /api/auth/profile',
      },
      accounts: 'GET, POST /api/accounts',
      transactions: {
        list: 'GET /api/transactions',
        create: 'POST /api/transactions',
        syncBank: 'POST /api/transactions/sync',
        updateCategory: 'PUT /api/transactions/:id/category',
      },
      categories: 'GET, POST /api/categories',
      budgets: 'GET /api/budgets, GET /api/budgets/progress, POST /api/budgets',
      recommendations: 'GET /api/recommendations, POST /api/recommendations/generate',
    },
  });
});

app.get('/api/health', async (req, res) => {
  const dbStatus = await checkDbConnection();
  res.status(dbStatus.connected ? 200 : 503).json({
    status: dbStatus.connected ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// -------------------------------------------------------------
// Mount Route Modules (auth gets the strict limiter, rest get API limiter)
// -------------------------------------------------------------
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/accounts', apiLimiter, accountRoutes);
app.use('/api/transactions', apiLimiter, transactionRoutes);
app.use('/api/categories', apiLimiter, categoryRoutes);
app.use('/api/budgets', apiLimiter, budgetRoutes);
app.use('/api/recommendations', apiLimiter, advisorRoutes);

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err.stack || err);
  // SECURITY: never leak internal error messages (Postgres details etc.) in production
  res.status(err.status || 500).json({
    success: false,
    message: isProd ? 'Internal Server Error' : (err.message || 'Internal Server Error'),
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

// Start Server and optionally initialize DB tables
const startServer = async () => {
  try {
    // Check DB Connection on boot
    const dbStatus = await checkDbConnection();
    if (dbStatus.connected) {
      console.log(`[Database] ✅ Connected to PostgreSQL database "${dbStatus.database}".`);
      // Auto-run schema initialization so tables exist immediately
      try {
        await initializeDatabase();
      } catch (schemaErr) {
        console.warn('[Database] Note on schema initialization:', schemaErr.message);
      }
    } else {
      console.warn(`[Database] ⚠️ Could not connect to PostgreSQL: ${dbStatus.error}`);
      console.warn(`[Database] Please ensure PostgreSQL is running and credentials in .env are correct.`);
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 BudgetMate Server running on http://localhost:${PORT}`);
      console.log(`📋 Modules mounted: /api/auth, /api/accounts, /api/transactions, /api/categories, /api/budgets, /api/recommendations`);
      console.log(`🌐 CORS allowlist: ${allowedOrigins.join(', ')}\n`);
    });
  } catch (err) {
    console.error('[Server Start Error]:', err);
    process.exit(1);
  }
};

// Skip auto-start under test so the boot smoke test can import the app
// without binding a port or touching the database.
if (process.env.NODE_ENV === 'test') {
  console.log('[Server] NODE_ENV=test — skipping auto-start.');
} else {
  startServer();
}

export default app;
