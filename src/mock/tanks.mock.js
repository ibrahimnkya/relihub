export const TANKS = [
  {
    id: 'tank-001',
    name: 'Main Tank A1',
    site: 'Dar es Salaam Depot',
    currentVolume: 45000,
    capacity: 80000,
    fillPct: 56.25,
    warningThreshold: 30,    // %
    criticalThreshold: 15,   // %
    daysToEmpty: 14,
    lastReadingAt: '2026-04-04T14:10:00Z',
    isStale: false,
    activeIncidents: 0,
    linkedFlowMeters: ['fm-001', 'fm-002'],
    history: [               // 7-day trend
      { date: '2026-03-29', volume: 72000 },
      { date: '2026-03-30', volume: 68000 },
      { date: '2026-03-31', volume: 65000 },
      { date: '2026-04-01', volume: 60000 },
      { date: '2026-04-02', volume: 55000 },
      { date: '2026-04-03', volume: 50000 },
      { date: '2026-04-04', volume: 45000 },
    ]
  },
  {
    id: 'tank-002',
    name: 'Reserve Tank B2',
    site: 'Dodoma Station',
    currentVolume: 12000,
    capacity: 60000,
    fillPct: 20,
    warningThreshold: 30,
    criticalThreshold: 15,
    daysToEmpty: 4,
    lastReadingAt: '2026-04-04T14:45:00Z',
    isStale: false,
    activeIncidents: 1,
    linkedFlowMeters: ['fm-003'],
    history: [
      { date: '2026-04-04', volume: 12000 },
    ]
  },
  {
    id: 'tank-003',
    name: 'Depot Tank C1',
    site: 'Mwanza Yard',
    currentVolume: 5000,
    capacity: 50000,
    fillPct: 10,
    warningThreshold: 30,
    criticalThreshold: 15,
    daysToEmpty: 1,
    lastReadingAt: '2026-04-04T08:00:00Z',
    isStale: true,
    activeIncidents: 0,
    linkedFlowMeters: ['fm-004'],
    history: [
      { date: '2026-04-04', volume: 5000 },
    ]
  },
]
