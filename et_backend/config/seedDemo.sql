-- ==========================================================
-- DEMO seed data. NON-PRODUCTION ONLY.
-- Loaded by config/initDb.js when NODE_ENV !== 'production'.
-- Contains known demo credentials — never run against a real database.
-- ==========================================================

-- Demo User: alex.morgan@budgetmate.io (credentials documented in README, not here)
INSERT INTO users (username, full_name, email, password_hash, avatar_url, status)
SELECT 'alexmorgan', 'Alex Morgan', 'alex.morgan@budgetmate.io', '$2b$10$RMU4itoLh.GcDEthpUIwP.VygtXLre8cc71p6KTw55UoWOWNtMG8i', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256', true
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'alex.morgan@budgetmate.io'
);

INSERT INTO accounts (user_id, account_name, account_type, initial_balance, currency, is_active)
SELECT u.id, 'Chase Sapphire Checking', 'checking', 8420.00, 'USD', true
FROM users u
WHERE u.email = 'alex.morgan@budgetmate.io'
AND NOT EXISTS (
    SELECT 1 FROM accounts a WHERE a.user_id = u.id AND a.account_name = 'Chase Sapphire Checking'
);

INSERT INTO accounts (user_id, account_name, account_type, initial_balance, currency, is_active)
SELECT u.id, 'Amex Reserve Platinum', 'credit_card', 3150.20, 'USD', true
FROM users u
WHERE u.email = 'alex.morgan@budgetmate.io'
AND NOT EXISTS (
    SELECT 1 FROM accounts a WHERE a.user_id = u.id AND a.account_name = 'Amex Reserve Platinum'
);

INSERT INTO accounts (user_id, account_name, account_type, initial_balance, currency, is_active)
SELECT u.id, 'Primary Wealth Vault', 'savings', 45000.00, 'USD', true
FROM users u
WHERE u.email = 'alex.morgan@budgetmate.io'
AND NOT EXISTS (
    SELECT 1 FROM accounts a WHERE a.user_id = u.id AND a.account_name = 'Primary Wealth Vault'
);

-- Demo User: maitreyee.puranik@budgetmate.io
INSERT INTO users (username, full_name, email, password_hash, avatar_url, status)
SELECT 'maitreyee', 'Maitreyee Puranik', 'maitreyee.puranik@budgetmate.io', '$2b$10$536TKREprG97CZIKy6f2I.INr7mOgfS64MJV9RQgwvYXb7jr/3r6y', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256', true
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'maitreyee.puranik@budgetmate.io' OR username = 'maitreyee'
);

INSERT INTO accounts (user_id, account_name, account_type, initial_balance, currency, is_active)
SELECT u.id, 'Chase Sapphire Checking', 'checking', 8420.00, 'USD', true
FROM users u
WHERE u.email = 'maitreyee.puranik@budgetmate.io'
AND NOT EXISTS (
    SELECT 1 FROM accounts a WHERE a.user_id = u.id AND a.account_name = 'Chase Sapphire Checking'
);

INSERT INTO accounts (user_id, account_name, account_type, initial_balance, currency, is_active)
SELECT u.id, 'Amex Reserve Platinum', 'credit_card', 3150.20, 'USD', true
FROM users u
WHERE u.email = 'maitreyee.puranik@budgetmate.io'
AND NOT EXISTS (
    SELECT 1 FROM accounts a WHERE a.user_id = u.id AND a.account_name = 'Amex Reserve Platinum'
);

-- Seed initial budgets for demo users
INSERT INTO budgets (user_id, category_id, amount, period)
SELECT u.id, c.id, b.amount, 'monthly'
FROM users u
CROSS JOIN (VALUES
    ('Housing & Utilities', 8500.00),
    ('Groceries', 3000.00),
    ('Entertainment & Leisure', 3500.00),
    ('Food & Dining', 1200.00),
    ('Transportation & Gas', 800.00)
) AS b(category_name, amount)
JOIN categories c ON c.category_name = b.category_name AND c.is_system = true
WHERE (u.email = 'alex.morgan@budgetmate.io' OR u.email = 'maitreyee.puranik@budgetmate.io')
ON CONFLICT (user_id, category_id, period) DO NOTHING;
