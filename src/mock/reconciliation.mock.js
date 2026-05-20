export const RECONCILIATION_SUMMARY = {
  period: 'today',
  openingStock: 132700,
  confirmedInflows: 8000,
  meteredOutflows: 8450,
  approvedLosses: 50,
  estimatedEvaporation: 80,
  expectedClosing: 132120,
  actualClosing: 131900,
  variance: -220,
  variancePct: -0.17,
  locomotiveConsistency: [
    { train: 'T0434', metered: 560, gain: 555, drop: 570, variance: -5, status: 'ok' },
    { train: 'T0512', metered: 1200, gain: 1180, drop: 1250, variance: -20, status: 'warning' },
    { train: 'T0601', metered: 2100, gain: 2050, drop: 2200, variance: -50, status: 'warning' },
  ],
  unmatchedSessions: [
    { id: 'sess-un-001', type: 'Flow without Tank Drop', volume: 450, time: '2026-04-04T11:20:00Z' },
  ],
  exceptions: [
    { id: 'exc-001', asset: 'Tank A1', type: 'Unexpected Drop', volume: 15, time: '2026-04-04T02:00:00Z' },
  ],
}
