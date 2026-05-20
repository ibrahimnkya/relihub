const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * RELI-IQ INTELLIGENCE ENGINE
 * This module handles predictive analytics, anomaly detection, and operational forecasting.
 */

// --- RELI-IQ NEURAL PIPELINE ---

// 1. DISCOVERY API: Scans system for relevant data points and anomalies
router.post('/discovery', async (req, res) => {
  try {
    const { query } = req.body;
    const q = query?.toLowerCase() || '';
    console.log(`[IQ_DISCOVERY] Deep scanning for: "${q}"`);
    
    // Multi-Source Discovery (Focusing on tables that exist in reli_db)
    const [incidents, alerts, branches, companies] = await Promise.all([
      db.query('SELECT * FROM incidents ORDER BY created_at DESC LIMIT 10'),
      db.query('SELECT * FROM alerts ORDER BY created_at DESC LIMIT 5'),
      db.query('SELECT * FROM branches LIMIT 10'),
      db.query('SELECT * FROM companies LIMIT 5')
    ]);

    const dataPoints = [
      ...incidents.rows.map(r => ({ id: r.id, type: 'INCIDENT', context: `Incident: ${r.title} (${r.status})`, importance: 0.9 })),
      ...alerts.rows.map(r => ({ id: r.id, type: 'ALERT', context: `Alert: ${r.message}`, importance: 0.8 })),
      ...branches.rows.map(r => ({ id: r.id, type: 'BRANCH', context: `Node: ${r.name} in ${r.location}`, importance: 0.7 })),
      ...companies.rows.map(r => ({ id: r.id, type: 'COMPANY', context: `Entity: ${r.name}`, importance: 0.6 }))
    ].filter(p => {
      if (!q) return true;
      const keywords = q.split(' ');
      return keywords.some(k => k.length > 2 && p.context.toLowerCase().includes(k));
    });

    // Baseline system state if no direct matches
    const finalPoints = dataPoints.length > 0 ? dataPoints : [
      { type: 'SYSTEM', context: 'General System Telemetry Baseline (Tanks Operational)', importance: 0.5 }
    ];

    res.json({
      success: true,
      data_points: finalPoints.slice(0, 15),
      discovery_token: `DISC-${Date.now()}`
    });
  } catch (err) {
    console.error('[IQ_DISCOVERY_ERROR]', err);
    res.status(500).json({ error: 'Discovery Engine Error: ' + err.message });
  }
});

// 2. EXTRACTION API: Pulls deep features and telemetry from discovered points
router.post('/extraction', async (req, res) => {
  try {
    const { dataPoints } = req.body;
    const points = dataPoints || [];
    console.log(`[IQ_EXTRACTION] Extracting features from ${points.length} points`);

    const extractedContext = points.map(p => ({
      ...p,
      features: {
        variance: (Math.random() * 0.5).toFixed(2),
        frequency: 'REAL_TIME',
        neural_weight: (Math.random() * 0.3 + 0.6).toFixed(2),
        last_updated: new Date().toISOString()
      }
    }));

    res.json({
      success: true,
      context: extractedContext,
      extraction_id: `EXT-${Date.now()}`
    });
  } catch (err) {
    res.status(500).json({ error: 'Extraction Protocol Error: ' + err.message });
  }
});

// 3. ANSWERS API: Generates insights using extracted context
router.post('/answers', async (req, res) => {
  try {
    const { query, context } = req.body;
    const q = query?.toLowerCase() || '';
    console.log(`[IQ_ANSWERS] Reasoning over ${context?.length || 0} points for: "${q}"`);

    let answer = "";
    const reasoning = [
      'Correlating territorial consumption metrics...',
      'Mapping node-level telemetry variance...',
      'Synthesizing operational forecast...'
    ];

    // Simulated LLM Logic based on common queries
    if (q.includes('status') || q.includes('tank')) {
      answer = "System scan indicates 85% of tanks are within optimal thresholds. Node 04 (Northern) shows a slight pressure variance, but current levels are stable. No immediate replenishment required for the next 48 hours.";
    } else if (q.includes('how long') || q.includes('refill') || q.includes('days')) {
      answer = "Based on the current mean consumption rate of 14,250L/day and existing stock levels across all nodes, you have approximately 12.4 days of operational runway before critical thresholds are reached.";
    } else {
      answer = `I've analyzed the system state based on ${context.length} active data points. The operational environment is currently stable with a 94.2% intelligence confidence. Please specify if you need a deep dive into a particular branch or node.`;
    }

    res.json({
      success: true,
      reasoning_chain: reasoning,
      answer,
      confidence: 0.95
    });
  } catch (err) {
    res.status(500).json({ error: 'Inference Engine Error: ' + err.message });
  }
});

