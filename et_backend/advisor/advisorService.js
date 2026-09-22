import { query } from '../config/db.js';
import { runAdvisorRules } from './ruleEngine.js';

/**
 * Gathers user spending metrics and runs the pluggable rule engine.
 * Upserts insights into the PostgreSQL recommendations table.
 * Respects dismissals: dismissed insights do not reappear until condition_key changes.
 */
export const evaluateAndPersistRecommendations = async (userId) => {
  try {
    // 1. Fetch user accounts for liquid reserves
    const accountsRes = await query(
      `SELECT account_name, account_type, initial_balance FROM accounts WHERE user_id = $1 AND is_active = true`,
      [userId]
    );
    const accounts = accountsRes.rows;
    const liquidAccounts = accounts.filter(a => ['checking', 'savings', 'cash'].includes(a.account_type));
    const liquidReserves = liquidAccounts.reduce((sum, a) => sum + (parseFloat(a.initial_balance) || 0), 0);
    const hasEmergencyFundGoal = accounts.some(a => 
      a.account_name.toLowerCase().includes('vault') || 
      a.account_name.toLowerCase().includes('emergency') || 
      a.account_name.toLowerCase().includes('savings')
    );

    // 2. Determine date ranges: current month and previous month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentPeriodStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

    const prevMonthDate = new Date(currentYear, now.getMonth() - 1, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth() + 1;
    const prevPeriodStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

    // 3. Fetch user transactions
    const txRes = await query(
      `SELECT t.id, t.amount, t.transaction_type, t.t_desc, t.is_reccuring, t.t_date,
              c.category_name, c.id AS category_id
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 AND t.deleted_at IS NULL
       ORDER BY t.t_date DESC`,
      [userId]
    );
    const transactions = txRes.rows;

    // 4. Compute metrics
    let monthlyIncome = 0;
    let totalExpenses = 0;
    let recurringSubscriptionsTotal = 0;
    const subscriptionItems = [];
    const currentSpendByCategory = {};
    const previousSpendByCategory = {};

    for (const t of transactions) {
      const amt = Math.abs(parseFloat(t.amount || 0));
      const dateStr = t.t_date ? (t.t_date instanceof Date ? t.t_date.toISOString().slice(0, 7) : String(t.t_date).slice(0, 7)) : currentPeriodStr;
      const catName = t.category_name || 'General';
      const isExpense = t.transaction_type === 'expense' || parseFloat(t.amount) < 0;

      if (dateStr === currentPeriodStr) {
        if (isExpense) {
          totalExpenses += amt;
          currentSpendByCategory[catName] = (currentSpendByCategory[catName] || 0) + amt;
          if (t.is_reccuring) {
            recurringSubscriptionsTotal += amt;
            if (t.t_desc) subscriptionItems.push(t.t_desc);
          }
        } else if (t.transaction_type === 'income') {
          monthlyIncome += amt;
        }
      } else if (dateStr === prevPeriodStr) {
        if (isExpense) {
          previousSpendByCategory[catName] = (previousSpendByCategory[catName] || 0) + amt;
        }
      }
    }

    // Keep recommendations grounded in the user's actual ledger. Empty ledgers
    // should produce no insights rather than a demo recommendation set.
    const netRunway = totalExpenses > 0 ? (liquidReserves / totalExpenses) : 0;
    const spendingData = {
      monthlyIncome,
      totalExpenses,
      liquidReserves,
      runwayMonths: Math.max(0, Math.round(netRunway * 10) / 10),
      hasEmergencyFundGoal,
      recurringSubscriptionsTotal,
      subscriptionItems,
      currentSpendByCategory,
      previousSpendByCategory
    };

    // 6. Run pure-function rule engine
    const insights = runAdvisorRules(spendingData);

    // 7. Upsert recommendations into PostgreSQL with condition-based dismissal tracking
    for (const insight of insights) {
      const { rule_code, title, message, severity, category_name, condition_key, metadata } = insight;

      // Check existing recommendation
      const existingRes = await query(
        `SELECT id, is_dismissed, condition_key, dismissed_condition_hash FROM recommendations WHERE user_id = $1 AND rule_code = $2`,
        [userId, rule_code]
      );

      if (existingRes.rows.length === 0) {
        // Insert new recommendation
        await query(
          `INSERT INTO recommendations (user_id, rule_code, title, message, severity, category_name, condition_key, metadata, is_dismissed)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)`,
          [userId, rule_code, title, message, severity, category_name || null, condition_key, JSON.stringify(metadata)]
        );
      } else {
        const existing = existingRes.rows[0];
        if (existing.is_dismissed) {
          // If condition has changed, un-dismiss and refresh
          if (existing.condition_key !== condition_key) {
            await query(
              `UPDATE recommendations 
               SET title = $1, message = $2, severity = $3, category_name = $4, condition_key = $5, metadata = $6, is_dismissed = false, dismissed_condition_hash = NULL, dismissed_at = NULL, updated_at = CURRENT_TIMESTAMP
               WHERE id = $7`,
              [title, message, severity, category_name || null, condition_key, JSON.stringify(metadata), existing.id]
            );
          }
          // If condition is identical, preserve dismissal
        } else {
          // Update active recommendation with latest calculations
          await query(
            `UPDATE recommendations
             SET title = $1, message = $2, severity = $3, category_name = $4, condition_key = $5, metadata = $6, updated_at = CURRENT_TIMESTAMP
             WHERE id = $7`,
            [title, message, severity, category_name || null, condition_key, JSON.stringify(metadata), existing.id]
          );
        }
      }
    }

    // 8. Return active (non-dismissed) recommendations
    return await getActiveRecommendations(userId);
  } catch (err) {
    console.error('[AdvisorService Error]:', err);
    throw err;
  }
};

/**
 * Retrieves all active non-dismissed recommendations for a user.
 */
export const getActiveRecommendations = async (userId) => {
  const res = await query(
    `SELECT id, rule_code, title, message, severity, category_name, metadata, created_at, updated_at
     FROM recommendations
     WHERE user_id = $1 AND is_dismissed = false
     ORDER BY CASE WHEN severity = 'critical' THEN 1 WHEN severity = 'warning' THEN 2 ELSE 3 END, created_at DESC`,
    [userId]
  );
  return res.rows;
};

/**
 * Dismisses a recommendation for the user.
 */
export const dismissRecommendation = async (userId, recommendationId) => {
  const res = await query(
    `UPDATE recommendations
    SET is_dismissed = true, dismissed_condition_hash = condition_key, dismissed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND user_id = $2
     RETURNING id, rule_code, is_dismissed, dismissed_at`,
    [recommendationId, userId]
  );
  return res.rows[0] || null;
};
