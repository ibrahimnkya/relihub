const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * REPORTS API
 * Provides analytical data for various organizational assets and entities.
 */

// 1. TANKS REPORT
router.get('/tanks', async (req, res) => {
  try {
    // In a real app, this would aggregate from a 'tank_telemetry' table
    res.json({
      summary: {
        total_tanks: 12,
        total_capacity: 450000,
        current_volume: 382400,
        unit: 'Liters'
      },
      history: [
        { date: '2026-05-10', volume: 410000 },
        { date: '2026-05-11', volume: 405000 },
        { date: '2026-05-12', volume: 398000 },
        { date: '2026-05-13', volume: 390000 },
        { date: '2026-05-14', volume: 382400 }
      ],
      anomalies: [
        { tank_id: 'T-004', issue: 'Sudden Volume Drop', volume: -120, time: '2026-05-14 02:00' }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. BRANCHES REPORT
router.get('/branches', async (req, res) => {
  try {
    const query = `
      SELECT b.name, b.location, 
      COUNT(u.id) as employee_count
      FROM branches b
      LEFT JOIN users u ON b.id = u.company_id -- Simplified for mock
      GROUP BY b.id
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. COMPANIES REPORT
router.get('/companies', async (req, res) => {
  try {
    const result = await db.query('SELECT name, registration_number, status, created_at FROM companies');
    res.json({
      total_active: result.rows.filter(r => r.status === 'active').length,
      list: result.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. FLOW METERS REPORT
router.get('/flow-meters', async (req, res) => {
  try {
    res.json({
      throughput: [
        { meter_id: 'FM-101', total_dispensed: 85400, unit: 'L', status: 'Optimal' },
        { meter_id: 'FM-102', total_dispensed: 12400, unit: 'L', status: 'Calibration Due' }
      ],
      last_calibration: '2026-04-15'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. LOCOMOTIVES REPORT
router.get('/locomotives', async (req, res) => {
  try {
    res.json({
      efficiency: [
        { loco_id: 'TRC-101', consumption_rate: 42.5, unit: 'L/hr', health: 'Excellent' },
        { loco_id: 'TRC-102', consumption_rate: 58.2, unit: 'L/hr', health: 'Needs Maintenance' }
      ],
      total_distance: 14250,
      distance_unit: 'KM'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
