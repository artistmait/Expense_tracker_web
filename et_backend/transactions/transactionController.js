import { query } from '../config/db.js';
import { syncBankFeedForUser } from '../services/bankSyncService.js';
import { checkBudgetAlerts } from '../budgets/budgetAlertService.js';

// -------------------------------------------------------------
// GET /api/transactions
// List user transactions with joined category & account data,
// supporting full-text search, multi-attribute filtering & server pagination
// -------------------------------------------------------------
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      account_id,
      category_id,
      type,
      start_date,
      end_date,
      min_amount,
      max_amount,
      search,
      page = 1,
      limit = 20,
      sort_by = 't_date',
      sort_order = 'DESC'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    // Base filter condition
    let whereClauses = ['t.user_id = $1', 't.deleted_at IS NULL'];
    const params = [userId];
    let paramIndex = 2;

    // Multi-account filter (support comma-separated or single)
    if (account_id) {
      const accountIds = account_id.includes(',')
        ? account_id.split(',').map(s => s.trim()).filter(Boolean)
        : [account_id.trim()];
      if (accountIds.length === 1) {
        whereClauses.push(`t.account_id = $${paramIndex++}`);
        params.push(accountIds[0]);
      } else if (accountIds.length > 1) {
        whereClauses.push(`t.account_id = ANY($${paramIndex++}::uuid[])`);
        params.push(accountIds);
      }
    }

    // Multi-category filter (support comma-separated or single)
    if (category_id) {
      const categoryIds = category_id.includes(',')
        ? category_id.split(',').map(s => s.trim()).filter(Boolean)
        : [category_id.trim()];
      if (categoryIds.length === 1) {
        whereClauses.push(`t.category_id = $${paramIndex++}`);
        params.push(categoryIds[0]);
      } else if (categoryIds.length > 1) {
        whereClauses.push(`t.category_id = ANY($${paramIndex++}::uuid[])`);
        params.push(categoryIds);
      }
    }

    // Transaction Type (expense, income, transfer, or multiple)
    if (type) {
      const types = type.includes(',')
        ? type.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
        : [type.trim().toLowerCase()];
      if (types.length === 1 && types[0] !== 'all') {
        whereClauses.push(`t.transaction_type = $${paramIndex++}`);
        params.push(types[0]);
      } else if (types.length > 1) {
        whereClauses.push(`t.transaction_type = ANY($${paramIndex++}::varchar[])`);
        params.push(types);
      }
    }

    // Date range filter
    if (start_date) {
      whereClauses.push(`t.t_date >= $${paramIndex++}`);
      params.push(start_date);
    }
    if (end_date) {
      whereClauses.push(`t.t_date <= $${paramIndex++}`);
      params.push(end_date);
    }

    // Amount range filter
    if (min_amount !== undefined && min_amount !== '') {
      const minNum = parseFloat(min_amount);
      if (!isNaN(minNum)) {
        whereClauses.push(`t.amount >= $${paramIndex++}`);
        params.push(minNum);
      }
    }
    if (max_amount !== undefined && max_amount !== '') {
      const maxNum = parseFloat(max_amount);
      if (!isNaN(maxNum)) {
        whereClauses.push(`t.amount <= $${paramIndex++}`);
        params.push(maxNum);
      }
    }

    // Full-text search across description, merchant, category, account
    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      whereClauses.push(`(
        LOWER(t.t_desc) LIKE $${paramIndex}
        OR LOWER(COALESCE(c.category_name, '')) LIKE $${paramIndex}
        OR LOWER(a.account_name) LIKE $${paramIndex}
      )`);
      params.push(q);
      paramIndex++;
    }

    const whereString = whereClauses.join(' AND ');

    // 1. Count query for total pagination
    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE ${whereString}
    `;
    const countResult = await query(countSql, params);
    const total = countResult.rows[0]?.total || 0;

    // 2. Data query with safe sort and pagination
    const validSortFields = {
      t_date: 't.t_date',
      amount: 't.amount',
      created_at: 't.created_at',
      t_desc: 't.t_desc'
    };
    const sortColumn = validSortFields[sort_by] || 't.t_date';
    const orderDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const dataParams = [...params, limitNum, offset];
    const dataSql = `
      SELECT 
        t.id,
        t.amount,
        t.transaction_type,
        t.t_desc,
        t.is_reccuring,
        t.t_date,
        t.created_at,
        t.updated_at,
        a.id AS account_id,
        a.account_name,
        a.account_type,
        a.currency,
        c.id AS category_id,
        COALESCE(c.category_name, 'Uncategorized') AS category_name,
        COALESCE(c.cat_icon, 'Tag') AS cat_icon,
        COALESCE(c.cat_colour, '#4382DF') AS cat_colour
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE ${whereString}
      ORDER BY ${sortColumn} ${orderDirection}, t.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const result = await query(dataSql, dataParams);
    const totalPages = Math.ceil(total / limitNum) || 1;

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      transactions: result.rows
    });
  } catch (err) {
    console.error('[GetTransactions Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch transactions.' });
  }
};