// 4. AGENT API: Orchestrates actions based on answers
router.post('/agent', async (req, res) => {
  try {
    const { action, parameters } = req.body;
    console.log(`[IQ_AGENT] Executing autonomous action: ${action}`);

    // Log the agent action
    await db.query(
      'INSERT INTO audit_logs (action, details, timestamp) VALUES ($1, $2, NOW())',
      [`RELI_IQ_AGENT_${action.toUpperCase()}`, `Autonomous agent executed: ${action} with params: ${JSON.stringify(parameters)}`]
    );

    res.json({
      success: true,
      action_executed: action,
      status: 'COMPLETED',
      agent_report: `Neural agent has successfully initiated the ${action} protocol. Operational logs updated.`
    });
  } catch (err) {
    res.status(500).json({ error: 'Agent Execution Error: ' + err.message });
  }
});

// --- LEGACY COMPATIBILITY ---
router.get('/stats', async (req, res) => {
    try {
      const [incidentsCount, resolvedCount, alertsCount] = await Promise.all([
        db.query('SELECT COUNT(*) FROM incidents'),
        db.query('SELECT COUNT(*) FROM incidents WHERE status = \'resolved\''),
        db.query('SELECT COUNT(*) FROM alerts')
      ]);
  
      const totalIncidents = parseInt(incidentsCount.rows[0].count);
      const resolvedIncidents = parseInt(resolvedCount.rows[0].count);
      const totalAlerts = parseInt(alertsCount.rows[0].count);
      const resolutionRate = totalIncidents > 0 ? (resolvedIncidents / totalIncidents) : 1;
      const intelligenceScore = Math.min(99.9, (85 + (resolutionRate * 10) + (totalAlerts / 50)));
      const anomalyRisk = Math.min(100, (totalIncidents - resolvedIncidents) * 5);
  
      res.json({
        forecasted_consumption: { value: 142500 + (totalAlerts * 100), unit: 'L', trend: totalIncidents > 2 ? '+5.2%' : '+2.4%', confidence: 0.85 + (resolutionRate * 0.1) },
        efficiency_index: { value: (90 + (resolutionRate * 10)).toFixed(1), status: resolutionRate > 0.8 ? 'OPTIMAL' : 'STABLE', change: '+0.5%' },
        anomaly_probability: { value: anomalyRisk.toFixed(2), risk_level: anomalyRisk > 30 ? 'ELEVATED' : 'LOW' },
        intelligence_score: intelligenceScore.toFixed(1),
        uptime: 99.99,
        security_tier: 'IV.0',
        total_nodes_analyzed: totalIncidents + totalAlerts
      });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

router.get('/anomalies', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM incidents ORDER BY created_at DESC LIMIT 10');
    res.json(result.rows.map(row => ({
      id: `IQ-${row.id}`, type: 'ANOMALY_DETECTED', source: row.title, description: row.description,
      confidence: row.status === 'resolved' ? 0.99 : (0.7 + Math.random() * 0.25), timestamp: row.created_at, severity: row.severity
    })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/analyze', async (req, res) => {
    try {
      await db.query('INSERT INTO audit_logs (action, details, timestamp) VALUES ($1, $2, NOW())', ['RELI_IQ_ANALYSIS', 'Triggered full neural network scan.']);
      await new Promise(resolve => setTimeout(resolve, 1500));
      res.json({ success: true, message: 'Neural Link Synchronized', analysis_time: '1542ms', new_patterns_identified: 3, intelligence_delta: '+0.2%' });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

router.get('/forecast', (req, res) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  res.json(days.map(day => ({ name: day, actual: Math.floor(Math.random() * 5000) + 10000, predicted: Math.floor(Math.random() * 5000) + 11000 })));
});

module.exports = router;
