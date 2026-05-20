-- Mafuta Centralized Database Schema & Core Seeds
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

-- --- SEED INITIAL DATA ---

-- Seed RBAC Roles
INSERT INTO roles (id, name, slug, description) VALUES 
(1, 'Super Admin', 'super-admin', 'Full system access'),
(2, 'Company Admin', 'company-admin', 'Full access to organization data'),
(3, 'Manager', 'manager', 'Operational management'),
(4, 'Operator', 'operator', 'Field operations and data entry')
ON CONFLICT (id) DO NOTHING;

-- Seed Platform Configs
INSERT INTO platform_configs (key, label, value, unit) VALUES 
('fuel_expansion_coeff', 'Fuel Expansion Coefficient', '0.0011', 'per °C') ON CONFLICT (key) DO NOTHING;
INSERT INTO platform_configs (key, label, value, unit) VALUES 
('max_tank_temp', 'Max Safe Tank Temp', '45', '°C') ON CONFLICT (key) DO NOTHING;
INSERT INTO platform_configs (key, label, value, unit) VALUES 
('min_flow_rate', 'Minimum Flow Detection', '0.5', 'L/sec') ON CONFLICT (key) DO NOTHING;

-- Seed default Tanzania Railways Corporation company (Multi-tenant root node)
INSERT INTO companies (id, name, registration_number, email, status, modules)
VALUES (1, 'Tanzania Railways Corporation', 'TRC-HQ-2026', 'info@trc.go.tz', 'active', '["locomotive", "tanks", "meters", "fueling", "recon", "incidents", "ai"]')
ON CONFLICT (id) DO NOTHING;

-- Seed default Admin User (admin@trc.go.tz / Admin@2025)
INSERT INTO users (id, name, email, phone, password, status, company_id)
VALUES (1, 'TRC Gateway Admin', 'admin@trc.go.tz', '+255000000000', 'Admin@2025', 'active', 1)
ON CONFLICT (id) DO NOTHING;

-- Map Admin to Super Admin Role (Role ID 1 is Super Admin)
INSERT INTO user_roles (user_id, role_id)
VALUES (1, 1)
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Seed Incidents (Active learning anomalies)
INSERT INTO incidents (title, description, severity, status, created_at) VALUES
('Telemetry Spiking', 'Node ID 402 showing abnormal fuel variance in Branch A.', 'high', 'open', NOW() - interval '2 hours'),
('Hardware Latency', 'Gateway 12 response time exceeded 500ms.', 'medium', 'open', NOW() - interval '5 hours'),
('Unauthorized Access', 'Multiple failed PIN attempts on Terminal 04.', 'critical', 'open', NOW() - interval '8 hours'),
('Sensor Drift', 'Calibration variance detected on Tank 01 sensors.', 'low', 'resolved', NOW() - interval '12 hours'),
('Rapid Depletion', 'Consumption rate 3x higher than historical average in Zone B.', 'high', 'open', NOW() - interval '18 hours')
ON CONFLICT DO NOTHING;

-- Seed Alerts (System learning inputs)
INSERT INTO alerts (type, message, status, created_at) VALUES
('AI_THRESHOLD', 'Pattern recognition updated for Route 12.', 'unread', NOW() - interval '1 hour'),
('SYSTEM_SYNC', 'Neural weights synchronized across regional nodes.', 'unread', NOW() - interval '4 hours'),
('ANOMALY_LOG', 'High confidence match for historical theft pattern.', 'unread', NOW() - interval '7 hours')
ON CONFLICT DO NOTHING;
