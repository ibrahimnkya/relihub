# TRC MGR Hybrid Dashboard — Frontend Development Guide
**Project:** TRC MGR Hybrid Fuel Control & Train Operations Platform  
**Client:** Tanzania Railways Corporation (TRC)  
**Developer:** Hashtech Tanzania Limited  
**Stack:** React + Tailwind CSS + Mock Data (API-ready)  
**SRS Reference:** TRC-MGR-SRS-002-V2.0

---

## Overview

This guide walks Ibrahim (Frontend) through building the full Hashtech MGR dashboard — screen by screen, component by component — using **mock data** that mirrors the exact shape of the real API responses, making the eventual swap seamless.

---

## Recommended Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React 18 (Vite) | Fast dev server, tree-shaking, HMR |
| Styling | Tailwind CSS v3 | Utility-first, matches SRS design speed |
| Routing | React Router v6 | Page navigation + protected routes |
| State | Zustand | Lightweight, replaces Redux for this scale |
| Charts | Recharts | Composable, React-native charting |
| Icons | Lucide React | Clean, consistent icon set |
| Auth State | Zustand + localStorage | Simulate JWT auth; swap for real later |
| HTTP Layer | Axios (service layer) | Pre-configured base URL; mock interceptors |
| Mock Data | `/src/mock/` folder | JSON files that mirror real API shape |

---

## Project Folder Structure

```
src/
├── assets/                  # Logos, images
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx          # Floating sidebar
│   │   ├── Topbar.jsx           # Top navigation bar
│   │   └── PageWrapper.jsx      # Consistent page layout
│   ├── ui/                      # Reusable UI primitives
│   │   ├── StatCard.jsx
│   │   ├── Badge.jsx
│   │   ├── StatusDot.jsx
│   │   ├── FuelGauge.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── AlertRow.jsx
│   │   └── TableBase.jsx
│   └── shared/
│       ├── IncidentFeed.jsx
│       ├── TrainCard.jsx
│       ├── TankCard.jsx
│       └── FlowMeterCard.jsx
├── pages/
│   ├── auth/
│   │   └── LoginPage.jsx
│   ├── dashboard/
│   │   └── CommandCentrePage.jsx    # Page 1
│   ├── trains/
│   │   └── TrainSummaryPage.jsx     # Page 2
│   ├── tanks/
│   │   └── TanksDashboardPage.jsx   # Page 3
│   ├── flow-meters/
│   │   └── FlowMeterPage.jsx        # Page 4
│   ├── fueling-sessions/
│   │   └── FuelingSessionsPage.jsx  # Page 5
│   ├── reconciliation/
│   │   └── ReconciliationPage.jsx   # Page 6
│   └── incidents/
│       └── IncidentDeskPage.jsx     # Page 7
├── mock/
│   ├── auth.mock.js
│   ├── dashboard.mock.js
│   ├── trains.mock.js
│   ├── tanks.mock.js
│   ├── flowMeters.mock.js
│   ├── fuelingSessions.mock.js
│   ├── reconciliation.mock.js
│   └── incidents.mock.js
├── services/
│   ├── api.js                  # Axios instance (swap mock for real)
│   ├── authService.js
│   ├── trainService.js
│   ├── tankService.js
│   ├── flowMeterService.js
│   ├── sessionService.js
│   ├── reconciliationService.js
│   └── incidentService.js
├── store/
│   ├── authStore.js             # Zustand auth state
│   └── appStore.js              # Global UI state (sidebar open, alerts)
├── router/
│   ├── AppRouter.jsx
│   └── ProtectedRoute.jsx
└── App.jsx
```

---

## Phase 1 — Project Bootstrap & Auth

### Step 1.1 — Scaffold the Project

```bash
npm create vite@latest trc-mgr-dashboard -- --template react
cd trc-mgr-dashboard
npm install
npm install react-router-dom zustand axios recharts lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 1.2 — Configure Tailwind

In `tailwind.config.js`, extend the theme with TRC brand colours from the dashboard:

```js
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:    '#1a2341',   // Sidebar / topbar dark blue
          blue:    '#2563eb',   // Primary action blue
          green:   '#16a34a',   // Active / success
          amber:   '#d97706',   // Warning / idle
          red:     '#dc2626',   // Danger / offline / critical
          muted:   '#64748b',   // Muted text
          surface: '#f1f5f9',   // Page background
          card:    '#ffffff',   // Card background
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
}
```

Add Google Fonts to `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Step 1.3 — Auth Store (Zustand)

