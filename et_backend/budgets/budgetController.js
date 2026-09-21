import { query } from '../config/db.js';

/**
 * Helper: Builds category descendants map for recursive parent-child spend rollup.
 * Maps category_id -> Array of all descendant category IDs (including self).
 */
export const buildCategoryHierarchyMap = (categories) => {
  const childrenMap = new Map();
  for (const cat of categories) {
    if (cat.parent_id) {
      if (!childrenMap.has(cat.parent_id)) {
        childrenMap.set(cat.parent_id, []);
      }
      childrenMap.get(cat.parent_id).push(cat.id);
    }
  }

  const getDescendants = (catId) => {
    const ids = [catId];
    const directChildren = childrenMap.get(catId) || [];
    for (const childId of directChildren) {
      ids.push(...getDescendants(childId));
    }
    return ids;
  };

  const resultMap = new Map();
  for (const cat of categories) {
    resultMap.set(cat.id, getDescendants(cat.id));
  }
  return resultMap;
};

/**
 * Helper: Classifies budget status based on percentage used.
 */
export const getBudgetStatus = (percentage) => {
  if (percentage > 100) return 'exceeded';
  if (percentage >= 80) return 'warning';
  return 'normal';
};

// -------------------------------------------------------------
// GET /api/budgets/progress?period=YYYY-MM
// -------------------------------------------------------------
export const getBudgetProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // 'YYYY-MM'
    const requestedPeriod = (req.query.period || currentMonth).trim();

    // 1. Fetch user's budgets with category details
    const budgetsSql = `
      SELECT b.id, b.category_id, b.amount, b.period,
             c.category_name, c.cat_icon, c.cat_colour, c.parent_id
      FROM budgets b
      JOIN categories c ON c.id = b.category_id
      WHERE b.user_id = $1
      ORDER BY b.amount DESC
    `;
    const budgetsResult = await query(budgetsSql, [userId]);
    const budgets = budgetsResult.rows;

    // 2. Fetch all categories accessible to user (system + custom) to resolve hierarchy
    const catSql = `
      SELECT id, category_name, parent_id 
      FROM categories 
      WHERE user_id = $1 OR user_id IS NULL
    `;
    const catResult = await query(catSql, [userId]);
    const hierarchyMap = buildCategoryHierarchyMap(catResult.rows);

    // 3. Determine if period is a historical past month
    const isHistoricalMonth = requestedPeriod < currentMonth;
    let spendByCategory = new Map();

    if (isHistoricalMonth) {
      // Check monthly_summaries first
      const summarySql = `
        SELECT category_id, total_spent 
        FROM monthly_summaries 
        WHERE user_id = $1 AND month_period = $2
      `;
      const summaryResult = await query(summarySql, [userId, requestedPeriod]);
      
      if (summaryResult.rows.length > 0) {
        for (const row of summaryResult.rows) {
          spendByCategory.set(row.category_id, parseFloat(row.total_spent) || 0);
        }
      }
    }

    // If spendByCategory is empty (either current month or historical summary was not snapshot yet)
    if (spendByCategory.size === 0) {
      // Calculate live from transactions within period
      const [yearStr, monthStr] = requestedPeriod.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const startDate = `${requestedPeriod}-01`;
      const endDay = new Date(year, month, 0).getDate();
      const endDate = `${requestedPeriod}-${endDay.toString().padStart(2, '0')}`;

      const txSpendSql = `
        SELECT category_id, SUM(ABS(amount)) as total_spent
        FROM transactions
        WHERE user_id = $1 
          AND transaction_type = 'expense'
          AND t_date >= $2 AND t_date <= $3
          AND deleted_at IS NULL
        GROUP BY category_id
      `;
      const txResult = await query(txSpendSql, [userId, startDate, endDate]);
      for (const row of txResult.rows) {
        if (row.category_id) {
          spendByCategory.set(row.category_id, parseFloat(row.total_spent) || 0);
        }
      }
    }

    // 4. Compute progress per budget including recursive child-category rollup
    let totalAllocated = 0;
    let totalSpent = 0;

    const progress = budgets.map((b) => {
      const allocated = parseFloat(b.amount) || 0;
      totalAllocated += allocated;

      // Sum spending for category and all recursive child categories
      const targetCategoryIds = hierarchyMap.get(b.category_id) || [b.category_id];
      let spent = 0;
      for (const catId of targetCategoryIds) {
        spent += spendByCategory.get(catId) || 0;
      }
      totalSpent += spent;

      const percentage = allocated > 0 
        ? Math.round((spent / allocated) * 1000) / 10 
        : 0;

      const remaining = Math.max(0, Math.round((allocated - spent) * 100) / 100);
      const overAmount = spent > allocated 
        ? Math.round((spent - allocated) * 100) / 100 
        : 0;
      const status = getBudgetStatus(percentage);

      return {
        id: b.id,
        category_id: b.category_id,
        category_name: b.category_name,
        cat_icon: b.cat_icon,
        cat_colour: b.cat_colour,
        allocated_amount: allocated,
        spent_amount: Math.round(spent * 100) / 100,
        remaining_amount: remaining,
        over_amount: overAmount,
        percentage_used: percentage,
        status, // 'normal' | 'warning' | 'exceeded'
        period: b.period
      };
    });

    const overallPercentage = totalAllocated > 0 
      ? Math.round((totalSpent / totalAllocated) * 1000) / 10 
      : 0;

    return res.status(200).json({
      success: true,
      period: requestedPeriod,
      summary: {
        total_allocated: Math.round(totalAllocated * 100) / 100,
        total_spent: Math.round(totalSpent * 100) / 100,
        remaining: Math.max(0, Math.round((totalAllocated - totalSpent) * 100) / 100),
        percentage_used: overallPercentage,
        status: getBudgetStatus(overallPercentage)
      },
      budgets: progress
    });
  } catch (err) {
    console.error('[GetBudgetProgress Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to compute budget progress.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// -------------------------------------------------------------
// GET /api/budgets
// -------------------------------------------------------------
export const getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const sql = `
      SELECT b.id, b.category_id, b.amount, b.period, b.start_date, b.end_date,
             c.category_name, c.cat_icon, c.cat_colour
      FROM budgets b
      JOIN categories c ON c.id = b.category_id
      WHERE b.user_id = $1
      ORDER BY b.amount DESC
    `;
    const result = await query(sql, [userId]);
    return res.status(200).json({
      success: true,
      budgets: result.rows
    });
  } catch (err) {
    console.error('[GetBudgets Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch budgets.'
    });
  }
};

