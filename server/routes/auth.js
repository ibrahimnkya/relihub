const express = require('express');
const router = express.Router();
const db = require('../db');

// --- AUTH (Login/Logout) ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Find user and their roles/company
    const query = `
      SELECT u.*, c.name as company_name, c.modules as company_modules
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      WHERE u.email = $1 AND u.password = $2
    `;
    const result = await db.query(query, [email, password]);

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // 2. Fetch roles
    const rolesQuery = `
      SELECT r.* 
      FROM roles r
      JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1
    `;
    const rolesResult = await db.query(rolesQuery, [user.id]);
    user.roles = rolesResult.rows;

    // Remove password from response
    delete user.password;

    res.json({
      user,
      token: `dev-token-${user.id}-${Date.now()}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/logout', (req, res) => {
  res.json({ success: true });
});

module.exports = router;
