import { query } from '../config/db.js';
import { syncBankFeedForUser } from '../services/bankSyncService.js';

// -------------------------------------------------------------
// GET /api/transactions
// List all user transactions with joined category & account data
// -------------------------------------------------------------
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { account_id, category_id, type, limit, search } = req.query;

    let sql = `
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
      WHERE t.user_id = $1 AND t.deleted_at IS NULL
    `;

    const params = [userId];
    let paramIndex = 2;

    if (account_id) {
      sql += ` AND t.account_id = $${paramIndex++}`;
      params.push(account_id);
    }

    if (category_id) {
      sql += ` AND t.category_id = $${paramIndex++}`;
      params.push(category_id);
    }

    if (type) {
      sql += ` AND t.transaction_type = $${paramIndex++}`;
      params.push(type);
    }

    if (search) {
      sql += ` AND (LOWER(t.t_desc) LIKE $${paramIndex} OR LOWER(COALESCE(c.category_name, '')) LIKE $${paramIndex})`;
      params.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    sql += ` ORDER BY t.t_date DESC, t.created_at DESC`;

    if (limit) {
      sql += ` LIMIT $${paramIndex++}`;
      params.push(parseInt(limit, 10));
    }

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      total: result.rows.length,
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

    if (!amount || isNaN(Number(amount))) {
      return res.status(400).json({ success: false, message: 'Valid amount is required.' });
    }

    if (!t_desc || t_desc.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Description is required.' });
    }

    // Default account resolution if not supplied
    let targetAccountId = account_id;
    if (!targetAccountId) {
      const accRes = await query('SELECT id FROM accounts WHERE user_id = $1 LIMIT 1', [userId]);
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

    const numAmount = Math.abs(parseFloat(amount));
    const txType = (transaction_type || 'expense').toLowerCase();
    const dateVal = t_date || new Date().toISOString().split('T')[0];

    const insertSql = `
      INSERT INTO transactions (user_id, account_id, category_id, amount, transaction_type, t_desc, is_reccuring, t_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await query(insertSql, [
      userId,
      targetAccountId,
      category_id || null,
      numAmount,
      txType,
      t_desc.trim(),
      !!is_reccuring,
      dateVal
    ]);

    return res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully.',
      transaction: result.rows[0]
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
// POST /api/transactions/sync
// Trigger bank feed synchronization
// -------------------------------------------------------------
export const syncTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const syncResult = await syncBankFeedForUser(userId);

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
