# Compliance-Bridge: Database Schema

## 1. Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA OVERVIEW                               │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
    │    users     │───────│  strategies  │───────│   signals    │
    └──────────────┘       └──────────────┘       └─────┬────────┘
           │                      │                      │
           │                      │                      │
    ┌──────┴───────┐       ┌──────┴───────┐       ┌─────┴────────┐
    │ user_roles   │       │ strategy_    │       │ compliance_  │
    │              │       │ permissions  │       │ results      │
    └──────────────┘       └──────────────┘       └─────┬────────┘
                                                        │
    ┌──────────────┐       ┌──────────────┐       ┌─────┴────────┐
    │   brokers    │───────│ broker_      │───────│   orders     │
    │              │       │ accounts     │       │              │
    └──────────────┘       └──────────────┘       └─────┬────────┘
                                                        │
    ┌──────────────┐       ┌──────────────┐       ┌─────┴────────┐
    │ compliance_  │       │  risk_       │       │   trades     │
    │ rules        │       │  limits      │       │              │
    └──────────────┘       └──────────────┘       └──────────────┘
                                                        │
                                                  ┌─────┴────────┐
                                                  │ audit_logs   │
                                                  └──────────────┘
```

---

## 2. Core Tables (PostgreSQL)

### 2.1 Users & Authentication

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending', 'deleted')),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- Roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]',
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles mapping
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- API Keys for strategy authentication
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(10) NOT NULL,
    name VARCHAR(100),
    permissions JSONB DEFAULT '["signal:write"]',
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
```

### 2.2 Organizations & Tenants (Multi-tenant)

```sql
-- Organizations (tenants)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) CHECK (type IN ('broker', 'prop_firm', 'individual', 'enterprise')),
    status VARCHAR(20) DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    branding JSONB DEFAULT '{}',
    billing_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization membership
CREATE TABLE organization_members (
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (org_id, user_id)
);
```

### 2.3 Brokers & Accounts

```sql
-- Supported brokers
CREATE TABLE brokers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    api_type VARCHAR(50),
    base_url VARCHAR(255),
    websocket_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    supported_segments JSONB DEFAULT '["NSE_EQ", "NSE_FO", "BSE_EQ"]',
    rate_limits JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User broker accounts
CREATE TABLE broker_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    broker_id UUID REFERENCES brokers(id),
    client_id VARCHAR(100) NOT NULL,
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active',
    is_primary BOOLEAN DEFAULT FALSE,
    permissions JSONB DEFAULT '{}',
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, broker_id, client_id)
);

CREATE INDEX idx_broker_accounts_user ON broker_accounts(user_id);
```

### 2.4 Strategies

```sql
-- Strategies
CREATE TABLE strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organizations(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'suspended', 'archived')),
    type VARCHAR(50),
    allowed_instruments JSONB DEFAULT '[]',
    allowed_segments JSONB DEFAULT '["NSE_EQ"]',
    max_order_value DECIMAL(15, 2),
    max_position_size INTEGER,
    max_daily_orders INTEGER,
    risk_limits JSONB DEFAULT '{}',
    api_key_id UUID REFERENCES api_keys(id),
    webhook_url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_strategies_user ON strategies(user_id);
CREATE INDEX idx_strategies_status ON strategies(status);

-- Strategy-Broker account mapping
CREATE TABLE strategy_broker_accounts (
    strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
    broker_account_id UUID REFERENCES broker_accounts(id) ON DELETE CASCADE,
    allocation_pct DECIMAL(5, 2) DEFAULT 100.00,
    is_active BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (strategy_id, broker_account_id)
);
```

### 2.5 Signals

```sql
-- Trading signals received from strategies
CREATE TABLE signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID REFERENCES strategies(id),
    external_id VARCHAR(100),
    
    -- Signal details
    instrument_token VARCHAR(50) NOT NULL,
    exchange VARCHAR(10) NOT NULL CHECK (exchange IN ('NSE', 'BSE', 'NFO', 'MCX')),
    symbol VARCHAR(50) NOT NULL,
    side VARCHAR(10) NOT NULL CHECK (side IN ('BUY', 'SELL')),
    quantity INTEGER NOT NULL,
    order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('MARKET', 'LIMIT', 'SL', 'SL-M')),
    price DECIMAL(15, 4),
    trigger_price DECIMAL(15, 4),
    product_type VARCHAR(20) CHECK (product_type IN ('CNC', 'MIS', 'NRML')),
    validity VARCHAR(10) DEFAULT 'DAY',
    
    -- Timestamps
    signal_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Processing status
    status VARCHAR(20) DEFAULT 'received' CHECK (status IN (
        'received', 'validating', 'compliance_check', 'approved', 
        'rejected', 'queued', 'processing', 'completed', 'failed'
    )),
    
    -- Source info
    source_ip VARCHAR(45),
    request_id VARCHAR(100),
    
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_signals_strategy ON signals(strategy_id);
CREATE INDEX idx_signals_received ON signals(received_at);
CREATE INDEX idx_signals_status ON signals(status);
CREATE INDEX idx_signals_symbol ON signals(symbol, exchange);
```

