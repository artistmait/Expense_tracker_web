-- ==========================================================
-- BudgetMate (Expense Tracker) PostgreSQL Database Schema
-- ==========================================================

-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------
-- 1. USERS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure avatar_url column exists if table was created previously
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
-- Ensure theme_preference column exists (values: 'light', 'dark', or NULL for system default)
ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(10) DEFAULT NULL;

-- ----------------------------------------------------------
-- 2. ACCOUNTS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_name VARCHAR(150) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- 'checking', 'savings', 'credit_card', 'investment', 'cash', 'other'
    initial_balance NUMERIC(15, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------
-- 3. CATEGORIES TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for system-wide default categories
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    category_name VARCHAR(100) NOT NULL,
    category_type VARCHAR(50) NOT NULL, -- 'expense', 'income', 'transfer'
    cat_icon VARCHAR(100),
    cat_colour VARCHAR(50),
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------
-- 4. TRANSACTIONS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'expense', 'income', 'transfer'
    t_desc VARCHAR(255),
    is_reccuring BOOLEAN DEFAULT false,
    t_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ----------------------------------------------------------
-- INDEXES FOR FAST QUERYING
-- ----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_t_date ON transactions(t_date);

-- ----------------------------------------------------------
-- SEED DEFAULT SYSTEM CATEGORIES
-- ----------------------------------------------------------
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

-- ----------------------------------------------------------
-- SEED DEFAULT DEMO USER: alex.morgan@budgetmate.io / password123
-- ----------------------------------------------------------
INSERT INTO users (username, full_name, email, password_hash, avatar_url, status)
SELECT 'alexmorgan', 'Alex Morgan', 'alex.morgan@budgetmate.io', '$2b$10$RMU4itoLh.GcDEthpUIwP.VygtXLre8cc71p6KTw55UoWOWNtMG8i', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256', true
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'alex.morgan@budgetmate.io'
);

-- Seed initial accounts for Demo User
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

-- ----------------------------------------------------------
-- SEED USER: maitreyee.puranik@budgetmate.io / Maitreyee123@
-- ----------------------------------------------------------
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

-- ----------------------------------------------------------
-- 5. BUDGETS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    period VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'weekly'
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_category_budget UNIQUE(user_id, category_id, period)
);

-- ----------------------------------------------------------
-- 6. MONTHLY SUMMARIES TABLE (Historical Snapshots)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS monthly_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    month_period VARCHAR(7) NOT NULL, -- 'YYYY-MM'
    total_spent NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_cat_month UNIQUE(user_id, category_id, month_period)
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_monthly_summaries_user_period ON monthly_summaries(user_id, month_period);

-- ----------------------------------------------------------
-- SEED INITIAL BUDGETS FOR DEMO USERS
-- ----------------------------------------------------------
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

