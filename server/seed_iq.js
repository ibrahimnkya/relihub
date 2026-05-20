const db = require('./db');

async function seed() {
  try {
    console.log('--- SEEDING RELI-IQ DATA ---');

    // Clear existing (optional)
    await db.query('DELETE FROM incidents');
    await db.query('DELETE FROM alerts');

    // Seed Incidents (Anomalies)
    const incidents = [
      { title: 'Telemetry Spiking', description: 'Node ID 402 showing abnormal fuel variance in Branch A.', severity: 'high', status: 'open' },
      { title: 'Hardware Latency', description: 'Gateway 12 response time exceeded 500ms.', severity: 'medium', status: 'open' },
      { title: 'Unauthorized Access', description: 'Multiple failed PIN attempts on Terminal 04.', severity: 'critical', status: 'open' },
      { title: 'Sensor Drift', description: 'Calibration variance detected on Tank 01 sensors.', severity: 'low', status: 'resolved' },
      { title: 'Rapid Depletion', description: 'Consumption rate 3x higher than historical average in Zone B.', severity: 'high', status: 'open' }
    ];

    for (const inc of incidents) {
      await db.query(
        'INSERT INTO incidents (title, description, severity, status, created_at) VALUES ($1, $2, $3, $4, NOW() - (random() * interval \'24 hours\'))',
        [inc.title, inc.description, inc.severity, inc.status]
      );
    }

    // Seed Alerts (Learning Inputs)
    const alerts = [
      { type: 'AI_THRESHOLD', message: 'Pattern recognition updated for Route 12.', status: 'unread' },
      { type: 'SYSTEM_SYNC', message: 'Neural weights synchronized across regional nodes.', status: 'unread' },
      { type: 'ANOMALY_LOG', message: 'High confidence match for historical theft pattern.', status: 'unread' }
    ];

    for (const al of alerts) {
      await db.query(
        'INSERT INTO alerts (type, message, status) VALUES ($1, $2, $3)',
        [al.type, al.message, al.status]
      );
    }

    console.log('SEEDING COMPLETE');
    process.exit(0);
  } catch (err) {
    console.error('SEEDING FAILED:', err);
    process.exit(1);
  }
}

seed();
