import { query } from '../config/db.js';

export const getUserAccounts = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await query(
      'SELECT id, account_name, account_type, initial_balance, currency, is_active, created_at FROM accounts WHERE user_id = $1 ORDER BY created_at ASC',
      [userId]
    );
    return res.status(200).json({
      success: true,
      accounts: result.rows,
    });
  } catch (err) {
    console.error('[GetAccounts Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch accounts.' });
  }
};

export const createAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { account_name, account_type, initial_balance, currency } = req.body;

    if (!account_name || account_name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Account name is required.' });
    }

    const insertSql = `
      INSERT INTO accounts (user_id, account_name, account_type, initial_balance, currency, is_active)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING id, account_name, account_type, initial_balance, currency, is_active, created_at
    `;
    const result = await query(insertSql, [
      userId,
      account_name.trim(),
      (account_type || 'checking').trim().toLowerCase(),
      parseFloat(initial_balance) || 0.00,
      (currency || 'USD').trim().toUpperCase(),
    ]);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      account: result.rows[0],
    });
  } catch (err) {
    console.error('[CreateAccount Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to create account.' });
  }
};
