import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bankRoutes from '../routes/bankRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Global Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[MockBankAPI] ${req.method} ${req.originalUrl}`);
  next();
});

// Root & Health check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'BudgetMate Mock Banking Service',
    protocol: 'OpenBanking / Plaid API Simulator v2.1',
    port: PORT,
    endpoints: {
      institutions: 'GET /api/institutions',
      accounts: 'GET /api/accounts',
      transactions: 'GET /api/transactions',
      linkAccount: 'POST /api/link-account',
      simulateTx: 'POST /api/simulate-transaction'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'mock-bank-api'
  });
});

// Mount Bank API Routes
app.use('/api', bankRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🏦 Mock Bank API running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   - GET  http://localhost:${PORT}/api/institutions`);
  console.log(`   - GET  http://localhost:${PORT}/api/accounts`);
  console.log(`   - GET  http://localhost:${PORT}/api/transactions`);
  console.log(`   - POST http://localhost:${PORT}/api/link-account`);
  console.log(`   - POST http://localhost:${PORT}/api/simulate-transaction\n`);
});

export default app;
