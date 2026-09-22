import { query, pool } from '../config/db.js';

const MOCK_BANK_API_URL = process.env.MOCK_BANK_API_URL || 'http://localhost:5001/api';

export const syncBankFeedForUser = async (userId) => {
  // 1. Fetch live bank transactions from Mock Bank Service (with timeout fallback)
  let bankTransactions = [];
  let dataSource = 'mock_bank_api';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    // Forward the account email so the mock bank can serve persona-scoped
    // demo feeds (et_backend demo users get a feed matching their story).
    const ownerEmail = (await query('SELECT email FROM users WHERE id = $1', [userId])).rows[0]?.email;
    const res = await fetch(`${MOCK_BANK_API_URL}/transactions`, {
      signal: controller.signal,
      headers: { 'x-demo-user': ownerEmail || '' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      bankTransactions = data.transactions || [];
      console.log(`[BankSyncService] Pulled ${bankTransactions.length} items from Mock Bank API service.`);
    }
  } catch (fetchErr) {
    console.log('[BankSyncService] Mock bank API offline:', fetchErr.message);
  }

  // FIX #8 (audit): the old code silently injected hardcoded fabricated
  // transactions into the user's real ledger when the bank API was offline.
  // Honest behavior: report the feed as unavailable instead of inventing data.
  if (bankTransactions.length === 0) {
    return {
      success: false,
      syncedCount: 0,
      totalBankRecords: 0,
      syncedAt: new Date().toISOString(),
      dataSource: 'unavailable',
      message: 'Bank feed unavailable. No transactions were imported.',
    };
  }

  // 2. Fetch or ensure user accounts in PostgreSQL
  const existingAccountsRes = await query('SELECT id, account_name FROM accounts WHERE user_id = $1', [userId]);
  let userAccounts = existingAccountsRes.rows;

  if (userAccounts.length === 0) {
    // Create primary default account if user has none
    const createdAcc = await query(
      `INSERT INTO accounts (user_id, account_name, account_type, initial_balance, currency, is_active)
       VALUES ($1, 'Chase Sapphire Checking', 'checking', 8420.00, 'USD', true)
       RETURNING id, account_name`,
      [userId]
    );
    userAccounts = [createdAcc.rows[0]];
  }

  // 3. Fetch all system and user categories from PostgreSQL
  const categoriesRes = await query(
    'SELECT id, category_name, category_type FROM categories WHERE is_system = true OR user_id = $1',
    [userId]
  );
  const categories = categoriesRes.rows;

  const findCategoryMatch = (merchantName, txType, tx = {}) => {
    // Trust an exact suggested_category from the feed before keyword guessing
    // (Plaid-style feeds provide normalized category names).
    const hint = String(tx.suggested_category || '').trim();
    if (hint) {
      const byHint = categories.find(
        (c) => c.category_name.toLowerCase() === hint.toLowerCase()
      );
      if (byHint) return byHint.id;
    }
    const nameLower = (merchantName || '').toLowerCase();

    if (nameLower.includes('aws') || nameLower.includes('adobe') || nameLower.includes('openai') || nameLower.includes('subscription')) {
      return categories.find(c => c.category_name.toLowerCase().includes('tech') || c.category_name.toLowerCase().includes('subscription'))?.id;
    }
    if (nameLower.includes('rent') || nameLower.includes('housing') || nameLower.includes('wework') || nameLower.includes('utility')) {
      return categories.find(c => c.category_name.toLowerCase().includes('housing'))?.id;
    }
    if (nameLower.includes('starbucks') || nameLower.includes('restaurant') || nameLower.includes('cafe') || nameLower.includes('dining')) {
      return categories.find(c => c.category_name.toLowerCase().includes('food'))?.id;
    }
    if (nameLower.includes('whole foods') || nameLower.includes('grocer') || nameLower.includes('market')) {
      return categories.find(c => c.category_name.toLowerCase().includes('groceries'))?.id;
    }
    if (nameLower.includes('salary') || nameLower.includes('payroll') || nameLower.includes('deposit')) {
      return categories.find(c => c.category_name.toLowerCase().includes('salary'))?.id;
    }
    if (nameLower.includes('dividend') || nameLower.includes('nvidia') || nameLower.includes('stock') || nameLower.includes('invest')) {
      return categories.find(c => c.category_name.toLowerCase().includes('investment'))?.id;
    }
    if (nameLower.includes('equinox') || nameLower.includes('fitness') || nameLower.includes('health') || nameLower.includes('gym')) {
      return categories.find(c => c.category_name.toLowerCase().includes('health'))?.id;
    }
    if (nameLower.includes('delta') || nameLower.includes('flight') || nameLower.includes('travel') || nameLower.includes('leisure')) {
      return categories.find(c => c.category_name.toLowerCase().includes('entertainment'))?.id;
    }

    // Default category fallback based on transaction type
    const matchType = categories.find(c => c.category_type === txType);
    return matchType ? matchType.id : (categories[0]?.id || null);
  };

  // FIX #8 (audit): batch all inserts inside ONE transaction instead of a
  // per-row SELECT dup-check + INSERT (N+1). Idempotency is enforced by the
  // uq_bank_sync_tx partial unique index via ON CONFLICT DO NOTHING, so a
  // partial failure rolls back atomically and re-syncs stay duplicate-free.
  const client = await pool.connect();
  let syncedCount = 0;
  try {
    await client.query('BEGIN');

    for (const tx of bankTransactions) {
      const merchantName = tx.clean_merchant || tx.merchant;
      const amount = Math.abs(parseFloat(tx.amount));
      if (!isFinite(amount) || amount <= 0) continue; // skip malformed feed rows
      const txType = tx.transaction_type || 'expense';
      const txDate = /^\d{4}-\d{2}-\d{2}$/.test(tx.date || '') ? tx.date : new Date().toISOString().split('T')[0];
      const isRecurring = !!tx.is_recurring;
      const rawDesc = String(tx.raw_description || `${merchantName} synced from bank feed`).slice(0, 255);

      // Match account or use first available
      const matchedAccount = userAccounts.find(a =>
        a.account_name.toLowerCase().includes((tx.account_name || '').toLowerCase())
      ) || userAccounts[0];

      const categoryId = findCategoryMatch(merchantName, txType, tx);

      const insertRes = await client.query(
        `INSERT INTO transactions (user_id, account_id, category_id, amount, transaction_type, t_desc, is_reccuring, t_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (user_id, account_id, amount, t_date, t_desc) WHERE deleted_at IS NULL
         DO NOTHING
         RETURNING id`,
        [userId, matchedAccount.id, categoryId, amount, txType, rawDesc, isRecurring, txDate]
      );
      if (insertRes.rows.length > 0) {
        syncedCount++;
      }
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return {
    success: true,
    syncedCount,
    totalBankRecords: bankTransactions.length,
    syncedAt: new Date().toISOString(),
    dataSource,
  };
};
