const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * Helper to generate dynamic UPDATE queries
 */
const dynamicUpdate = async (table, id, data, idColumn = 'id') => {
  const keys = Object.keys(data);
  if (keys.length === 0) return null;

  const setClause = keys.map((key, index) => `"${key}" = $${index + 1}`).join(', ');
  // Serialize arrays/objects to JSON strings for JSONB columns
  const values = Object.values(data).map(v => (Array.isArray(v) || (v !== null && typeof v === 'object')) ? JSON.stringify(v) : v);
  const query = `UPDATE ${table} SET ${setClause} WHERE "${idColumn}" = $${keys.length + 1} RETURNING *`;
  
  return db.query(query, [...values, id]);
};

/**
 * Helper to generate dynamic INSERT queries
 */
const dynamicInsert = async (table, data) => {
  const keys = Object.keys(data);
  const columns = keys.map(k => `"${k}"`).join(', ');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  // Serialize arrays/objects to JSON strings for JSONB columns
  const values = Object.values(data).map(v => (Array.isArray(v) || (v !== null && typeof v === 'object')) ? JSON.stringify(v) : v);
  const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
  
  return db.query(query, values);
};

// --- ALERTS (Read & Update) ---
router.get('/alerts', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM alerts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/alerts/:id', async (req, res) => {
  try {
    const result = await dynamicUpdate('alerts', req.params.id, req.body);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Alert not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- INCIDENTS (Read & Update) ---
router.get('/incidents', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM incidents ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/incidents/:id', async (req, res) => {
  try {
    const result = await dynamicUpdate('incidents', req.params.id, req.body);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Incident not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- AUDIT LOGS (Read Only) ---
router.get('/audit-logs', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM audit_logs ORDER BY timestamp DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- COMPANIES (Full CRUD) ---
router.get('/companies', async (req, res) => {
  try {
    const query = `
      SELECT c.*, 
      COALESCE(u.user_count, 0) as user_count,
      COALESCE(b.branch_count, 0) as node_count
      FROM companies c
      LEFT JOIN (
        SELECT company_id, COUNT(*) as user_count 
        FROM users 
        GROUP BY company_id
      ) u ON c.id = u.company_id
      LEFT JOIN (
        SELECT company_id, COUNT(*) as branch_count
        FROM branches
        GROUP BY company_id
      ) b ON c.id = b.company_id
      ORDER BY c.name ASC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('[ENTITIES] GET /companies failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- SYSTEM DIAGNOSTICS (For Data Management) ---
router.get('/system/stats', async (req, res) => {
  try {
    // In a production environment, these would query OS/DB metrics
    // For this implementation, we return calculated system health tokens
    res.json({
      storage: {
        used: 12.4,
        total: 50,
        unit: 'GB',
        status: 'Healthy'
      },
      sync: {
        latency: 142,
        unit: 'ms',
        status: 'In Sync',
        lastSync: '2 mins ago'
      },
      backup: {
        status: 'Protected',
        encryption: 'Reli-Vault Active',
        lastBackup: 'Verified'
      },
      distribution: [
        { label: 'Active Sessions', value: 85 },
        { label: 'Historical Data', value: 45 },
        { label: 'User Provisioning', value: 20 },
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/system/backups', async (req, res) => {
  try {
    // Mocking real backup records that would normally come from a 'backups' table
    res.json([
      { id: 'SNAP-2026-001', date: 'May 13, 2026', size: '1.4GB', status: 'verified' },
      { id: 'SNAP-2026-002', date: 'May 12, 2026', size: '1.3GB', status: 'verified' },
      { id: 'SNAP-2026-003', date: 'May 11, 2026', size: '1.2GB', status: 'archived' },
      { id: 'SNAP-2026-004', date: 'May 10, 2026', size: '1.2GB', status: 'archived' },
    ]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/companies', async (req, res) => {
  try {
    const result = await dynamicInsert('companies', req.body);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/companies/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM companies WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- BRANCHES (Full CRUD) ---
// Get branches for a specific company
router.get('/companies/:companyId/branches', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM branches WHERE company_id = $1 ORDER BY name ASC', [req.params.companyId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/branches', async (req, res) => {
  try {
    const result = await dynamicInsert('branches', req.body);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/branches/:id', async (req, res) => {
  try {
    const result = await dynamicUpdate('branches', req.params.id, req.body);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/branches/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM branches WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- JOBS (Full CRUD) ---
router.get('/jobs', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM jobs ORDER BY due_date ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/jobs', async (req, res) => {
  try {
    const result = await dynamicInsert('jobs', req.body);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/jobs/:id', async (req, res) => {
  try {
    const result = await dynamicUpdate('jobs', req.params.id, req.body);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/jobs/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM jobs WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DATA RETENTION (Full CRUD) ---
router.get('/data-retention', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM data_retention ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/data-retention', async (req, res) => {
  try {
    const result = await dynamicInsert('data_retention', req.body);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/data-retention/:id', async (req, res) => {
  try {
    const result = await dynamicUpdate('data_retention', req.params.id, req.body);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GATEWAY CONFIG (Full CRUD) ---
router.get('/gateway-configs', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM gateway_configs ORDER BY node_id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/gateway-configs', async (req, res) => {
  try {
    const result = await dynamicInsert('gateway_configs', req.body);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/gateway-configs/:id', async (req, res) => {
  try {
    const result = await dynamicUpdate('gateway_configs', req.params.id, req.body);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TELEMETRY ALERTS CONFIG (Full CRUD) ---
router.get('/telemetry-alert-configs', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM telemetry_alert_configs ORDER BY type ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/telemetry-alert-configs', async (req, res) => {
  try {
    const result = await dynamicInsert('telemetry_alert_configs', req.body);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/telemetry-alert-configs/:id', async (req, res) => {
  try {
    const result = await dynamicUpdate('telemetry_alert_configs', req.params.id, req.body);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PLATFORM CONFIGS (Full CRUD) ---
router.get('/platform-configs', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM platform_configs ORDER BY key ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/platform-configs', async (req, res) => {
  try {
    const result = await dynamicInsert('platform_configs', req.body);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/platform-configs/:id', async (req, res) => {
  try {
    const result = await dynamicUpdate('platform_configs', req.params.id, req.body);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- USERS & RBAC ---
router.get('/rbac/users', async (req, res) => {
  try {
    const query = `
      SELECT u.*, c.name as company_name, 
      (SELECT json_agg(r.*) FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = u.id) as roles
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      ORDER BY u.name ASC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users/iformAction', async (req, res) => {
  const { form_method, id, role_ids, ...data } = req.body;
  try {
    let user;
    if (form_method === 'save' || !id) {
      const result = await dynamicInsert('users', data);
      user = result.rows[0];
    } else {
      const result = await dynamicUpdate('users', id, data);
      user = result.rows[0];
    }

    // Handle Roles
    if (role_ids && Array.isArray(role_ids)) {
      await db.query('DELETE FROM user_roles WHERE user_id = $1', [user.id]);
      for (const roleId of role_ids) {
        await db.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [user.id, roleId]);
      }
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/rbac/users/:userId/roles', async (req, res) => {
  const { role_ids } = req.body;
  try {
    await db.query('DELETE FROM user_roles WHERE user_id = $1', [req.params.userId]);
    for (const roleId of role_ids) {
      await db.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [req.params.userId, roleId]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/provision-organization', async (req, res) => {
  const { 
    name, 
    registration_number, 
    email, 
    contact_person, 
    modules,
    admin_name,
    admin_email,
    admin_phone,
    password
  } = req.body;

  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Create Company
    const companyQuery = `
      INSERT INTO companies (name, registration_number, email, contact_person, modules, status)
      VALUES ($1, $2, $3, $4, $5, 'active')
      RETURNING *
    `;
    const companyRes = await client.query(companyQuery, [
      name, 
      registration_number, 
      email, 
      contact_person, 
      JSON.stringify(modules || [])
    ]);
    const company = companyRes.rows[0];

    // 2. Create Admin User
    const userQuery = `
      INSERT INTO users (name, email, phone, password, company_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const userRes = await client.query(userQuery, [
      admin_name || name + ' Admin',
      admin_email,
      admin_phone || null,
      password || 'Admin@2025',
      company.id
    ]);
    const user = userRes.rows[0];

    // 3. Assign Role (2 = Company Admin)
    await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [user.id, 2]);

    await client.query('COMMIT');
    res.status(201).json({ success: true, company, user });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[PROVISIONING_ERROR]', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
