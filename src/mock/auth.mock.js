export const MOCK_USERS = [
  {
    id: 'usr-001',
    name: 'Admin User',
    email: 'admin@trc.go.tz',
    password: 'admin123',          // mock only — never real passwords
    role: 'Technical Admin',
    avatar: null,
    canLaunchAkiliApp: true,
  },
  {
    id: 'usr-002',
    name: 'Fuel Controller',
    email: 'fuel@trc.go.tz',
    password: 'fuel123',
    role: 'Fuel Controller',
    avatar: null,
    canLaunchAkiliApp: false,
  },
  {
    id: 'usr-003',
    name: 'Ops Controller',
    email: 'ops@trc.go.tz',
    password: 'ops123',
    role: 'Operations Controller',
    avatar: null,
    canLaunchAkiliApp: true,
  },
]