```js
// src/store/authStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(persist(
  (set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    login: (user, token) => set({ user, token, isAuthenticated: true }),
    logout: () => set({ user: null, token: null, isAuthenticated: false }),
  }),
  { name: 'trc-auth' }
))
```

### Step 1.4 — Auth Mock Data

```js
// src/mock/auth.mock.js
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
```

### Step 1.5 — Login Page

Build `LoginPage.jsx` with:
- Hashtech MGR logo top-left
- Tanzania Railways Corporation branding
- Email + password form
- Role-aware login (show role badge after login)
- Error state for wrong credentials
- On success → navigate to `/dashboard`

**Key design:** Dark navy background, centred card, subtle train-track pattern or geometric texture.

---

## Phase 2 — Layout Shell (Sidebar + Topbar)

This is the most important structural step. Get this right before any pages.

### Step 2.1 — Floating Sidebar

**Behaviour:**
- Fixed position, left side, full height
- Collapsed (icon-only, ~64px wide) by default on smaller screens
- Expanded (~240px wide) on hover or toggle
- Smooth CSS transition on width
- Never pushes content — overlays with backdrop on mobile
- Active route highlighted with left accent bar

**Sidebar Navigation Items:**

```
🏠  Command Centre        → /dashboard
🚂  Trains Summary        → /trains
🛢️  Tanks Dashboard       → /tanks
📊  Flow Meters           → /flow-meters
⛽  Fueling Sessions      → /fueling-sessions
⚖️  Reconciliation        → /reconciliation
🚨  Alerts & Incidents    → /incidents
──────────────────
⚙️  Settings              → /settings   (Technical Admin only)
```

**Component sketch:**

```jsx
// src/components/layout/Sidebar.jsx
// - useLocation() to highlight active route
// - useAuthStore() to conditionally show admin items
// - useState(false) for expanded/collapsed
// - Tooltip on icon-only mode (show label on hover)
// - Bottom section: user avatar, name, role, logout button
```

### Step 2.2 — Topbar

From the dashboard image, the topbar contains:
- **Left:** Hashtech MGR logo + "TRC MGR Hybrid Dashboard" title
- **Centre/Right:** 
  - `Open AkiliApp Tracking` button (blue, primary — role-gated)
  - `Alerts (3)` bell icon with badge count
  - `Admin` user dropdown (name + chevron)
  - Tanzania flag + region selector

**Implementation notes:**
- `canLaunchAkiliApp` from auth store controls the AkiliApp button visibility
- Alerts badge pulls from `appStore` global alert count
- User dropdown: Profile, Switch Role (mock), Logout

### Step 2.3 — Page Wrapper

```jsx
// src/components/layout/PageWrapper.jsx
// Wraps every page with:
// - Consistent padding
// - Page title + breadcrumb
// - Optional "Generate Report" + "View History" action bar (bottom-right)
```

### Step 2.4 — Protected Route

```jsx
// src/router/ProtectedRoute.jsx
import { useAuthStore } from '../store/authStore'
import { Navigate } from 'react-router-dom'

export function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/dashboard" replace />
  return children
}
```

---

## Phase 3 — Reusable UI Components

Build these before any pages. They are used everywhere.

### Component: StatCard

Displays a single KPI with label, value, colour, and optional icon.

```
Props: label, value, color ('green'|'amber'|'red'|'blue'), icon
Used in: Fleet Summary cards (Active 12, Idle 3, Offline 1)
```

### Component: FuelGauge / ProgressBar

Horizontal progress bar with colour thresholds:
- Green: > 50%
- Amber: 25–50%
- Red: < 25%

```
Props: value, max, label, showVariance
Used in: Fuel Overview (Expected vs Actual)
```

### Component: StatusDot

Coloured dot with optional pulse animation for live status.

