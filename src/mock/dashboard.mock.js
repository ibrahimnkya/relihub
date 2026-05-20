export const DASHBOARD_STATS = {
  activeTrains: 12,
  idleTrains: 3,
  offlineTrains: 1,
  totalFuelUsed: 14500,
  totalFuelRefilled: 12000,
  systemConfidence: 94.5,
  activeAlerts: 4,
}

export const FUEL_OVERVIEW = [
  { label: 'Expected Dispensed', value: 8500, max: 10000, unit: 'L' },
  { label: 'Actual Metered', value: 8450, max: 10000, unit: 'L' },
  { label: 'Loco Gain Detected', value: 8200, max: 10000, unit: 'L' },
]

export const RECENT_SESSIONS = [
  {
    id: 'S-2026-001',
    train: 'T0434',
    tank: 'T-A1',
    metered: 560,
    gain: 555,
    status: 'matched',
    confidence: 94,
    time: '10 mins ago'
  },
  {
    id: 'S-2026-002',
    train: 'T0512',
    tank: 'T-B2',
    metered: 1200,
    gain: 1180,
    status: 'matched',
    confidence: 92,
    time: '45 mins ago'
  },
  {
    id: 'S-2026-003',
    train: 'T0434',
    tank: 'T-A1',
    metered: 450,
    gain: 320,
    status: 'suspicious',
    confidence: 65,
    time: '1 hr ago'
  },
]

export const INCIDENT_FEED = [
  {
    id: 'INC-001',
    type: 'SPILLAGE',
    asset: 'T0561',
    severity: 'critical',
    message: 'High variance detected at Dodoma Depot',
    time: '2 hrs ago'
  },
  {
    id: 'INC-002',
    type: 'SENSOR_FAILURE',
    asset: 'FM-001',
    severity: 'high',
    message: 'Flow meter FM-001 reported heartbeat failure',
    time: '4 hrs ago'
  },
]

export const LOCO_OVERVIEW = [
  { id: 'T0434', location: 'Matuli Yard', speed: 0, fuel: 560, status: 'active' },
  { id: 'T0512', location: 'Dar Depot', speed: 12, fuel: 1200, status: 'active' },
  { id: 'T0561', location: 'Dodoma', speed: 0, fuel: 450, status: 'idle' },
  { id: 'T0601', location: 'Mwanza', speed: 45, fuel: 2100, status: 'active' },
  { id: 'T0321', location: 'Tabora', speed: 0, fuel: 150, status: 'offline' },
]
