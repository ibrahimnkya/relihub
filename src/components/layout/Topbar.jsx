import { Bell, Search, User, Globe } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/appStore'
import { useTranslation } from 'react-i18next'

const Topbar = () => {
  const { sidebarCollapsed: collapsed } = useAppStore()
  const { user } = useAuthStore()
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const nextLng = i18n.language === 'en' ? 'sw' : 'en'
    i18n.changeLanguage(nextLng)
  }

  return (
    <header 
      className={`
        fixed top-0 right-0 h-20 bg-brand-card/80 backdrop-blur-md border-b border-brand-border z-40 transition-all duration-500 ease-in-out flex items-center justify-between px-8 shadow-sm
        ${collapsed ? 'left-20' : 'left-64'}
      `}
    >
      <div className="flex-1 max-w-xl flex items-center gap-6">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-body group-focus-within:text-brand-blue transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search assets, trains, tanks..." 
            className="w-full bg-brand-surface border border-brand-border rounded-[12px] py-2.5 pl-12 pr-4 text-sm text-brand-heading focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all placeholder:text-brand-body/40"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold text-brand-body bg-brand-card border border-brand-border rounded shadow-sm">⌘</kbd>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold text-brand-body bg-brand-card border border-brand-border rounded shadow-sm">K</kbd>
          </div>
        </div>
        
        {/* AkiliApp Integration Badge */}
        {/* <div className="hidden lg:flex items-center gap-3 bg-brand-blue px-4 py-2 rounded-[10px] border border-brand-hover shadow-lg group hover:bg-brand-hover transition-all cursor-pointer">
          <div className="relative">
            <div className="h-2 w-2 rounded-full bg-brand-blue"></div>
            <div className="absolute inset-0 h-2 w-2 rounded-full bg-brand-blue animate-ping"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.15em] leading-none mb-0.5">AkiliApp Live</span>
            <span className="text-[10px] font-bold text-white leading-none">V 4.2 Sync</span>
          </div>
        </div> */}
      </div>

      <div className="flex items-center gap-6">
        {/* Language Switcher */}
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-1.5 bg-brand-surface border border-brand-border rounded-[12px] hover:bg-black/5 transition-all active:scale-95 group font-mono"
          title={i18n.language === 'en' ? 'Switch to Swahili' : 'Badili kwenda Kiingereza'}
        >
          <span className="text-lg leading-none group-hover:scale-110 transition-transform">
            {i18n.language === 'en' ? '🇬🇧' : '🇹🇿'}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-heading">
            {i18n.language === 'en' ? 'EN' : 'SW'}
          </span>
        </button>

        <button className="relative w-10 h-10 flex items-center justify-center text-brand-body hover:bg-black/5 rounded-[12px] transition-colors shadow-sm border border-brand-border">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-brand-red border-2 border-brand-card rounded-full"></span>
        </button>

        <div className="h-8 w-[1px] bg-brand-border mx-2"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-black leading-none mb-1">{user?.name || 'Authorized User'}</p>
            <p className="text-[10px] font-black text-brand-body uppercase tracking-tighter opacity-60">{user?.role || 'System Operator'}</p>
          </div>
          <div className="w-10 h-10 bg-brand-blue rounded-[12px] flex items-center justify-center text-white font-black text-xs shadow-md shadow-brand-blue/10 relative overflow-hidden group border border-brand-blue/30 uppercase">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : <User size={20} />}
            <div className="absolute inset-0 bg-brand-blue/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Topbar