```
Props: status ('active'|'idle'|'offline'|'fault')
Used in: Flow Meter Status, Train rows, Incident rows
```

### Component: Badge

Pill-shaped label.

```
Props: label, variant ('success'|'warning'|'danger'|'info'|'neutral')
Used in: Session confidence scores, train status, incident severity
```

### Component: AlertRow

Single row in the Incident Desk feed.

```
Props: type ('SPILLAGE'|'SENSOR_FAILURE'|'UNMETERED_FUELING'), 
       message, timestamp, severity
```

### Component: TableBase

Reusable table shell (headers + rows) with:
- Sortable column headers
- Row hover highlight
- Coloured status cells
- Pagination controls

```
Used in: Locomotive Overview, Fueling Sessions, Reconciliation
```

---

## Phase 4 — Pages (Build in This Order)

---

### Page 1 — Command Centre (`/dashboard`)

**SRS Reference:** FR-CMD-001 to FR-CMD-004, Section 13.1 Page 1

**Sections to build (match dashboard image):**

#### A. Fleet Summary Bar
Three `StatCard` components in a row:
```
Active Trains: 12  (green)
Idle Trains:    3  (amber)
Offline Trains: 1  (red)
```

#### B. Fuel Overview Panel (left column)
```
Expected Closing: 54,120 L   → green progress bar
Actual Closing:   53,880 L   → red progress bar
Variance:          -240 L    → red text
Tank composition bar (blue=diesel, green=available, grey=reserved)
```

#### C. Flow Overview Panel (centre)
```
Total Fuel Stock:   132,700 L   (large green number)
Daily Dispensed:      8,450 L   (large black number)
Variance Today:        -220 L   (-2.1%)  (large red number)
Train diagram (visual bar chart of locomotive fuel loads)
```

#### D. Flow Meter Status Panel (right column)
```
Active Meters:       14  (green)
Calib. Due Soon:      2  (amber)
Offline Meters:       1  (red)
```

#### E. Recent Fueling Sessions (left, below Fuel Overview)
```
Train T0434 - 560 L - Matuli Yard - 09:25   ✅
Train T0561 - 720 L - Dodoma Depot - 08:50  ✅
Train T0398 - 610 L - Tabora Station - 07:15 ✅
```

#### F. Incident Desk (right, below Flow Meter Status)
```
🔴 SPILLAGE         - Train T0561 - Under Investigation
🟡 SENSOR FAILURE   - Tank 3B - 3 hrs ago
🔴 UNMETERED FUELING - Train T0427 - 1 day ago
```

#### G. Locomotive Overview Table (bottom)
```
Train ID | Location       | Fuel Level | Status
T0434    | Matuli Yard    | 560 L      | In Transit
T0561    | Dodoma Depot   | 720 L      | Idle - Investigating (red)
T0398    | Tabora Station | 610 L      | In Transit
T0257    | Kisaki Yard    | 1,500 L    | Stopped
```

#### H. Bottom Action Bar
```
[Generate Report]  [View History]
```

**Mock data shape:**
```js
// src/mock/dashboard.mock.js
export const dashboardSummary = {
  fleet: { active: 12, idle: 3, offline: 1 },
  fuel: {
    expectedClosing: 54120,
    actualClosing: 53880,
    variance: -240,
  },
  flow: {
    totalStock: 132700,
    dailyDispensed: 8450,
    varianceToday: -220,
    variancePct: -2.1,
  },
  flowMeters: { active: 14, calibDueSoon: 2, offline: 1 },
  recentSessions: [ ... ],
  incidents: [ ... ],
  locomotives: [ ... ],
}
```

---

### Page 2 — Trains Summary (`/trains`)

**SRS Reference:** FR-TRAIN-H-001 to FR-TRAIN-H-004, Section 13.1 Page 2

**Sections:**
- Filter bar: All / Active / Idle / Offline + search by train ID
- Train cards grid (or table toggle):
  - Train ID, location, online status dot, last seen, speed, ignition, active alerts, fuel level
  - "Open Advanced Tracking" button (AkiliApp handoff — role-gated, logs to AdvancedTrackingLaunchLog)
