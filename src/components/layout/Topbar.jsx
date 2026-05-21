import { Bell, Search, User, Menu, X } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/appStore'
import { useTranslation } from 'react-i18next'

const Topbar = () => {
  const { sidebarCollapsed: collapsed, mobileMenuOpen, toggleMobileMenu } = useAppStore()
  const { user } = useAuthStore()
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const nextLng = i18n.language === 'en' ? 'sw' : 'en'
    i18n.changeLanguage(nextLng)
  }

  return (
    <header
      className={`
        fixed top-0 right-0 z-40 flex items-center justify-between gap-2 sm:gap-4
        h-16 sm:h-20 bg-brand-card/80 backdrop-blur-md border-b border-brand-border shadow-sm
        px-3 sm:px-6 lg:px-8 transition-all duration-300 ease-in-out
        left-0 lg:left-64
        ${collapsed ? 'lg:left-20' : 'lg:left-64'}
      `}
    >
      <div className="flex flex-1 items-center gap-2 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={toggleMobileMenu}
          className="lg:hidden flex-shrink-0 w-10 h-10 flex items-center justify-center text-brand-heading hover:bg-black/5 rounded-[12px] border border-brand-border transition-colors"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="relative group flex-1 min-w-0 max-w-xl hidden sm:block">
          <Search
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-brand-body group-focus-within:text-brand-blue transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search assets, trains, tanks..."
            className="w-full bg-brand-surface border border-brand-border rounded-[12px] py-2 sm:py-2.5 pl-10 sm:pl-12 pr-4 text-sm text-brand-heading focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all placeholder:text-brand-body/40"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-brand-body bg-brand-card border border-brand-border rounded shadow-sm">
              ⌘
            </kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-brand-body bg-brand-card border border-brand-border rounded shadow-sm">
              K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 bg-brand-surface border border-brand-border rounded-[12px] hover:bg-black/5 transition-all active:scale-95"
          title={i18n.language === 'en' ? 'Switch to Swahili' : 'Badili kwenda Kiingereza'}
        >
          <span className="text-base sm:text-lg leading-none">
            {i18n.language === 'en' ? '🇬🇧' : '🇹🇿'}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-heading">
            {i18n.language === 'en' ? 'EN' : 'SW'}
          </span>
        </button>

        <button
          type="button"
          className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-brand-body hover:bg-black/5 rounded-[12px] transition-colors shadow-sm border border-brand-border"
          aria-label="Notifications"
        >
          <Bell size={18} className="sm:w-5 sm:h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-brand-red border-2 border-brand-card rounded-full" />
        </button>

        <div className="hidden sm:block h-8 w-px bg-brand-border" />

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-black text-black leading-none mb-1 max-w-[140px] truncate">
              {user?.name || 'Authorized User'}
            </p>
            <p className="text-[10px] font-black text-brand-body uppercase tracking-tighter opacity-60 truncate max-w-[140px]">
              {user?.role || 'System Operator'}
            </p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-brand-blue rounded-[12px] flex items-center justify-center text-white font-black text-xs shadow-md shadow-brand-blue/10 relative overflow-hidden border border-brand-blue/30 uppercase flex-shrink-0">
            {user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : <User size={18} />}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Topbar
