-- Mafuta Centralized Database Schema
-- Production Ready Infrastructure

-- 1. COMPANIES (Multi-tenant Root Nodes)
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    registration_number TEXT UNIQUE,
    email TEXT,
    status TEXT DEFAULT 'active', -- active, suspended, pending
    modules JSONB DEFAULT '[]'::jsonb, -- ['locomotive', 'tanks', 'meters', 'fueling', 'recon', 'incidents', 'ai']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. BRANCHES (Company Divisions)
CREATE TABLE IF NOT EXISTS branches (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ALERTS (Telemetry & Security Alerts)
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL, -- critical, warning, info
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread', -- unread, read, archived
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. INCIDENTS (Logged Safety/Operational Issues)
CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT DEFAULT 'medium', -- low, medium, high, critical
    status TEXT DEFAULT 'open', -- open, investigating, resolved, closed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. AUDIT LOGS (Traceability Ledger)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id TEXT, -- Reference to auth user
    action TEXT NOT NULL, -- LOGIN, UPDATE_CONFIG, DELETE_USER, etc.
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. DATA RETENTION POLICIES
CREATE TABLE IF NOT EXISTS data_retention (
    id SERIAL PRIMARY KEY,
    policy_name TEXT NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 365,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. GATEWAY CONFIGURATIONS (Hardware Nodes)
CREATE TABLE IF NOT EXISTS gateway_configs (
    id SERIAL PRIMARY KEY,
    node_name TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    status TEXT DEFAULT 'online', -- online, offline, maintenance
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. TELEMETRY ALERT CONFIGURATIONS
CREATE TABLE IF NOT EXISTS telemetry_alert_configs (
    id SERIAL PRIMARY KEY,
    parameter TEXT NOT NULL, -- temperature, fuel_level, flow_rate
    threshold DECIMAL NOT NULL,
    operator TEXT DEFAULT '>', -- >, <, >=, <=, ==
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. PLATFORM CONFIGURATIONS (Global Parameters)
CREATE TABLE IF NOT EXISTS platform_configs (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    label TEXT,
    value TEXT NOT NULL,
    unit TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. ROLES (RBAC Roles)
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. USERS (Identity Platform)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT NOT NULL, -- In production, use bcrypt
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. USER_ROLES (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Seed Initial Roles
INSERT INTO roles (id, name, slug, description) VALUES 
(1, 'Super Admin', 'super-admin', 'Full system access'),
(2, 'Company Admin', 'company-admin', 'Full access to organization data'),
(3, 'Manager', 'manager', 'Operational management'),
(4, 'Operator', 'operator', 'Field operations and data entry')
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Platform Configs (Examples)
INSERT INTO platform_configs (key, label, value, unit) VALUES 
('fuel_expansion_coeff', 'Fuel Expansion Coefficient', '0.0011', 'per °C') ON CONFLICT (key) DO NOTHING;
INSERT INTO platform_configs (key, label, value, unit) VALUES 
('max_tank_temp', 'Max Safe Tank Temp', '45', '°C') ON CONFLICT (key) DO NOTHING;
INSERT INTO platform_configs (key, label, value, unit) VALUES 
('min_flow_rate', 'Minimum Flow Detection', '0.5', 'L/sec') ON CONFLICT (key) DO NOTHING;
