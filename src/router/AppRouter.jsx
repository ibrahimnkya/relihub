import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import Layout from '../components/layout/Layout'

// Pages
import LoginPage from '../pages/auth/LoginPage'
import CommandCentrePage from '../pages/dashboard/CommandCentrePage'
import TanksDashboardPage from '../pages/tanks/TanksDashboardPage'
import FlowMeterPage from '../pages/flow-meters/FlowMeterPage'
import FuelingSessionsPage from '../pages/fueling-sessions/FuelingSessionsPage'
import IncidentDeskPage from '../pages/incidents/IncidentDeskPage'
import SettingsPage from '../pages/settings/SettingsPage'
import UserManagement from '../pages/settings/components/UserManagement'

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<CommandCentrePage />} />
            <Route path="/tanks" element={<TanksDashboardPage />} />
            <Route path="/flow-meters" element={<FlowMeterPage />} />
            <Route path="/fueling-sessions" element={<FuelingSessionsPage />} />
            <Route path="/incidents" element={<IncidentDeskPage />} />
            
            {/* User Access Control - Shipped Admin Feature */}
            <Route path="/admin/users" element={<UserManagement />} />
            
            {/* Settings Page */}
            <Route path="/settings" element={<SettingsPage />} />

            {/* Redirect unshipped / dev features to dashboard */}
            <Route path="/trains" element={<Navigate to="/dashboard" replace />} />

            <Route path="/reconciliation" element={<Navigate to="/dashboard" replace />} />
            <Route path="/jobs" element={<Navigate to="/dashboard" replace />} />
            <Route path="/reli-iq" element={<Navigate to="/dashboard" replace />} />
            <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
            <Route path="/admin/companies" element={<Navigate to="/dashboard" replace />} />
            <Route path="/admin/platform" element={<Navigate to="/dashboard" replace />} />
            <Route path="/admin/logs" element={<Navigate to="/dashboard" replace />} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
