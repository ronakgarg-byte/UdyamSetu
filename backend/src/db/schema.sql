CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    gender VARCHAR(50),
    phone VARCHAR(50),
    preferred_language VARCHAR(10) DEFAULT 'en',
    district VARCHAR(100),
    state VARCHAR(100) DEFAULT 'Uttar Pradesh',
    pincode VARCHAR(20),
    portal_type VARCHAR(50) DEFAULT 'existing',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(255),
    what TEXT,
    workers INTEGER DEFAULT 0,
    hours VARCHAR(100),
    portal_type VARCHAR(50) DEFAULT 'existing',
    interests TEXT,
    skills TEXT,
    capital_range VARCHAR(100),
    space_type VARCHAR(100),
    time_commitment VARCHAR(100),
    risk_appetite VARCHAR(100),
    barriers TEXT,
    knows_idea VARCHAR(50),
    idea_category VARCHAR(100),
    enjoy_doing TEXT,
    trade_training VARCHAR(255),
    tools_owned TEXT,
    space_available VARCHAR(100),
    capital_source VARCHAR(100),
    nearby_businesses TEXT,
    unmet_need TEXT,
    family_support VARCHAR(100),
    growth_aspiration VARCHAR(100),
    growth_barriers TEXT,
    credit_history VARCHAR(100),
    growth_intent VARCHAR(100),
    growth_blocker TEXT,
    existing_loan_type VARCHAR(100),
    loan_purpose TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_business_user UNIQUE (user_id)
);

CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customers_per_day INTEGER DEFAULT 0,
    daily_sales NUMERIC(12, 2) DEFAULT 0.00,
    monthly_revenue NUMERIC(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_sales_user UNIQUE (user_id)
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rent NUMERIC(12, 2) DEFAULT 0.00,
    electricity NUMERIC(12, 2) DEFAULT 0.00,
    raw_materials NUMERIC(12, 2) DEFAULT 0.00,
    transport NUMERIC(12, 2) DEFAULT 0.00,
    wages NUMERIC(12, 2) DEFAULT 0.00,
    packaging NUMERIC(12, 2) DEFAULT 0.00,
    emi NUMERIC(12, 2) DEFAULT 0.00,
    other NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_expenses_user UNIQUE (user_id)
);

CREATE TABLE customer_types (
    key VARCHAR(50) PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_hi VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE user_customer_types (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_type_key VARCHAR(50) NOT NULL REFERENCES customer_types(key) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, customer_type_key)
);

CREATE TABLE competition (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    count INTEGER DEFAULT 0,
    where_located TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_competition_user UNIQUE (user_id)
);

CREATE TABLE problems (
    key VARCHAR(50) PRIMARY KEY,
    name_en VARCHAR(150) NOT NULL,
    name_hi VARCHAR(150) NOT NULL,
    category VARCHAR(50) DEFAULT 'general'
);

CREATE TABLE user_problems (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_key VARCHAR(50) NOT NULL REFERENCES problems(key) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, problem_key)
);

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
    target_problems TEXT[],
    target_genders TEXT[],
    base_eligibility_score INTEGER DEFAULT 70,
    details_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE local_context_cache (
    location_key VARCHAR(255) PRIMARY KEY,
    data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_user_customer_types_user_id ON user_customer_types(user_id);
CREATE INDEX idx_competition_user_id ON competition(user_id);
CREATE INDEX idx_user_problems_user_id ON user_problems(user_id);
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_schemes_code ON schemes(code);
CREATE INDEX idx_local_context_expires ON local_context_cache(expires_at);
