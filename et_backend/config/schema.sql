-- ==========================================================
-- BudgetMate (Expense Tracker) PostgreSQL Database Schema
-- STRUCTURE ONLY. Seed data lives in seedSystem.sql (always)
-- and seedDemo.sql (non-production only) — see config/initDb.js
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

-- ----------------------------------------------------------
-- 7. BUDGET ALERT LOG TABLE
-- Tracks which threshold alerts have already been sent per
-- user / category / period to prevent duplicate notifications.
-- rule_code: 'BUDGET_ALERT_80' | 'BUDGET_ALERT_100'
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS budget_alert_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    period VARCHAR(7) NOT NULL,           -- 'YYYY-MM'
    rule_code VARCHAR(30) NOT NULL,       -- 'BUDGET_ALERT_80' | 'BUDGET_ALERT_100'
    fired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_alert_per_period UNIQUE(user_id, category_id, period, rule_code)
);

-- ----------------------------------------------------------
-- 8. RECOMMENDATIONS TABLE (Rule-Based Advisor)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rule_code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'info', -- 'info', 'warning', 'critical'
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    category_name VARCHAR(100),
    condition_key VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}',
    is_dismissed BOOLEAN DEFAULT false,
    dismissed_condition_hash VARCHAR(255),
    dismissed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_rule_active UNIQUE(user_id, rule_code)
);

ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS dismissed_condition_hash VARCHAR(255);

-- ----------------------------------------------------------
-- INDEXES FOR FAST QUERYING
-- ----------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_t_date ON transactions(t_date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_active_date ON transactions(user_id, t_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_desc_trgm ON transactions USING gin (t_desc gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_transactions_amount ON transactions(amount);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_monthly_summaries_user_period ON monthly_summaries(user_id, month_period);
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id) WHERE is_dismissed = false;

-- Bank-sync idempotency (audit fix #8): one natural key per bank feed row.
-- Lets the sync use a single INSERT ... ON CONFLICT DO NOTHING instead of a
-- per-row SELECT dup-check. Partial index keeps soft-deleted rows re-insertable.
CREATE UNIQUE INDEX IF NOT EXISTS uq_bank_sync_tx
    ON transactions(user_id, account_id, amount, t_date, t_desc)
    WHERE deleted_at IS NULL;