// -------------------------------------------------------------
// POST /api/transactions
// Manual entry creation on dashboard
// -------------------------------------------------------------
export const createTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      account_id,
      category_id,
      amount,
      transaction_type,
      t_desc,
      is_reccuring,
      t_date
    } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required.' });
    }
    if (Number(amount) > 10000000000) {
      return res.status(400).json({ success: false, message: 'Amount exceeds the maximum allowed value.' });
    }

    if (!t_desc || t_desc.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Description is required.' });
    }

    // FIX #9 (audit): validate transaction_type and date format server-side.
    const VALID_TYPES = new Set(['expense', 'income', 'transfer']);
    const txType = (transaction_type || 'expense').toLowerCase();
    if (!VALID_TYPES.has(txType)) {
      return res.status(400).json({ success: false, message: 'transaction_type must be expense, income or transfer.' });
    }
    const dateVal = t_date || new Date().toISOString().split('T')[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateVal) || isNaN(Date.parse(dateVal))) {
      return res.status(400).json({ success: false, message: 't_date must be a valid date in YYYY-MM-DD format.' });
    }

    // FIX #9 (audit): ownership validation. The client may send display strings
    // or other users' ids as account_id/category_id — both are now rejected or
    // resolved server-side instead of being trusted and hitting Postgres casts.
    let targetAccountId = null;
    if (account_id) {
      if (!/^\d{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(account_id)) {
        return res.status(400).json({ success: false, message: 'account_id must be a valid UUID.' });
      }
      const ownedAcc = await query('SELECT id FROM accounts WHERE id = $1 AND user_id = $2', [account_id, userId]);
      if (ownedAcc.rows.length === 0) {
        return res.status(403).json({ success: false, message: 'Selected account does not exist or is not yours.' });
      }
      targetAccountId = account_id;
    }
    if (!targetAccountId) {
      const accRes = await query('SELECT id FROM accounts WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1', [userId]);
      if (accRes.rows.length > 0) {
        targetAccountId = accRes.rows[0].id;
      } else {
        const newAcc = await query(
          `INSERT INTO accounts (user_id, account_name, account_type, initial_balance, currency)
           VALUES ($1, 'Main Checking', 'checking', 0.00, 'USD') RETURNING id`,
          [userId]
        );
        targetAccountId = newAcc.rows[0].id;
      }
    }

    let targetCategoryId = null;
    if (category_id) {
      if (!/^\d{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category_id)) {
        return res.status(400).json({ success: false, message: 'category_id must be a valid UUID.' });
      }
      const ownedCat = await query(
        'SELECT id FROM categories WHERE id = $1 AND (is_system = true OR user_id = $2)',
        [category_id, userId]
      );
      if (ownedCat.rows.length === 0) {
        return res.status(403).json({ success: false, message: 'Selected category does not exist or is not yours.' });
      }
      targetCategoryId = category_id;
    }

    const numAmount = Math.abs(parseFloat(amount));

    const insertSql = `
      INSERT INTO transactions (user_id, account_id, category_id, amount, transaction_type, t_desc, is_reccuring, t_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await query(insertSql, [
      userId,
      targetAccountId,
      targetCategoryId,
      numAmount,
      txType,
      t_desc.trim(),
      !!is_reccuring,
      dateVal
    ]);

    const savedTx = result.rows[0];

    // BLOCK 2.1c: Check budget thresholds after expense is saved
    let budgetAlerts = [];
    if (txType === 'expense' && savedTx.category_id) {
      budgetAlerts = await checkBudgetAlerts(userId, savedTx.category_id, savedTx.t_date);
    }

    return res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully.',
      transaction: savedTx,
      budget_alerts: budgetAlerts,
    });
  } catch (err) {
    console.error('[CreateTransaction Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to record transaction.' });
  }
};

// -------------------------------------------------------------
// PUT /api/transactions/:id/category
// Manually re-assign / arrange category on dashboard
// -------------------------------------------------------------
export const updateTransactionCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { category_id } = req.body;

    if (!category_id) {
      return res.status(400).json({ success: false, message: 'Category ID is required.' });
    }

    // Verify category exists
    const catCheck = await query(
      'SELECT id, category_name FROM categories WHERE id = $1 AND (is_system = true OR user_id = $2)',
      [category_id, userId]
    );
    if (catCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Selected category does not exist.' });
    }

    // Update transaction
    const updateSql = `
      UPDATE transactions
      SET category_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING id, category_id, updated_at
    `;
    const result = await query(updateSql, [category_id, id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `Category updated to "${catCheck.rows[0].category_name}".`,
      transaction: result.rows[0]
    });
  } catch (err) {
    console.error('[UpdateCategory Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to update transaction category.' });
  }
};

// -------------------------------------------------------------
// PUT /api/transactions/:id
// Full update of transaction fields
// -------------------------------------------------------------
export const updateTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      account_id,
      category_id,
      amount,
      transaction_type,
      t_desc,
      is_reccuring,
      t_date
    } = req.body;

    const check = await query(
      'SELECT id, account_id, category_id, amount, transaction_type, t_desc, is_reccuring, t_date FROM transactions WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [id, userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    const current = check.rows[0];
    const newAmount = amount !== undefined && !isNaN(Number(amount)) ? Math.abs(parseFloat(amount)) : current.amount;
    const newType = transaction_type ? transaction_type.toLowerCase() : current.transaction_type;
    const newDesc = t_desc !== undefined && t_desc.trim().length > 0 ? t_desc.trim() : current.t_desc;
    const newAccountId = account_id || current.account_id;
    const newCategoryId = category_id !== undefined ? (category_id || null) : current.category_id;
    const newDate = t_date || current.t_date;
    const newRecurring = is_reccuring !== undefined ? !!is_reccuring : current.is_reccuring;

    const updateSql = `
      UPDATE transactions
      SET 
        amount = $1,
        transaction_type = $2,
        t_desc = $3,
        account_id = $4,
        category_id = $5,
        t_date = $6,
        is_reccuring = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8 AND user_id = $9
      RETURNING *
    `;

    await query(updateSql, [
      newAmount,
      newType,
      newDesc,
      newAccountId,
      newCategoryId,
      newDate,
      newRecurring,
      id,
      userId
    ]);

    const rowRes = await query(
      `SELECT 
        t.id, t.amount, t.transaction_type, t.t_desc, t.is_reccuring, t.t_date,
        t.created_at, t.updated_at,
        a.id AS account_id, a.account_name, a.account_type, a.currency,
        c.id AS category_id,
        COALESCE(c.category_name, 'Uncategorized') AS category_name,
        COALESCE(c.cat_icon, 'Tag') AS cat_icon,
        COALESCE(c.cat_colour, '#4382DF') AS cat_colour
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = $1 AND t.user_id = $2`,
      [id, userId]
    );

    const updatedTx = rowRes.rows[0];

    // BLOCK 2.1c: Re-check budget thresholds after update
    let budgetAlerts = [];
    if (updatedTx?.transaction_type === 'expense' && updatedTx?.category_id) {
      budgetAlerts = await checkBudgetAlerts(userId, updatedTx.category_id, updatedTx.t_date);
    }

    return res.status(200).json({
      success: true,
      message: 'Transaction updated successfully.',
      transaction: updatedTx,
      budget_alerts: budgetAlerts,
    });
  } catch (err) {
    console.error('[UpdateTransaction Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to update transaction.' });
  }
};

// -------------------------------------------------------------
// POST /api/transactions/sync
// Trigger bank feed synchronization
// -------------------------------------------------------------
export const syncTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const syncResult = await syncBankFeedForUser(userId);

    // FIX #8 (audit): be honest when the upstream bank feed is unavailable
    // instead of reporting a completed sync.
    if (syncResult.success === false) {
      return res.status(200).json({
        success: false,
        message: syncResult.message || 'Bank feed unavailable. No transactions were imported.',
        syncStats: syncResult,
        transactions: []
      });
    }

    // Fetch refreshed transaction list
    const refreshed = await query(
      `SELECT 
        t.id, t.amount, t.transaction_type, t.t_desc, t.is_reccuring, t.t_date,
        a.account_name, a.currency,
        COALESCE(c.category_name, 'General') AS category_name,
        COALESCE(c.cat_icon, 'Tag') AS cat_icon,
        COALESCE(c.cat_colour, '#4382DF') AS cat_colour
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1 AND t.deleted_at IS NULL
      ORDER BY t.t_date DESC, t.created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: `Sync completed: ${syncResult.syncedCount} new records processed.`,
      syncStats: syncResult,
      transactions: refreshed.rows
    });
  } catch (err) {
    console.error('[SyncTransactions Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to sync bank transactions.' });
  }
};

// -------------------------------------------------------------
// DELETE /api/transactions/:id
// Soft delete transaction
// -------------------------------------------------------------
export const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await query(
      'UPDATE transactions SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    return res.status(200).json({ success: true, message: 'Transaction deleted.' });
  } catch (err) {
    console.error('[DeleteTransaction Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete transaction.' });
  }
};
