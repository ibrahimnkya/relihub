import { NavLink, useNavigate } from 'react-router-dom'
import { 
  Home, 
  Train, 
  Cylinder, 
  Gauge, 
  Fuel, 
  Scale, 
  AlertTriangle, 
  Settings,
  ShieldCheck,
  LogOut,
  Brain,
  Briefcase
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/appStore'
import { useTranslation } from 'react-i18next'
import { checkHasModule } from '../../utils/modules'

// eslint-disable-next-line no-unused-vars
const SidebarItem = ({ to, icon: Icon, label, collapsed }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center gap-4 px-4 py-2.5 transition-all duration-300
      ${isActive 
        ? 'bg-brand-blue text-white border-l-4 border-brand-hover shadow-lg' 
        : 'text-brand-body hover:bg-black/5 hover:text-brand-heading border-l-4 border-transparent'}
    `}
  >
    <Icon size={18} className={collapsed ? "mx-auto" : ""} />
    {!collapsed && <span className="font-semibold text-sm tracking-wide">{label}</span>}
  </NavLink>
)

const Sidebar = () => {
  const { user, logout } = useAuthStore()
  const collapsed = false // Force expanded
  const { t } = useTranslation()
  const navigate = useNavigate()
  const platformModules = useAppStore(state => state.platformModules)
  const isModuleGloballyEnabled = useAppStore(state => state.isModuleGloballyEnabled)
  
  const getRoleString = () => {
    if (!user?.role && !user?.roles && !user?.role_name) return ''
    
    // Handle single role object or string
    if (typeof user.role === 'string') return user.role
    if (user.role?.name) return user.role.name
    if (user.role?.slug) return user.role.slug
    
    // Handle roles array (common in RBAC)
    if (Array.isArray(user.roles) && user.roles.length > 0) {
      return user.roles[0].name || user.roles[0].slug || ''
    }
    
    return user.role_name || ''
  }

  const roleStringFull = (getRoleString() || user?.name || user?.full_name || '').toLowerCase()
  const isAdmin = roleStringFull.includes('admin') || 
                  roleStringFull.includes('super') ||
                  roleStringFull.includes('technical') ||
                  roleStringFull.includes('system') ||
                  (Array.isArray(user?.roles) && user.roles.some(r => r.slug?.includes('admin') || r.name?.toLowerCase().includes('admin')))

  const displayName = user?.name || user?.full_name || user?.username || 'Authorized User'
  const displayRole = getRoleString() || 'System Operator'
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/dashboard', icon: Home, label: t('Nav.dashboard') }, // Operations Hub (always visible)
    { to: '/tanks', icon: Cylinder, label: t('Nav.tanks'), module: 'tanks' }, // Storage & Inventory
    { to: '/flow-meters', icon: Gauge, label: t('Nav.meters'), module: 'meters' }, // Flow Meters
    { to: '/fueling-sessions', icon: Fuel, label: t('Nav.sessions'), module: 'fueling' }, // Fueling Sessions
    { divider: true },
    { to: '/incidents', icon: AlertTriangle, label: t('Nav.alerts'), module: 'incidents' }, // Incident Desk
    { to: '/admin/users', icon: ShieldCheck, label: 'User Access Control', adminOnly: true } // User Access Control
  ]

  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false
    if (!item.module) return true
    
    // Check global platform status first
    if (!isModuleGloballyEnabled(item.module)) return false
    
    // Then check user permissions
    return checkHasModule(user, item.module)
  })

  return (
    <aside 
      className={`
        fixed left-0 top-0 h-full bg-brand-card border-r border-brand-border z-50 transition-all duration-500 ease-in-out flex flex-col shadow-sm
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Sidebar Header */}
      <div className="flex items-center p-4 h-20 border-b border-brand-border justify-center">
        <div className="flex items-center transition-all duration-500 overflow-hidden w-36">
          <img 
            src="/logo.png" 
            alt="ReliHub" 
            className="transition-all duration-500 object-contain h-full w-full"
          />
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {filteredNavItems.map((item, index) => item.divider ? (
          <div key={`div-${index}`} className="my-2 border-t border-brand-border/50 mx-4"></div>
        ) : (
          <SidebarItem 
            key={item.to} 
            {...item} 
            collapsed={collapsed} 
          />
        ))}
      </nav>

      <div className="p-4 border-t border-brand-border bg-brand-surface mt-auto">
        <div className={`flex ${collapsed ? 'flex-col items-center gap-4' : 'items-center gap-3'}`}>
          <div className="h-10 w-10 rounded-[12px] bg-brand-blue text-white flex items-center justify-center font-black text-xs shadow-lg shadow-brand-blue/20 shrink-0 border border-brand-blue/30 uppercase">
            {initials}
          </div>
          
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-brand-green animate-pulse"></div>
                <p className="text-xs font-black text-black truncate uppercase tracking-tight">
                  {displayName}
                </p>
              </div>
              <p className="text-[10px] text-brand-body font-bold uppercase tracking-widest opacity-60 truncate">
                {displayRole}
              </p>
            </div>
          )}
          
          <button 
            onClick={handleLogout}
            className="p-2.5 text-brand-body hover:text-brand-red hover:bg-brand-red/10 rounded-[12px] transition-all shadow-sm group"
            title="Logout"
          >
            <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
