-- ==========================================================
-- System category seed data. ALWAYS safe to run (idempotent).
-- Every user depends on these default categories.
-- ==========================================================

INSERT INTO categories (category_name, category_type, cat_icon, cat_colour, is_system)
SELECT * FROM (VALUES
    ('Housing & Utilities', 'expense', 'Home', '#112E81', true),
    ('Food & Dining', 'expense', 'Utensils', '#4382DF', true),
    ('Groceries', 'expense', 'ShoppingBag', '#AACCD6', true),
    ('Transportation & Gas', 'expense', 'Car', '#4647AE', true),
    ('Entertainment & Leisure', 'expense', 'Film', '#F59E0B', true),
    ('Tech, AI & Subscriptions', 'expense', 'Cpu', '#8B5CF6', true),
    ('Health & Wellness', 'expense', 'Activity', '#10B981', true),
    ('Salary & Direct Deposit', 'income', 'Briefcase', '#059669', true),
    ('Investments & Dividends', 'income', 'TrendingUp', '#2563EB', true),
    ('Freelance & Consulting', 'income', 'Laptop', '#7C3AED', true)
) AS v(category_name, category_type, cat_icon, cat_colour, is_system)
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE is_system = true
);
