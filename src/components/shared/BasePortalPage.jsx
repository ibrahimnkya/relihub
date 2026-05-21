import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { ChevronRight, Layout, Shield } from 'lucide-react'

const BasePortalPage = ({ title, subtitle, icon: HeaderIcon, sections, sidebarFooter, initialTabId }) => {
  const [activeTab, setActiveTab] = useState(initialTabId || sections[0]?.id)
  const { user } = useAuthStore()

  const renderContent = () => {
    const activeSection = sections.find((s) => s.id === activeTab)
    if (!activeSection) return null
    const Component = activeSection.component
    return <Component />
  }

  return (
    <div className="relative flex flex-col min-h-[calc(100dvh-8rem)] sm:min-h-[calc(100dvh-10rem)] -m-4 sm:-m-6 lg:-m-8 animate-fade-in">
      {/* Mobile section tabs */}
      <div className="lg:hidden flex-shrink-0 mb-4 -mx-1 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 px-1 pb-1 min-w-min">
          {sections.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                activeTab === item.id
                  ? 'bg-brand-blue text-white border-brand-hover shadow-md'
                  : 'bg-brand-card text-brand-body border-brand-border'
              }`}
            >
              <item.icon size={14} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex w-80 flex-shrink-0 flex-col bg-brand-card border-r border-brand-border">
          <div className="p-6 lg:p-8 border-b border-brand-border bg-black/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 bg-brand-blue rounded-[12px] flex items-center justify-center text-white shadow-xl shadow-brand-blue/20 border border-brand-hover flex-shrink-0">
                <HeaderIcon size={28} />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg xl:text-xl font-black text-brand-heading tracking-tight uppercase leading-none mb-1 truncate">
                  {title}
                </h1>
                <p className="text-[10px] text-brand-body font-black uppercase tracking-widest opacity-60 truncate">
                  {subtitle}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[9px] font-black text-brand-body uppercase tracking-[0.2em] opacity-40 mb-2">
                <span>System Access</span>
                <Shield size={10} />
              </div>
              <div className="p-3 bg-brand-surface rounded-[12px] border border-brand-border flex items-center justify-between">
                <span className="text-[10px] font-bold text-brand-heading uppercase truncate">
                  {user?.role?.replace('_', ' ') || 'Authorized'}
                </span>
                <div className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse flex-shrink-0" />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 space-y-2">
            {sections.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full group flex items-center gap-4 px-4 py-4 rounded-[12px] transition-all relative overflow-hidden ${
                  activeTab === item.id
                    ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20 border border-brand-hover'
                    : 'bg-transparent text-brand-body hover:bg-black/5 hover:text-brand-heading border border-transparent'
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-[12px] flex items-center justify-center transition-all flex-shrink-0 ${
                    activeTab === item.id ? 'bg-white/20' : 'bg-brand-blue/5 text-brand-blue group-hover:bg-brand-blue/10'
                  }`}
                >
                  <item.icon size={20} className={activeTab === item.id ? 'animate-pulse' : ''} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-widest truncate">{item.label}</p>
                  <p
                    className={`text-[9px] font-bold uppercase tracking-tighter opacity-50 truncate ${
                      activeTab === item.id ? 'text-white/80' : 'text-brand-body'
                    }`}
                  >
                    {item.sub}
                  </p>
                </div>
                {activeTab === item.id && <ChevronRight size={14} className="text-white/40 flex-shrink-0" />}
              </button>
            ))}
          </div>

          {sidebarFooter && <div className="p-6 border-t border-brand-border bg-black/5">{sidebarFooter}</div>}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-brand-surface/50 p-4 sm:p-6 lg:p-10 relative min-w-0">
          <div className="absolute top-0 right-0 p-6 lg:p-10 opacity-[0.02] pointer-events-none hidden sm:block">
            <Layout size={280} className="lg:w-[400px] lg:h-[400px]" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto w-full">{renderContent()}</div>
        </div>
      </div>
    </div>
  )
}

export default BasePortalPage
