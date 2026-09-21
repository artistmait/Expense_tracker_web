import { query } from '../config/db.js';

/**
 * BLOCK 2.1c: Budget Alert Engine
 *
 * Called after every transaction create/update for expense-type transactions.
 * Checks if the category spend has crossed the 80% or 100% threshold of its
 * budget for the current month. Each threshold fires exactly once per period
 * per category (tracked in budget_alert_log).
 *
 * Returns an array of triggered alert objects for the caller to forward to
 * the frontend (via API response) and/or email queue.
 *
 * Debounce rule: alerts only fire on FIRST crossing of a threshold.
 * Further spending does NOT fire additional alerts.
 */
export const checkBudgetAlerts = async (userId, categoryId, txDate) => {
  if (!userId || !categoryId) return [];

  // Determine the billing period (YYYY-MM) from the transaction date
  const period = (txDate instanceof Date ? txDate : new Date(txDate))
    .toISOString()
    .slice(0, 7);

  try {
    // 1. Look up the budget for this category
    const budgetRes = await query(
      `SELECT b.id, b.amount, c.category_name, c.cat_colour
       FROM budgets b
       JOIN categories c ON c.id = b.category_id
       WHERE b.user_id = $1 AND b.category_id = $2
       LIMIT 1`,
      [userId, categoryId]
    );

    if (budgetRes.rows.length === 0) return []; // no budget set for this category

    const budget = budgetRes.rows[0];
    const allocatedAmount = parseFloat(budget.amount);

    // 2. Sum all expense transactions for this category in the current period
    const [yearStr, monthStr] = period.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const startDate = `${period}-01`;
    const endDay = new Date(year, month, 0).getDate();
    const endDate = `${period}-${String(endDay).padStart(2, '0')}`;

    const spendRes = await query(
      `SELECT COALESCE(SUM(ABS(amount)), 0)::numeric AS total_spent
       FROM transactions
       WHERE user_id = $1
         AND category_id = $2
         AND transaction_type = 'expense'
         AND t_date >= $3 AND t_date <= $4
         AND deleted_at IS NULL`,
      [userId, categoryId, startDate, endDate]
    );

    const spentAmount = parseFloat(spendRes.rows[0]?.total_spent || 0);
    const pct = allocatedAmount > 0 ? (spentAmount / allocatedAmount) * 100 : 0;

    // 3. Load already-fired alerts for this category this period
    const firedRes = await query(
      `SELECT rule_code FROM budget_alert_log
       WHERE user_id = $1 AND category_id = $2 AND period = $3`,
      [userId, categoryId, period]
    );
    const alreadyFired = new Set(firedRes.rows.map((r) => r.rule_code));

    const triggeredAlerts = [];

    // 4. Check 100% threshold first (so we fire 80 + 100 independently)
    if (pct >= 100 && !alreadyFired.has('BUDGET_ALERT_100')) {
      await query(
        `INSERT INTO budget_alert_log (user_id, category_id, period, rule_code)
         VALUES ($1, $2, $3, 'BUDGET_ALERT_100')
         ON CONFLICT ON CONSTRAINT unique_alert_per_period DO NOTHING`,
        [userId, categoryId, period]
      );
      triggeredAlerts.push({
        type: 'BUDGET_ALERT_100',
        severity: 'exceeded',
        category_name: budget.category_name,
        cat_colour: budget.cat_colour,
        allocated: allocatedAmount,
        spent: spentAmount,
        percentage: Math.round(pct * 10) / 10,
        period,
        message: `Budget exceeded for ${budget.category_name} (${Math.round(pct)}% used — ${spentAmount.toFixed(2)} of ${allocatedAmount.toFixed(2)}).`,
      });
    }

    if (pct >= 80 && !alreadyFired.has('BUDGET_ALERT_80')) {
      await query(
        `INSERT INTO budget_alert_log (user_id, category_id, period, rule_code)
         VALUES ($1, $2, $3, 'BUDGET_ALERT_80')
         ON CONFLICT ON CONSTRAINT unique_alert_per_period DO NOTHING`,
        [userId, categoryId, period]
      );
      triggeredAlerts.push({
        type: 'BUDGET_ALERT_80',
        severity: 'warning',
        category_name: budget.category_name,
        cat_colour: budget.cat_colour,
        allocated: allocatedAmount,
        spent: spentAmount,
        percentage: Math.round(pct * 10) / 10,
        period,
        message: `${budget.category_name} budget is at ${Math.round(pct)}% (${spentAmount.toFixed(2)} of ${allocatedAmount.toFixed(2)}).`,
      });
    }

    return triggeredAlerts;
  } catch (err) {
    // Non-fatal: alert check failures must not block the transaction save
    console.error('[BudgetAlertCheck] Error (non-fatal):', err.message);
    return [];
  }
};
