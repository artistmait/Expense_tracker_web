import { query } from '../config/db.js';

const MOCK_BANK_API_URL = process.env.MOCK_BANK_API_URL || 'http://localhost:5001/api';

// Fallback mock feed if mock bank server is not currently running
const FALLBACK_BANK_FEED = [
  {
    merchant: 'AWS Cloud Infrastructure',
    clean_merchant: 'AWS',
    account_name: 'Chase Sapphire Checking',
    amount: 1420.00,
    transaction_type: 'expense',
    date: '2026-09-19',
    is_recurring: true,
    category_keyword: 'software',
    source: 'Chase Bank'
  },
  {
    merchant: 'Adobe Creative Cloud',
    clean_merchant: 'Adobe Cloud',
    account_name: 'Chase Sapphire Checking',
    amount: 82.99,
    transaction_type: 'expense',
    date: '2026-09-18',
    is_recurring: true,
    category_keyword: 'subscription',
    source: 'Chase Bank'
  },
  {
    merchant: 'WeWork Office Property',
    clean_merchant: 'Office Rent',
    account_name: 'Amex Reserve Platinum',
    amount: 3200.00,
    transaction_type: 'expense',
    date: '2026-09-18',
    is_recurring: true,
    category_keyword: 'housing',
    source: 'American Express'
  },
  {
    merchant: 'Starbucks Reserve Roastery',
    clean_merchant: 'Starbucks',
    account_name: 'Amex Reserve Platinum',
    amount: 24.50,
    transaction_type: 'expense',
    date: '2026-09-17',
    is_recurring: false,
    category_keyword: 'food',
    source: 'American Express'
  },
  {
    merchant: 'Tech Global Payroll Direct Deposit',
    clean_merchant: 'Tech Global Inc.',
    account_name: 'Chase Sapphire Checking',
    amount: 8420.00,
    transaction_type: 'income',
    date: '2026-09-15',
    is_recurring: true,
    category_keyword: 'salary',
    source: 'Chase Bank'
  },
  {
    merchant: 'Whole Foods Market',
    clean_merchant: 'Whole Foods Market',
    account_name: 'Amex Reserve Platinum',
    amount: 142.80,
    transaction_type: 'expense',
    date: '2026-09-14',
    is_recurring: false,
    category_keyword: 'groceries',
    source: 'American Express'
  },
  {
    merchant: 'NVIDIA Dividend Corp',
    clean_merchant: 'NVIDIA Corp.',
    account_name: 'Primary Wealth Vault',
    amount: 340.50,
    transaction_type: 'income',
    date: '2026-09-12',
    is_recurring: true,
    category_keyword: 'investment',
    source: 'Vanguard'
  },
  {
    merchant: 'Equinox Fitness Club',
    clean_merchant: 'Equinox Club',
    account_name: 'Chase Sapphire Checking',
    amount: 280.00,
    transaction_type: 'expense',
    date: '2026-09-10',
    is_recurring: true,
    category_keyword: 'health',
    source: 'Chase Bank'
  }
];

export const syncBankFeedForUser = async (userId) => {
  try {
    // 1. Fetch live bank transactions from Mock Bank Service (with timeout fallback)
    let bankTransactions = [];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${MOCK_BANK_API_URL}/transactions`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        bankTransactions = data.transactions || [];
        console.log(`[BankSyncService] Pulled ${bankTransactions.length} items from Mock Bank API service.`);
      }
    } catch (fetchErr) {
      console.log('[BankSyncService] Mock bank API offline, utilizing fallback mock bank engine:', fetchErr.message);
      bankTransactions = FALLBACK_BANK_FEED;
    }

    if (bankTransactions.length === 0) {
      bankTransactions = FALLBACK_BANK_FEED;
    }

    // 2. Fetch or ensure user accounts in PostgreSQL
    const existingAccountsRes = await query('SELECT id, account_name FROM accounts WHERE user_id = $1', [userId]);
    let userAccounts = existingAccountsRes.rows;

    if (userAccounts.length === 0) {
      // Create primary default accounts if user has none
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

    const findCategoryMatch = (merchantName, txType) => {
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

    // 4. Upsert transactions into PostgreSQL
    let syncedCount = 0;

    for (const tx of bankTransactions) {
      const merchantName = tx.clean_merchant || tx.merchant;
      const amount = Math.abs(parseFloat(tx.amount));
      const txType = tx.transaction_type || (amount > 5000 ? 'income' : 'expense');
      const txDate = tx.date || new Date().toISOString().split('T')[0];
      const isRecurring = !!tx.is_recurring;
      const rawDesc = tx.raw_description || `${merchantName} synced from bank feed`;

      // Match account or use first available
      const matchedAccount = userAccounts.find(a => 
        a.account_name.toLowerCase().includes((tx.account_name || '').toLowerCase())
      ) || userAccounts[0];

      const categoryId = findCategoryMatch(merchantName, txType);

      // Check if already inserted (duplicate prevention)
      const existingCheck = await query(
        `SELECT id FROM transactions 
         WHERE user_id = $1 AND account_id = $2 AND amount = $3 AND t_date = $4 AND t_desc = $5`,
        [userId, matchedAccount.id, amount, txDate, rawDesc]
      );

      if (existingCheck.rows.length === 0) {
        await query(
          `INSERT INTO transactions (user_id, account_id, category_id, amount, transaction_type, t_desc, is_reccuring, t_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [userId, matchedAccount.id, categoryId, amount, txType, rawDesc, isRecurring, txDate]
        );
        syncedCount++;
      }
    }

    return {
      success: true,
      syncedCount,
      totalBankRecords: bankTransactions.length,
      syncedAt: new Date().toISOString()
    };
  } catch (err) {
    console.error('[BankSyncService Error]:', err);
    throw err;
  }
};