- Train detail drawer/modal (click any train):
  - Full status breakdown
  - Fuel trend mini-chart (last 24h)
  - Active alerts list
  - "Investigate in AkiliApp" button

**AkiliApp launch pattern (mock):**
```js
// Show a modal: "Launching Advanced Tracking for Train T0561..."
// Log the action (mock) to console / local state
// In production: POST /api/trains/{id}/launch-advanced-tracking
// Then open white-labeled AkiliApp workspace
```

**Mock data shape:**
```js
// src/mock/trains.mock.js
export const trains = [
  {
    id: 'T0434',
    name: 'Locomotive T0434',
    status: 'active',         // active | idle | offline
    location: 'Matuli Yard',
    lastSeen: '2026-03-28T09:25:00Z',
    speed: 0,
    ignition: true,
    fuelLevel: 560,
    fuelCapacity: 3000,
    activeAlerts: 0,
    akiliAppDeviceId: 'dev-434',
    canLaunchTracking: true,
  },
  // ...
]
```

---

### Page 3 — Tanks Dashboard (`/tanks`)

**SRS Reference:** FR-FUEL-001, Section 13.1 Page 3

**Sections:**
- Summary row: Total tanks, tanks in warning, tanks critical
- Tank cards grid (one card per tank):
  - Tank name + site location
  - Fill level gauge (visual + percentage + litres)
  - Capacity (total)
  - Days-to-empty estimate
  - Last reading freshness (timestamp + staleness warning if > 1hr)
  - Active incidents badge
  - Warning/critical threshold indicators
- Tank detail modal on click:
  - 7-day level trend chart (Recharts LineChart)
  - Flow events list
  - Linked flow meters

**Mock data shape:**
```js
// src/mock/tanks.mock.js
export const tanks = [
  {
    id: 'tank-001',
    name: 'Tank A1',
    site: 'Dar es Salaam Depot',
    currentVolume: 45000,
    capacity: 80000,
    fillPct: 56.25,
    warningThreshold: 30,    // %
    criticalThreshold: 15,   // %
    daysToEmpty: 14,
    lastReadingAt: '2026-03-28T09:10:00Z',
    isStale: false,
    activeIncidents: 0,
    linkedFlowMeters: ['fm-001'],
    history: [               // 7-day trend
      { date: '2026-03-22', volume: 72000 },
      // ...
    ]
  },
]
```

---

### Page 4 — Flow Meter Dashboard (`/flow-meters`)

**SRS Reference:** FR-FLOW-001 to FR-FLOW-007, Section 13.1 Page 4

**Sections:**
- Status summary: Active / Calibration Due / Offline / Fault
- Flow meter cards (one per meter):
  - Meter ID + serial
  - Linked tank + site
  - Current flow rate (litres/min) — with pulsing indicator if live
  - Daily total dispensed
  - Shift total
  - Last reading freshness
  - Status badge
- Mismatch alerts panel:
  - List of meters where metered outflow ≠ tank-level drop (variance > threshold)
- Site/day/shift summary table:
  - Rows: Site | Meter | Today Total | Shift Total | Status

**Mock data shape:**
```js
// src/mock/flowMeters.mock.js
export const flowMeters = [
  {
    id: 'fm-001',
    serial: 'TLT-FM-001',
    linkedTankId: 'tank-001',
    linkedSite: 'Dar es Salaam Depot',
    status: 'active',        // active | inactive | fault | calib_due
    currentFlowRate: 0,      // litres/min (0 = not dispensing)
    dailyTotal: 3200,
    shiftTotal: 1100,
    cumulativeVolume: 428500,
    lastReadingAt: '2026-03-28T09:22:00Z',
    mismatched: false,
  },
]
```

---

### Page 5 — Fueling Sessions (`/fueling-sessions`)

**SRS Reference:** FR-SESSION-001 to FR-SESSION-004, Section 13.1 Page 5

**Sections:**
- Filter bar: Status filter (All / Matched / Suspicious / Unmatched) + date range
- Sessions table:
  - Session ID, Train ID, Tank, Flow Meter, Started At, Duration
  - Tank Drop (L), Metered (L), Loco Gain (L)
  - Confidence Score (colour-coded pill):
    - 90–100: Green "Matched"
    - 70–89: Blue "Likely Match"
    - 40–69: Amber "Suspicious"
    - < 40: Red "Unmatched"
  - Status pill
  - Actions: View / Investigate / Override
