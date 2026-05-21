import { useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Home, Cylinder, Gauge, Fuel, AlertTriangle, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/appStore'
import { useTranslation } from 'react-i18next'
import { checkHasModule } from '../../utils/modules'

const SidebarItem = ({ to, icon: Icon, label, collapsed, onNavigate }) => (
  <NavLink
    to={to}
    onClick={onNavigate}
    className={({ isActive }) => `
      flex items-center gap-4 px-4 py-2.5 transition-all duration-300
      ${isActive
        ? 'bg-brand-blue text-white border-l-4 border-brand-hover shadow-lg'
        : 'text-brand-body hover:bg-black/5 hover:text-brand-heading border-l-4 border-transparent'}
    `}
  >
    <Icon size={18} className={collapsed ? 'mx-auto' : ''} />
    <span className={`font-semibold text-sm tracking-wide ${collapsed ? 'lg:hidden' : ''}`}>{label}</span>
  </NavLink>
)

const Sidebar = () => {
  const { user, logout } = useAuthStore()
  const collapsed = useAppStore((state) => state.sidebarCollapsed)
  const mobileMenuOpen = useAppStore((state) => state.mobileMenuOpen)
  const closeMobileMenu = useAppStore((state) => state.closeMobileMenu)
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const isModuleGloballyEnabled = useAppStore((state) => state.isModuleGloballyEnabled)

  useEffect(() => {
    closeMobileMenu()
  }, [location.pathname, closeMobileMenu])

  const getRoleString = () => {
    if (!user?.role && !user?.roles && !user?.role_name) return ''
    if (typeof user.role === 'string') return user.role
    if (user.role?.name) return user.role.name
    if (user.role?.slug) return user.role.slug
    if (Array.isArray(user.roles) && user.roles.length > 0) {
      return user.roles[0].name || user.roles[0].slug || ''
    }
    return user.role_name || ''
  }

  const displayName = user?.name || user?.full_name || user?.username || 'Authorized User'
  const displayRole = getRoleString() || 'System Operator'
  const initials = displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  const handleLogout = () => {
    closeMobileMenu()
    logout()
    navigate('/login')
  }

  const handleNavClick = () => closeMobileMenu()

  const navItems = [
    { to: '/dashboard', icon: Home, label: t('Nav.dashboard') },
    { to: '/tanks', icon: Cylinder, label: t('Nav.tanks'), module: 'tanks' },
    { to: '/flow-meters', icon: Gauge, label: t('Nav.meters'), module: 'meters' },
    { to: '/fueling-sessions', icon: Fuel, label: t('Nav.sessions'), module: 'fueling' },
    { divider: true },
    { to: '/incidents', icon: AlertTriangle, label: t('Nav.alerts'), module: 'incidents' },
  ]

  const filteredNavItems = navItems.filter((item) => {
    if (!item.module) return true
    if (!isModuleGloballyEnabled(item.module)) return false
    return checkHasModule(user, item.module)
  })

  return (
    <>
      {mobileMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[2px] lg:hidden"
          aria-label="Close navigation menu"
          onClick={closeMobileMenu}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-full flex-col border-r border-brand-border bg-brand-card shadow-lg
          transition-transform duration-300 ease-in-out
          w-64 max-w-[85vw]
          -translate-x-full lg:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : ''}
          ${collapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        <div className="flex items-center p-4 h-20 border-b border-brand-border">
          <div className="flex items-center transition-all duration-500 overflow-hidden w-36">
            <img
              src="/logo.png"
              alt="ReliHub"
              className="transition-all duration-500 object-contain h-full w-full"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar">
          {filteredNavItems.map((item, index) =>
            item.divider ? (
              <div key={`div-${index}`} className="my-2 mx-4 border-t border-brand-border/50" />
            ) : (
              <SidebarItem
                key={item.to}
                {...item}
                collapsed={collapsed}
                onNavigate={handleNavClick}
              />
            )
          )}
        </nav>

        <div className="mt-auto border-t border-brand-border bg-brand-surface p-4">
          <div
            className={`flex ${collapsed ? 'lg:flex-col lg:items-center lg:gap-4' : 'items-center gap-3'}`}
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] border border-brand-blue/30 bg-brand-blue text-xs font-black uppercase text-white shadow-lg shadow-brand-blue/20">
              {initials}
            </div>

            <div className={`min-w-0 flex-1 ${collapsed ? 'lg:hidden' : ''}`}>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-brand-green" />
                  <p className="truncate text-xs font-black uppercase tracking-tight text-black">
                    {displayName}
                  </p>
                </div>
                <p className="truncate text-[10px] font-bold uppercase tracking-widest text-brand-body opacity-60">
                  {displayRole}
                </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="group rounded-[12px] p-2.5 text-brand-body shadow-sm transition-all hover:bg-brand-red/10 hover:text-brand-red"
              title="Logout"
            >
              <LogOut size={18} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
