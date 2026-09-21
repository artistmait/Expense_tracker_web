import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../auth/authRoutes.js';
import accountRoutes from '../accounts/accountRoutes.js';
import transactionRoutes from '../transactions/transactionRoutes.js';
import categoryRoutes from '../categories/categoryRoutes.js';
import budgetRoutes from '../budgets/budgetRoutes.js';
import { checkDbConnection } from '../config/db.js';
import { initializeDatabase } from '../config/initDb.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middlewares
app.use(cors({
  origin: '*', // Allow frontend Vite client (e.g. http://localhost:5173)
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware in development
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Root & Health Check Routes
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'BudgetMate API Server',
    version: '1.0.0',
    documentation: '/api/docs',
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
// Mount Route Modules
// -------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);

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
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
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
      console.log(`📋 Modules mounted: /api/auth, /api/accounts, /api/transactions, /api/categories\n`);
    });
  } catch (err) {
    console.error('[Server Start Error]:', err);
    process.exit(1);
  }
};

startServer();

export default app;