- Session detail drawer:
  - Signal breakdown: Flow meter ✅/❌, Tank drop ✅/❌, Loco gain ✅/❌, Geofence ✅/❌, Time window ✅/❌
  - Investigation notes (text area — save to mock)
  - Status override dropdown
  - "Open Advanced Tracking" button for related train

**Mock data shape:**
```js
// src/mock/fuelingSessions.mock.js
export const fuelingSessions = [
  {
    id: 'sess-001',
    sourceTankId: 'tank-001',
    targetTrainId: 'T0434',
    flowMeterId: 'fm-001',
    startedAt: '2026-03-28T09:10:00Z',
    endedAt: '2026-03-28T09:25:00Z',
    tankDropLiters: 570,
    meteredLiters: 560,
    locomotiveGainLiters: 555,
    confidenceScore: 94,
    status: 'matched',
    signals: {
      flowMeterPresent: true,
      tankDropPresent: true,
      locomotiveGainPresent: true,
      inRefuelingGeofence: true,
      timeWindowAligned: true,
    },
    investigationNotes: '',
    reviewedBy: null,
    createdByRuleEngine: true,
  },
]
```

---

### Page 6 — Reconciliation Workspace (`/reconciliation`)

**SRS Reference:** FR-RECON-001 to FR-RECON-005, Section 13.1 Page 6

**Sections:**
- Period selector: Today / This Week / Custom date range
- Reconciliation summary card:
  ```
  Opening Stock:         132,700 L
  + Confirmed Inflows:     8,000 L
  − Metered Outflows:      8,450 L
  − Approved Losses:          50 L
  − Est. Evaporation:         80 L
  ─────────────────────────────
  Expected Closing:      132,120 L
  Actual Closing:        131,900 L
  Variance:                 -220 L   (-0.17%)
  ```
- Locomotive consistency table:
  - Train | Metered (L) | Loco Gain (L) | Tank Drop (L) | Variance | Status
- Unmatched sessions list:
  - Sessions without a matched flow event — flagged for review
- Exception table:
  - Variance cases exceeding threshold
- Export actions: CSV | PDF (mock download)

**Mock data shape:**
```js
// src/mock/reconciliation.mock.js
export const reconciliationSummary = {
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
  locomotiveConsistency: [ ... ],
  unmatchedSessions: [ ... ],
  exceptions: [ ... ],
}
```

---

### Page 7 — Alerts & Incident Desk (`/incidents`)

**SRS Reference:** FR-ALERT-001 to FR-ALERT-004, Section 13.1 Page 7

**Sections:**
- Active Alerts panel (top):
  - Severity filter tabs: All / Critical / High / Medium / Low
  - Alert rows: Category icon, severity dot, message, asset, timestamp, status
  - Inline actions: Acknowledge / Assign / Convert to Incident
- Open Incidents table:
  - Incident ID, type, asset, severity, assigned to, created at, status
  - Click to expand: full incident detail
- Incident detail panel / drawer:
  - Description, linked alert, linked asset
  - Timeline of actions (acknowledged, assigned, notes)
  - Investigation notes text area
  - "Open Advanced Tracking" button (for train-related incidents)
  - Close / Resolve button

**Mock data shape:**
```js
// src/mock/incidents.mock.js
export const incidents = [
  {
    id: 'inc-001',
    type: 'SPILLAGE',
    severity: 'critical',
    assetId: 'T0561',
    assetType: 'train',
    message: 'Fuel spillage detected at Dodoma Depot',
    status: 'under_investigation',
    assignedTo: 'usr-003',
    createdAt: '2026-03-28T07:30:00Z',
    notes: '',
    linkedAlertId: 'alert-001',
    canLaunchTracking: true,
  },
]
```

---

## Phase 5 — Services Layer (API-Ready Architecture)

Write all services to use a **single axios instance**, with mock data returned when `VITE_USE_MOCK=true`. When the API is ready, just set `VITE_USE_MOCK=false` and update the base URL.