### 2.6 Compliance

```sql
-- Compliance rules
CREATE TABLE compliance_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50) CHECK (category IN ('exchange', 'broker', 'user', 'system')),
    rule_type VARCHAR(50),
    condition JSONB NOT NULL,
    action VARCHAR(20) DEFAULT 'reject' CHECK (action IN ('reject', 'warn', 'log')),
    priority INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    applies_to JSONB DEFAULT '{"exchanges": ["ALL"], "brokers": ["ALL"]}',
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_compliance_rules_active ON compliance_rules(is_active, category);

-- Compliance check results
CREATE TABLE compliance_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_id UUID REFERENCES signals(id),
    overall_status VARCHAR(20) NOT NULL CHECK (overall_status IN ('passed', 'failed', 'warning')),
    rules_checked INTEGER DEFAULT 0,
    rules_passed INTEGER DEFAULT 0,
    rules_failed INTEGER DEFAULT 0,
    check_details JSONB NOT NULL DEFAULT '[]',
    execution_time_ms INTEGER,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_compliance_results_signal ON compliance_results(signal_id);
CREATE INDEX idx_compliance_results_status ON compliance_results(overall_status);

-- Risk limits per user/strategy
CREATE TABLE risk_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    strategy_id UUID REFERENCES strategies(id),
    org_id UUID REFERENCES organizations(id),
    
    -- Order limits
    max_order_value DECIMAL(15, 2),
    max_order_quantity INTEGER,
    max_orders_per_minute INTEGER DEFAULT 60,
    max_orders_per_day INTEGER DEFAULT 1000,
    
    -- Position limits
    max_position_value DECIMAL(15, 2),
    max_position_quantity INTEGER,
    max_open_orders INTEGER DEFAULT 50,
    
    -- Loss limits
    max_daily_loss DECIMAL(15, 2),
    max_weekly_loss DECIMAL(15, 2),
    max_monthly_loss DECIMAL(15, 2),
    
    -- Instrument restrictions
    blocked_instruments JSONB DEFAULT '[]',
    allowed_instruments JSONB DEFAULT '[]',
    allowed_segments JSONB DEFAULT '["NSE_EQ"]',
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT risk_limits_scope CHECK (
        user_id IS NOT NULL OR strategy_id IS NOT NULL OR org_id IS NOT NULL
    )
);
```

### 2.7 Orders & Trades

```sql
-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_id UUID REFERENCES signals(id),
    strategy_id UUID REFERENCES strategies(id),
    user_id UUID REFERENCES users(id),
    broker_account_id UUID REFERENCES broker_accounts(id),
    
    -- Order details
    broker_order_id VARCHAR(100),
    exchange_order_id VARCHAR(100),
    instrument_token VARCHAR(50) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    side VARCHAR(10) NOT NULL,
    quantity INTEGER NOT NULL,
    filled_quantity INTEGER DEFAULT 0,
    pending_quantity INTEGER,
    order_type VARCHAR(20) NOT NULL,
    price DECIMAL(15, 4),
    trigger_price DECIMAL(15, 4),
    average_price DECIMAL(15, 4),
    product_type VARCHAR(20),
    validity VARCHAR(10),
    
    -- Status
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
        'pending', 'open', 'partially_filled', 'filled', 
        'cancelled', 'rejected', 'expired', 'error'
    )),
    status_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    placed_at TIMESTAMP WITH TIME ZONE,
    filled_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    broker_response JSONB,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_strategy ON orders(strategy_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_orders_broker_id ON orders(broker_order_id);

-- Trades (filled order legs)
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    user_id UUID REFERENCES users(id),
    broker_account_id UUID REFERENCES broker_accounts(id),
    
    -- Trade details
    broker_trade_id VARCHAR(100),
    exchange_trade_id VARCHAR(100),
    instrument_token VARCHAR(50) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    side VARCHAR(10) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(15, 4) NOT NULL,
    value DECIMAL(15, 4),
    
    -- Timestamps
    traded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_trades_order ON trades(order_id);
CREATE INDEX idx_trades_user ON trades(user_id);
CREATE INDEX idx_trades_traded ON trades(traded_at);

-- Positions
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    broker_account_id UUID REFERENCES broker_accounts(id),
    strategy_id UUID REFERENCES strategies(id),
    
    instrument_token VARCHAR(50) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    product_type VARCHAR(20),
    
    quantity INTEGER DEFAULT 0,
    average_price DECIMAL(15, 4),
    last_price DECIMAL(15, 4),
    pnl DECIMAL(15, 4) DEFAULT 0,
    pnl_percentage DECIMAL(8, 4) DEFAULT 0,
    
    day_buy_quantity INTEGER DEFAULT 0,
    day_sell_quantity INTEGER DEFAULT 0,
    day_buy_value DECIMAL(15, 4) DEFAULT 0,
    day_sell_value DECIMAL(15, 4) DEFAULT 0,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, broker_account_id, instrument_token, product_type)
);

CREATE INDEX idx_positions_user ON positions(user_id);
```

