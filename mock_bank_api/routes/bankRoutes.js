import { Router } from 'express';
import { MOCK_INSTITUTIONS } from '../data/institutions.js';
import { MOCK_BANK_TRANSACTIONS } from '../data/mockBankTransactions.js';

const router = Router();

// In-memory dynamic transactions store for real-time simulation
let liveBankTransactions = [...MOCK_BANK_TRANSACTIONS];

// -------------------------------------------------------------
// GET /api/institutions
// List all supported banking institutions
// -------------------------------------------------------------
router.get('/institutions', (req, res) => {
  res.json({
    success: true,
    total: MOCK_INSTITUTIONS.length,
    institutions: MOCK_INSTITUTIONS.map(inst => ({
      id: inst.id,
      name: inst.name,
      code: inst.code,
      type: inst.type,
      logo_color: inst.logo_color,
      logo_letter: inst.logo_letter,
      accounts_count: inst.accounts.length
    }))
  });
});

// -------------------------------------------------------------
// GET /api/institutions/:id/accounts
// -------------------------------------------------------------
router.get('/institutions/:id/accounts', (req, res) => {
  const inst = MOCK_INSTITUTIONS.find(i => i.id === req.params.id || i.code.toLowerCase() === req.params.id.toLowerCase());
  if (!inst) {
    return res.status(404).json({ success: false, message: 'Institution not found.' });
  }
  res.json({
    success: true,
    institution: inst.name,
    accounts: inst.accounts
  });
});

// -------------------------------------------------------------
// GET /api/accounts
// List all bank accounts across all institutions
// -------------------------------------------------------------
router.get('/accounts', (req, res) => {
  const allAccounts = MOCK_INSTITUTIONS.flatMap(inst =>
    inst.accounts.map(acc => ({
      ...acc,
      institution_id: inst.id,
      institution_name: inst.name,
      institution_logo: inst.logo_color
    }))
  );

  res.json({
    success: true,
    total: allAccounts.length,
    accounts: allAccounts
  });
});

// -------------------------------------------------------------
// GET /api/transactions
// Fetch all transactions or filter by account / date
// -------------------------------------------------------------
router.get('/transactions', (req, res) => {
  const { account_id, type, limit, search } = req.query;

  let filtered = [...liveBankTransactions];

  if (account_id) {
    filtered = filtered.filter(t => t.bank_account_id === account_id);
  }

  if (type) {
    filtered = filtered.filter(t => t.transaction_type === type);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(t =>
      t.merchant.toLowerCase().includes(q) ||
      t.clean_merchant.toLowerCase().includes(q) ||
      t.raw_description.toLowerCase().includes(q)
    );
  }

  if (limit) {
    filtered = filtered.slice(0, parseInt(limit, 10));
  }

  res.json({
    success: true,
    total: filtered.length,
    feed_timestamp: new Date().toISOString(),
    protocol: "OpenBanking-v2.1",
    transactions: filtered
  });
});

// -------------------------------------------------------------
// POST /api/link-account
// Simulate Plaid / Open Banking OAuth handshake
// -------------------------------------------------------------
router.post('/link-account', (req, res) => {
  const { institution_id, account_ids } = req.body;

  const inst = MOCK_INSTITUTIONS.find(i => i.id === institution_id);
  if (!inst) {
    return res.status(404).json({ success: false, message: 'Institution not recognized.' });
  }

  const selectedAccounts = account_ids
    ? inst.accounts.filter(a => account_ids.includes(a.account_id))
    : inst.accounts;

  res.json({
    success: true,
    message: `Successfully linked ${selectedAccounts.length} accounts with ${inst.name}.`,
    sync_token: `mock_sync_tok_${Date.now()}_${inst.code}`,
    institution: inst.name,
    linked_accounts: selectedAccounts
  });
});

// -------------------------------------------------------------
// POST /api/simulate-transaction
// Push a real-time event into the bank feed
// -------------------------------------------------------------
router.post('/simulate-transaction', (req, res) => {
  const { merchant, amount, transaction_type, bank_account_id, category_hint } = req.body;

  const newTx = {
    transaction_id: `tx_live_${Date.now()}`,
    bank_account_id: bank_account_id || "bank_acc_chase_chk_8492",
    account_name: "Chase Sapphire Checking",
    bank_name: "Chase Bank",
    merchant: merchant || "Live Test Merchant",
    clean_merchant: (merchant || "Live Merchant").split(' ')[0],
    raw_description: `LIVE POS SIMULATION ${merchant || 'TRANSACTION'}`,
    amount: parseFloat(amount) || 45.00,
    transaction_type: transaction_type || "expense",
    currency: "USD",
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    suggested_category: category_hint || "Food & Dining",
    category_hint: category_hint || "General",
    status: "settled",
    icon: "CreditCard"
  };

  liveBankTransactions.unshift(newTx);

  res.status(201).json({
    success: true,
    message: 'New transaction simulated in Mock Bank feed.',
    transaction: newTx
  });
});

export default router;