// -------------------------------------------------------------
// POST /api/budgets (Create or Update Budget)
// -------------------------------------------------------------
export const createOrUpdateBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category_id, amount, period = 'monthly', start_date, end_date } = req.body;

    if (!category_id) {
      return res.status(400).json({ success: false, message: 'Category is required for a budget.' });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Budget amount must be a positive number.' });
    }

    const upsertSql = `
      INSERT INTO budgets (user_id, category_id, amount, period, start_date, end_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, category_id, period)
      DO UPDATE SET 
        amount = EXCLUDED.amount,
        start_date = COALESCE(EXCLUDED.start_date, budgets.start_date),
        end_date = COALESCE(EXCLUDED.end_date, budgets.end_date),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await query(upsertSql, [
      userId,
      category_id,
      numericAmount,
      period,
      start_date || null,
      end_date || null
    ]);

    return res.status(200).json({
      success: true,
      message: 'Budget saved successfully.',
      budget: result.rows[0]
    });
  } catch (err) {
    console.error('[CreateOrUpdateBudget Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to save budget.'
    });
  }
};

// -------------------------------------------------------------
// DELETE /api/budgets/:id
// -------------------------------------------------------------
export const deleteBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;

    const result = await query(
      'DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id',
      [budgetId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Budget not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Budget deleted successfully.'
    });
  } catch (err) {
    console.error('[DeleteBudget Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete budget.'
    });
  }
};
