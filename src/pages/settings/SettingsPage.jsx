import { 
  Shield, 
  Bell, 
  Database, 
  Settings as SettingsIcon, 
  Key, 
  Globe,
  Settings2,
  Lock
} from 'lucide-react'
import BasePortalPage from '../../components/shared/BasePortalPage'

// Import Subpages
import GeneralSettings from './components/GeneralSettings'
import SecuritySettings from './components/SecuritySettings'
import AlertSettings from './components/AlertSettings'
import DataSettings from './components/DataSettings'
import ApiKeys from './components/ApiKeys'
import LocalizationSettings from './components/LocalizationSettings'

const SettingsPage = ({ activeTab }) => {
  const SECTIONS = [
    { 
      id: 'general', 
      icon: SettingsIcon, 
      label: 'Platform Management', 
      sub: 'Modules & Maintenance',
      component: GeneralSettings 
    },
    { 
      id: 'security', 
      icon: Shield, 
      label: 'User Management', 
      sub: 'RBAC & Identity Vault',
      component: SecuritySettings 
    },
    { 
      id: 'notifications', 
      icon: Bell, 
      label: 'Telemetry Alerts', 
      sub: 'Warning Thresholds',
      component: AlertSettings 
    },
    { 
      id: 'data', 
      icon: Database, 
      label: 'Data Management', 
      sub: 'Retention & Recovery',
      component: DataSettings 
    },
    { 
      id: 'api', 
      icon: Key, 
      label: 'Gateway API', 
      sub: 'Endpoint Integration',
      component: ApiKeys 
    },
    { 
      id: 'localization', 
      icon: Globe, 
      label: 'Regional Config', 
      sub: 'Spatial & Time Nodes',
      component: LocalizationSettings 
    },
  ]

  const sidebarFooter = (
    <div className="p-6 bg-brand-navy-light/30 rounded-[20px] border border-brand-border/50">
      <div className="flex items-center gap-2 mb-4">
        <Lock size={14} className="text-brand-blue" />
        <h4 className="text-[10px] font-black text-brand-heading uppercase tracking-widest opacity-40">Security Profile</h4>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black text-brand-body uppercase">Encryption</span>
          <span className="text-[10px] font-black text-brand-green uppercase">Enabled</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black text-brand-body uppercase">Token Lifecycle</span>
          <span className="text-[10px] font-black text-brand-blue uppercase">24H</span>
        </div>
      </div>
    </div>
  )

  return (
    <BasePortalPage 
      title="System Settings"
      subtitle="Global Network Node Configuration & Parameters"
      icon={Settings2}
      sections={SECTIONS}
      sidebarFooter={sidebarFooter}
      initialTabId={activeTab}
    />
  )
}

export default SettingsPage
