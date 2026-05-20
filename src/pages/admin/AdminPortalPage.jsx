import { 
  Shield, 
  Building2, 
  Terminal,
  LayoutGrid,
  Fingerprint,
  Settings
} from 'lucide-react'
import BasePortalPage from '../../components/shared/BasePortalPage'
import UserManagement from '../settings/components/UserManagement'
import OrganizationManagement from './components/OrganizationManagement'
import AdminLogs from './components/AdminLogs'
import GeneralSettings from '../settings/components/GeneralSettings'

const AdminPortalPage = ({ activeTab }) => {
  const SECTIONS = [
    { 
      id: 'companies', 
      icon: Building2, 
      label: 'Organization Setup', 
      sub: 'Company & Branch Management',
      component: OrganizationManagement
    },
    { 
      id: 'users', 
      icon: Shield, 
      label: 'User Access Control', 
      sub: 'Permissions & Roles',
      component: UserManagement
    },
    { 
      id: 'platform', 
      icon: Settings, 
      label: 'Platform Settings', 
      sub: 'Module Deployment',
      component: GeneralSettings
    },
    { 
      id: 'logs', 
      icon: Terminal, 
      label: 'Activity History', 
      sub: 'Audit Trail',
      component: AdminLogs
    },
  ]

  const sidebarFooter = (
    <div className="p-6 bg-brand-navy-light/30 rounded-[20px] border border-brand-border/50">
      <h4 className="text-[10px] font-black text-brand-heading uppercase tracking-widest mb-4 opacity-40">System Status</h4>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black text-brand-body uppercase">Authentication</span>
          <span className="text-[10px] font-black text-brand-green uppercase">Stable</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black text-brand-body uppercase">Security</span>
          <span className="text-[10px] font-black text-brand-blue uppercase">Encrypted</span>
        </div>
      </div>
    </div>
  )

  return (
    <BasePortalPage 
      title="Admin Center"
      subtitle="System Configuration & Management"
      icon={Fingerprint}
      sections={SECTIONS}
      sidebarFooter={sidebarFooter}
      initialTabId={activeTab}
    />
  )
}

export default AdminPortalPage
