-- ====================================================================
-- Udyam Setu - PostgreSQL Database Schema
-- SIH 2026 Problem Statement SIH26091
-- ====================================================================

-- Enable pgcrypto for UUID generation if supported
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS local_context_cache CASCADE;
DROP TABLE IF EXISTS user_problems CASCADE;
DROP TABLE IF EXISTS problems CASCADE;
DROP TABLE IF EXISTS competition CASCADE;
DROP TABLE IF EXISTS user_customer_types CASCADE;
DROP TABLE IF EXISTS customer_types CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS schemes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- --------------------------------------------------------------------
-- 1. Users Table
-- --------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    gender VARCHAR(50), -- 'male', 'female', 'other'
    phone VARCHAR(50),
    preferred_language VARCHAR(10) DEFAULT 'en', -- 'en', 'hi', etc.
    district VARCHAR(100),
    state VARCHAR(100) DEFAULT 'Uttar Pradesh',
    pincode VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 2. Businesses Table (Section A)
-- --------------------------------------------------------------------
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(255), -- 'Grocery / Kirana', 'Tailoring / Boutique', etc.
    what TEXT, -- Specific items/services sold
    workers INTEGER DEFAULT 0,
    hours VARCHAR(100), -- '8am - 8pm', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_business_user UNIQUE (user_id)
);

-- --------------------------------------------------------------------
-- 3. Sales Table (Section B)
-- --------------------------------------------------------------------
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customers_per_day INTEGER DEFAULT 0,
    daily_sales NUMERIC(12, 2) DEFAULT 0.00,
    monthly_revenue NUMERIC(12, 2), -- Optional; fallback is daily_sales * 30
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_sales_user UNIQUE (user_id)
);

-- --------------------------------------------------------------------
-- 4. Expenses Table (Section C)
-- --------------------------------------------------------------------
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rent NUMERIC(12, 2) DEFAULT 0.00,
    electricity NUMERIC(12, 2) DEFAULT 0.00,
    raw_materials NUMERIC(12, 2) DEFAULT 0.00,
    transport NUMERIC(12, 2) DEFAULT 0.00,
    wages NUMERIC(12, 2) DEFAULT 0.00,
    packaging NUMERIC(12, 2) DEFAULT 0.00,
    emi NUMERIC(12, 2) DEFAULT 0.00, -- Existing loan EMI
    other NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_expenses_user UNIQUE (user_id)
);

-- --------------------------------------------------------------------
-- 5. Customer Types Reference Table
-- --------------------------------------------------------------------
CREATE TABLE customer_types (
    key VARCHAR(50) PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_hi VARCHAR(100) NOT NULL,
    description TEXT
);

-- --------------------------------------------------------------------
-- 6. User-Customer Types Junction Table (Section D)
-- --------------------------------------------------------------------
CREATE TABLE user_customer_types (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_type_key VARCHAR(50) NOT NULL REFERENCES customer_types(key) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, customer_type_key)
);

-- --------------------------------------------------------------------
-- 7. Competition Table (Section E)
-- --------------------------------------------------------------------
CREATE TABLE competition (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    count INTEGER DEFAULT 0,
    where_located TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_competition_user UNIQUE (user_id)
);

-- --------------------------------------------------------------------
-- 8. Problems Reference Table
-- --------------------------------------------------------------------
CREATE TABLE problems (
    key VARCHAR(50) PRIMARY KEY,
    name_en VARCHAR(150) NOT NULL,
    name_hi VARCHAR(150) NOT NULL,
    category VARCHAR(50) DEFAULT 'general' -- financial, operational, market
);

-- --------------------------------------------------------------------
-- 9. User-Problems Junction Table (Section F)
-- --------------------------------------------------------------------
CREATE TABLE user_problems (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_key VARCHAR(50) NOT NULL REFERENCES problems(key) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, problem_key)
);

-- --------------------------------------------------------------------
-- 10. Items / Products Table
-- --------------------------------------------------------------------
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    sell_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    seasonal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 11. Government Schemes Reference Table
-- --------------------------------------------------------------------
CREATE TABLE schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_hi VARCHAR(255) NOT NULL,
    ministry_en VARCHAR(255),
    ministry_hi VARCHAR(255),
    description_en TEXT,
    description_hi TEXT,
    min_loan_amount NUMERIC(12, 2) DEFAULT 0,
    max_loan_amount NUMERIC(12, 2),
    subsidy_pct NUMERIC(5, 2) DEFAULT 0.00,
    min_revenue_threshold NUMERIC(12, 2) DEFAULT 0.00,
    max_revenue_threshold NUMERIC(12, 2),
    target_problems TEXT[], -- ARRAY of problem keys, e.g. {'workingcap', 'loanrepay'}
    target_genders TEXT[],  -- ARRAY of genders, e.g. {'female', 'other', 'male'}
    base_eligibility_score INTEGER DEFAULT 70,
    details_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 12. Local Context Cache Table (for external API aggregates)
-- --------------------------------------------------------------------
CREATE TABLE local_context_cache (
    location_key VARCHAR(255) PRIMARY KEY,
    data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- Indexes for High Performance Querying
-- --------------------------------------------------------------------
CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_user_customer_types_user_id ON user_customer_types(user_id);
CREATE INDEX idx_competition_user_id ON competition(user_id);
CREATE INDEX idx_user_problems_user_id ON user_problems(user_id);
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_schemes_code ON schemes(code);
CREATE INDEX idx_local_context_expires ON local_context_cache(expires_at);