---

## 3. Audit Logs (ClickHouse)

```sql
-- Immutable audit log table
CREATE TABLE audit_logs (
    id UUID DEFAULT generateUUIDv4(),
    timestamp DateTime64(3) DEFAULT now64(3),
    
    -- Event identification
    event_type String,
    event_category Enum8('signal' = 1, 'compliance' = 2, 'order' = 3, 'trade' = 4, 'user' = 5, 'system' = 6),
    
    -- Actor
    user_id UUID,
    org_id UUID,
    api_key_id UUID,
    
    -- Subject
    resource_type String,
    resource_id UUID,
    
    -- Details
    action String,
    status Enum8('success' = 1, 'failure' = 2, 'pending' = 3),
    details String,
    
    -- Request context
    request_id String,
    source_ip String,
    user_agent String,
    
    -- Indexing
    INDEX idx_event_type event_type TYPE bloom_filter GRANULARITY 4,
    INDEX idx_user_id user_id TYPE bloom_filter GRANULARITY 4,
    INDEX idx_resource_id resource_id TYPE bloom_filter GRANULARITY 4
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (timestamp, event_category, user_id)
TTL timestamp + INTERVAL 7 YEAR
SETTINGS index_granularity = 8192;
```

---

## 4. Sample Seed Data

```sql
-- Insert default roles
INSERT INTO roles (name, description, permissions, is_system_role) VALUES
('admin', 'System Administrator', '["*"]', true),
('broker_admin', 'Broker Administrator', '["broker:*", "user:read", "order:*", "compliance:*"]', true),
('trader', 'Trader', '["strategy:*", "signal:write", "order:read", "position:read"]', true),
('strategy_developer', 'Strategy Developer', '["strategy:*", "signal:write", "api_key:*"]', true),
('viewer', 'Read-only access', '["*:read"]', true);

-- Insert supported brokers
INSERT INTO brokers (name, code, api_type, is_active, supported_segments) VALUES
('Zerodha', 'ZERODHA', 'kite_connect', true, '["NSE_EQ", "NSE_FO", "BSE_EQ", "MCX"]'),
('Angel One', 'ANGEL', 'smart_api', true, '["NSE_EQ", "NSE_FO", "BSE_EQ", "MCX"]'),
('Upstox', 'UPSTOX', 'upstox_api', true, '["NSE_EQ", "NSE_FO", "BSE_EQ"]'),
('ICICI Direct', 'ICICI', 'breeze_api', true, '["NSE_EQ", "NSE_FO", "BSE_EQ"]');

-- Insert default compliance rules
INSERT INTO compliance_rules (name, code, description, category, condition, action, priority) VALUES
('Market Hours Check', 'MKT_HOURS', 'Reject orders outside market hours', 'exchange', 
 '{"type": "time_window", "start": "09:15", "end": "15:30", "timezone": "Asia/Kolkata"}', 'reject', 10),
('Max Order Value', 'MAX_ORDER_VAL', 'Maximum single order value limit', 'broker', 
 '{"type": "max_value", "field": "order_value", "limit": 10000000}', 'reject', 20),
('Rate Limit', 'RATE_LIMIT', 'Maximum orders per minute', 'system', 
 '{"type": "rate_limit", "window": 60, "max_count": 60}', 'reject', 5),
('Lot Size Validation', 'LOT_SIZE', 'Order quantity must be multiple of lot size', 'exchange',
 '{"type": "lot_size", "check": "quantity % lot_size == 0"}', 'reject', 15);
```
