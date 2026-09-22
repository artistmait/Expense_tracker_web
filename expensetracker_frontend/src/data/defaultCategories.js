export const DEFAULT_CATEGORIES = [
  { id: 'cat-housing', category_name: 'Housing & Utilities', category_type: 'expense', cat_colour: '#112E81' },
  { id: 'cat-food', category_name: 'Food & Dining', category_type: 'expense', cat_colour: '#4382DF' },
  { id: 'cat-tech', category_name: 'Tech, AI & Subscriptions', category_type: 'expense', cat_colour: '#8B5CF6' },
  { id: 'cat-groceries', category_name: 'Groceries', category_type: 'expense', cat_colour: '#AACCD6' },
  { id: 'cat-transport', category_name: 'Transportation & Gas', category_type: 'expense', cat_colour: '#4647AE' },
  { id: 'cat-ent', category_name: 'Entertainment & Leisure', category_type: 'expense', cat_colour: '#F59E0B' },
  { id: 'cat-health', category_name: 'Health & Wellness', category_type: 'expense', cat_colour: '#10B981' },
  { id: 'cat-salary', category_name: 'Salary & Direct Deposit', category_type: 'income', cat_colour: '#059669' },
  { id: 'cat-invest', category_name: 'Investments & Dividends', category_type: 'income', cat_colour: '#2563EB' },
];

export const DEFAULT_EXPENSE_CATEGORIES = DEFAULT_CATEGORIES.filter(
  (category) => category.category_type === 'expense'
);
