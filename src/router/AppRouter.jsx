import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import Layout from '../components/layout/Layout'

// Pages
import LoginPage from '../pages/auth/LoginPage'
import CommandCentrePage from '../pages/dashboard/CommandCentrePage'
import TrainSummaryPage from '../pages/trains/TrainSummaryPage'
import TanksDashboardPage from '../pages/tanks/TanksDashboardPage'
import FlowMeterPage from '../pages/flow-meters/FlowMeterPage'
import FuelingSessionsPage from '../pages/fueling-sessions/FuelingSessionsPage'
import ReconciliationPage from '../pages/reconciliation/ReconciliationPage'
import IncidentDeskPage from '../pages/incidents/IncidentDeskPage'
import JobsPage from '../pages/jobs/JobsPage'
import SettingsPage from '../pages/settings/SettingsPage'
import OrganizationManagement from '../pages/admin/components/OrganizationManagement'
import UserManagement from '../pages/settings/components/UserManagement'
import GeneralSettings from '../pages/settings/components/GeneralSettings'
import AdminLogs from '../pages/admin/components/AdminLogs'
import ReliIQ from '../pages/ai/ReliIQ'

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<CommandCentrePage />} />
            <Route path="/trains" element={<TrainSummaryPage />} />
            <Route path="/tanks" element={<TanksDashboardPage />} />
            <Route path="/flow-meters" element={<FlowMeterPage />} />
            <Route path="/fueling-sessions" element={<FuelingSessionsPage />} />
            <Route path="/reconciliation" element={<ReconciliationPage />} />
            <Route path="/incidents" element={<IncidentDeskPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/reli-iq" element={<ReliIQ />} />
            <Route path="/admin" element={<Navigate to="/admin/companies" replace />} />
            <Route path="/admin/companies" element={<OrganizationManagement />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/platform" element={<GeneralSettings />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