```js
// src/services/api.js
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export { USE_MOCK }
```

```js
// src/services/trainService.js
import { api, USE_MOCK } from './api'
import { trains } from '../mock/trains.mock'

export const getTrains = async () => {
  if (USE_MOCK) return { data: trains }
  return api.get('/api/trains')
}

export const getTrainById = async (id) => {
  if (USE_MOCK) return { data: trains.find(t => t.id === id) }
  return api.get(`/api/trains/${id}`)
}

export const launchAdvancedTracking = async (trainId) => {
  if (USE_MOCK) {
    console.log(`[MOCK] AkiliApp launch logged for train ${trainId}`)
    return { data: { status: 'success', sessionReference: 'mock-session-123' } }
  }
  return api.post(`/api/trains/${trainId}/launch-advanced-tracking`)
}
```

Follow the same pattern for all other services.

---

## Phase 6 — Polish & Production Readiness

### 6.1 Loading States
- Skeleton loaders for all cards and tables (animated shimmer effect)
- Never show empty state without explanation

### 6.2 Empty States
- When no incidents: "No active incidents. Operational status is normal."
- When no sessions: "No fueling sessions detected in this period."

### 6.3 Error States
- AkiliApp unavailable: Show degraded mode banner — "Advanced tracking data unavailable. Showing cached state."
- API error: Toast notification, never raw error object

### 6.4 Refresh Behaviour
- Command Centre: auto-refresh every 30 seconds (setInterval, cleared on unmount)
- Other pages: manual refresh button + last-refreshed timestamp

### 6.5 Responsive Behaviour
- Sidebar collapses to icon-only on < 1280px
- Sidebar becomes overlay drawer on < 768px (mobile)
- Tables scroll horizontally on small screens
- Cards reflow to single column on mobile

### 6.6 Role-Based UI
Check `user.role` or `user.canLaunchAkiliApp` to:
- Show/hide "Open Advanced Tracking" buttons
- Show/hide Settings nav item
- Show/hide Override controls in sessions
- Show/hide Remote Command section

---

## Build Order Summary

| Sprint | Deliverable | Priority |
|--------|-------------|----------|
| 1 | Project setup + Tailwind + routing shell | 🔴 Critical |
| 2 | Auth (Login page + Zustand store + Protected routes) | 🔴 Critical |
| 3 | Sidebar + Topbar + PageWrapper layout | 🔴 Critical |
| 4 | Reusable UI components (StatCard, Badge, Table, etc.) | 🔴 Critical |
| 5 | Command Centre page (Page 1) with full mock data | 🔴 Critical |
| 6 | Trains Summary page (Page 2) + AkiliApp launch mock | 🟠 High |
| 7 | Tanks Dashboard (Page 3) | 🟠 High |
| 8 | Flow Meter Dashboard (Page 4) | 🟠 High |
| 9 | Fueling Sessions workspace (Page 5) | 🟡 Medium |
| 10 | Reconciliation workspace (Page 6) | 🟡 Medium |
| 11 | Alerts & Incident Desk (Page 7) | 🟡 Medium |
| 12 | Services layer refactor (API-ready) | 🟡 Medium |
| 13 | Loading/error/empty states + responsive polish | 🟢 Polish |
| 14 | RBAC enforcement across all pages | 🟢 Polish |

---

## API Swap Checklist (When Backend is Ready)

When Festus completes the API, the frontend swap requires only:

- [ ] Set `VITE_USE_MOCK=false` in `.env`
- [ ] Set `VITE_API_BASE_URL=https://api.trc-mgr.hashtech.co.tz`
- [ ] Verify each service function against actual API response shape
- [ ] Update mock data shapes if API returns different field names
- [ ] Test auth token flow (JWT header injection)
- [ ] Test AkiliApp launch endpoint response
- [ ] Remove mock import fallbacks from services
- [ ] Run full UAT (Sabina's checklist)

---

*Guide prepared by: Hashtech Tanzania Limited — Frontend Development Reference*  
*Based on SRS v2.0 (TRC-MGR-SRS-002-V2.0) — March 28, 2026*