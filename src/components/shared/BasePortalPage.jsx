import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { ChevronRight, Layout, Settings, Shield, User, Zap } from 'lucide-react'

const BasePortalPage = ({ title, subtitle, icon: HeaderIcon, sections, sidebarFooter, initialTabId }) => {
  const [activeTab, setActiveTab] = useState(initialTabId || sections[0]?.id)
  const { user } = useAuthStore()

  const renderContent = () => {
    const activeSection = sections.find(s => s.id === activeTab)
    if (!activeSection) return null
    
    const Component = activeSection.component
    return <Component />
  }

  return (
    <div className="animate-fade-in relative flex flex-col h-[calc(100vh-140px)] -m-8">
      {/* Immersive Sidebar & Content Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Hub */}
        <div className="w-80 bg-brand-card border-r border-brand-border flex flex-col flex-shrink-0">
          <div className="p-8 border-b border-brand-border bg-black/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 bg-brand-blue rounded-[12px] flex items-center justify-center text-white shadow-xl shadow-brand-blue/20 border border-brand-hover">
                <HeaderIcon size={28} />
              </div>
              <div>
                <h1 className="text-xl font-black text-brand-heading tracking-tight uppercase leading-none mb-1">{title}</h1>
                <p className="text-[10px] text-brand-body font-black uppercase tracking-widest opacity-60">{subtitle}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[9px] font-black text-brand-body uppercase tracking-[0.2em] opacity-40 mb-2">
                <span>System Access</span>
                <Shield size={10} />
              </div>
              <div className="p-3 bg-brand-surface rounded-[12px] border border-brand-border flex items-center justify-between">
                <span className="text-[10px] font-bold text-brand-heading uppercase">{user?.role?.replace('_', ' ') || 'Authorized'}</span>
                <div className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-2">
            {sections.map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full group flex items-center gap-4 px-4 py-4 rounded-[12px] transition-all relative overflow-hidden ${
                  activeTab === item.id 
                  ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20 border border-brand-hover' 
                  : 'bg-transparent text-brand-body hover:bg-black/5 hover:text-brand-heading border border-transparent'
                }`}
              >
                <div className={`h-10 w-10 rounded-[12px] flex items-center justify-center transition-all ${
                  activeTab === item.id ? 'bg-white/20' : 'bg-brand-blue/5 text-brand-blue group-hover:bg-brand-blue/10'
                }`}>
                  <item.icon size={20} className={activeTab === item.id ? 'animate-pulse' : ''} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-widest truncate">{item.label}</p>
                  <p className={`text-[9px] font-bold uppercase tracking-tighter opacity-50 truncate ${activeTab === item.id ? 'text-white/80' : 'text-brand-body'}`}>
                    {item.sub}
                  </p>
                </div>
                {activeTab === item.id && (
                  <ChevronRight size={14} className="text-white/40" />
                )}
              </button>
            ))}
          </div>

          {sidebarFooter && (
            <div className="p-6 border-t border-brand-border bg-black/5">
              {sidebarFooter}
            </div>
          )}
        </div>

        {/* Right Dynamic Workspace */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-brand-surface/50 p-10 relative">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
            <Layout size={400} />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BasePortalPage
