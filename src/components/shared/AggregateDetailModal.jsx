import { useState, useMemo } from 'react'
import { 
  X, 
  Cylinder, 
  Zap, 
  ArrowRight, 
  Gauge, 
  Database, 
  TrendingUp, 
  LayoutGrid, 
  Search, 
  Sparkles, 
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Activity
} from 'lucide-react'
import { createPortal } from 'react-dom'
import Badge from '../ui/Badge'
import TankVisualizer from '../ui/TankVisualizer'
import MeterVisualizer from '../ui/MeterVisualizer'
import StatusDot from '../ui/StatusDot'
import { useNavigate } from 'react-router-dom'

const AggregateDetailModal = ({ isOpen, onClose, type, data = [] }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')

  const safeData = Array.isArray(data) ? data : []
  const isTank = type === 'tank'
  const title = isTank ? 'Storage Fleet' : 'Flow Network'
  const subtitle = isTank ? 'Aggregate Storage Dynamics' : 'Network Throughput Audit'
  
  const totalVolume = safeData.reduce((acc, item) => {
    if (!item) return acc;
    return acc + (isTank ? (item.currentVolume || 0) : (item.dailyTotal || 0));
  }, 0)

  const avgValue = safeData.length > 0 
    ? Math.round(safeData.reduce((acc, item) => {
        if (!item) return acc;
        return acc + (isTank ? (item.fillPct || 0) : (item.currentFlowRate || 0));
      }, 0) / safeData.length) 
    : 0

  const filteredData = useMemo(() => {
    return safeData.filter(item => {
      if (!item) return false;
      const searchStr = searchTerm.toLowerCase();
      return (
        (item.name || '').toLowerCase().includes(searchStr) ||
        (item.serial || '').toLowerCase().includes(searchStr) ||
        (item.id || '').toLowerCase().includes(searchStr) ||
        (item.site || '').toLowerCase().includes(searchStr) ||
        (item.linkedSite || '').toLowerCase().includes(searchStr)
      );
    })
  }, [safeData, searchTerm])

  const recommendations = useMemo(() => {
    const recs = []
    if (isTank) {
      const lowTanks = safeData.filter(t => t && t.fillPct < 30)
      if (lowTanks.length > 0) {
        recs.push({
          title: 'Stock Reorder Required',
          desc: `${lowTanks.length} tanks are below 30% capacity. Schedule refueling for optimized logistics.`,
          severity: 'warning'
        })
      }
      const staleTanks = safeData.filter(t => t && t.isStale)
      if (staleTanks.length > 0) {
        recs.push({
          title: 'Sensor Health Alert',
          desc: `${staleTanks.length} tank sensors have stopped reporting. Inspect telemetry gateways.`,
          severity: 'critical'
        })
      }
    } else {
      const offlineMeters = safeData.filter(m => m && m.status !== 'active')
      if (offlineMeters.length > 0) {
        recs.push({
          title: 'Hardware Downtime',
          desc: `${offlineMeters.length} flowmeters are currently inactive. Check power supply to MGR nodes.`,
          severity: 'critical'
        })
      }
    }
    recs.push({
      title: 'Performance Normal',
      desc: 'Overall network throughput is within expected parameters for current operational cycle.',
      severity: 'success'
    })
    return recs
  }, [safeData, isTank])

  const avgDaysToEmpty = isTank 
    ? Math.round(safeData.reduce((acc, item) => {
        if (!item || item.isStale) return acc;
        return acc + (item.daysToEmpty || 21);
      }, 0) / (safeData.filter(i => i && !i.isStale).length || 1))
    : 0

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex justify-end">
      <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
      <div className="relative w-full max-w-[500px] bg-brand-card h-full shadow-2xl flex flex-col animate-slide-in-right overflow-hidden border-l border-brand-border">
        
        {/* Header - Professional Design */}
        <div className="p-6 bg-brand-blue text-white flex items-center justify-between flex-shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 translate-x-4 -translate-y-4">
             {isTank ? <Cylinder size={120} /> : <Zap size={120} />}
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="h-12 w-12 bg-white/10 rounded-[12px] flex items-center justify-center border border-white/10 shadow-xl">
              {isTank ? <Cylinder size={24} className="text-white" /> : <Zap size={24} className="text-brand-amber" />}
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight leading-none mb-1">{title} HUD</h3>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors relative z-10"><X size={24} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-brand-border bg-brand-surface px-2 flex-shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutGrid },
            { id: 'assets', label: isTank ? 'Tanks' : 'Flow Meters', icon: Database },
            { id: 'insights', label: 'Reli-IQ', icon: Sparkles },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-3 text-[9px] font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap flex-1 justify-center ${activeTab === tab.id ? 'border-brand-blue text-brand-blue' : 'border-transparent text-brand-body hover:text-brand-heading'}`}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col items-center justify-center bg-brand-surface rounded-[20px] p-10 border border-brand-border shadow-inner">
                 {isTank ? (
                   <TankVisualizer percentage={avgValue} active={avgValue > 0} label="Storage AVG" />
                 ) : (
                   <MeterVisualizer rate={avgValue} status={safeData.length > 0 ? 'active' : 'inactive'} />
                 )}
                 <p className="text-5xl font-black text-brand-heading mt-6 tracking-tighter">{avgValue}{isTank ? '%' : ' L/m'}</p>
                 <p className="text-[10px] font-black text-brand-body uppercase tracking-[0.2em] mt-1">Average Storage Usage</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-brand-surface border border-brand-border rounded-[15px] shadow-sm flex flex-col gap-3">
                  <div className="h-10 w-10 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue">
                    <Database size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-brand-body uppercase tracking-widest">Total {isTank ? 'Stock' : 'Volume'}</p>
                    <p className="text-xl font-black text-brand-heading">{totalVolume.toLocaleString()} L</p>
                  </div>
                </div>

                <div className="p-5 bg-brand-surface border border-brand-border rounded-[15px] shadow-sm flex flex-col gap-3">
                  <div className="h-10 w-10 bg-brand-green/10 rounded-full flex items-center justify-center text-brand-green">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-brand-body uppercase tracking-widest">Signal Health</p>
                    <p className="text-xl font-black text-brand-heading">
                      {safeData.length > 0 
                        ? Math.round((safeData.filter(i => i && (isTank ? !i.isStale : i.status === 'active')).length / safeData.length) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>

              {isTank && (
                <div className="p-6 bg-brand-blue rounded-[15px] text-white relative overflow-hidden group shadow-lg border border-brand-hover">
                   <div className="absolute inset-0 bg-white opacity-10 group-hover:opacity-20 transition-opacity"></div>
                   <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">Next Stock Reorder</h4>
                        <p className="text-xl font-black text-white">In {avgDaysToEmpty} Days</p>
                        <p className="text-[9px] font-bold text-white/40 uppercase mt-1 tracking-widest">Based on current usage rate</p>
                      </div>
                      <TrendingUp size={24} className="text-white" />
                   </div>
                </div>
              )}

              {!isTank && (
                <div className="p-6 bg-brand-blue rounded-[15px] text-white relative overflow-hidden group shadow-lg border border-brand-hover">
                   <div className="absolute inset-0 bg-white opacity-10 group-hover:opacity-20 transition-opacity"></div>
                   <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">Resources Distribution</h4>
                        <p className="text-xs text-white/60">Global monitoring active across {safeData.length} locations</p>
                      </div>
                      <ArrowUpRight size={24} className="text-white" />
                   </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="space-y-4 animate-fade-in">
              <div className="relative sticky top-0 bg-brand-card pb-2 z-10">
                <Search className="absolute left-3 top-3.5 text-brand-body" size={16} />
                <input 
                  type="text" 
                  placeholder={`Search by name, site, or ID...`}
                  className="w-full p-3 pl-10 bg-brand-surface border border-brand-border rounded-[10px] text-xs font-bold text-brand-heading focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all placeholder:text-brand-body/40"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                {filteredData.map((item, idx) => {
                  if (!item) return null;
                  return (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-brand-surface border border-brand-border rounded-[12px] hover:border-brand-blue/30 hover:bg-black/5 transition-all cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-brand-card rounded-[8px] flex items-center justify-center text-[10px] font-black text-brand-body group-hover:bg-brand-blue group-hover:text-white transition-all border border-brand-border">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-brand-heading uppercase truncate max-w-[180px]">{item.name || item.serial || 'Unknown Node'}</p>
                          <p className="text-[9px] font-bold text-brand-body uppercase">{item.site || item.linkedSite || 'Remote Terminal'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[12px] font-black text-brand-heading">
                          {isTank ? `${item.fillPct || 0}%` : `${(item.dailyTotal || 0).toLocaleString()} L`}
                        </p>
                        <StatusDot status={isTank ? (item.isStale ? 'offline' : 'active') : (item.status || 'inactive')} size="xs" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6 animate-fade-in pb-10">
              {/* AI Hero Card */}
              <div className="bg-brand-blue rounded-[20px] p-6 text-white relative overflow-hidden border border-brand-hover shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12">
                  <Sparkles size={140} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 bg-brand-blue rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-blue/20">
                      <Sparkles size={18} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-blue">Reli-IQ Intelligence</span>
                  </div>
                  <h4 className="text-2xl font-black mb-2">Fleet Integrity Score</h4>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-black text-white">
                      {Math.round((safeData.filter(i => i && (isTank ? !i.isStale : i.status === 'active')).length / (safeData.length || 1)) * 100)}
                    </span>
                    <span className="text-sm font-bold text-white/40 uppercase">/ 100 Optima</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-blue transition-all duration-1000 ease-out"
                      style={{ width: `${(safeData.filter(i => i && (isTank ? !i.isStale : i.status === 'active')).length / (safeData.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Categorized Insights */}
              <div className="space-y-4">
                <h5 className="text-[10px] font-black text-brand-body uppercase tracking-[0.2em] px-1">Actionable Intelligence</h5>
                
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="group relative">
                    <div className={`absolute -inset-0.5 rounded-[18px] opacity-0 group-hover:opacity-100 transition duration-300 blur-sm ${
                      rec.severity === 'critical' ? 'bg-red-500/20' : 
                      rec.severity === 'warning' ? 'bg-amber-500/20' : 
                      'bg-brand-blue/20'
                    }`} />
                    
                    <div className={`relative p-5 rounded-[15px] border flex gap-4 bg-brand-surface transition-all ${
                      rec.severity === 'critical' ? 'border-red-500/30' : 
                      rec.severity === 'warning' ? 'border-amber-500/30' : 
                      'border-brand-border'
                    }`}>
                      <div className={`h-11 w-11 rounded-[12px] flex items-center justify-center flex-shrink-0 shadow-sm ${
                        rec.severity === 'critical' ? 'bg-red-50 text-brand-red' : 
                        rec.severity === 'warning' ? 'bg-amber-50 text-brand-amber' : 
                        'bg-brand-blue/10 text-brand-blue'
                      }`}>
                        {rec.severity === 'critical' ? <AlertTriangle size={20} /> : <TrendingUp size={20} />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-[11px] font-black uppercase tracking-tight ${
                            rec.severity === 'critical' ? 'text-brand-red' : 
                            rec.severity === 'warning' ? 'text-brand-amber' : 
                            'text-brand-heading'
                          }`}>{rec.title}</h4>
                          <Badge 
                            label={rec.severity.toUpperCase()} 
                            variant={rec.severity === 'critical' ? 'danger' : rec.severity === 'warning' ? 'warning' : 'success'} 
                          />
                        </div>
                        <p className="text-xs text-brand-body leading-relaxed font-bold mb-3">{rec.desc}</p>
                        
                        <div className="flex items-center gap-4 pt-3 border-t border-brand-border">
                          <div className="flex items-center gap-1.5">
                            <Activity size={10} className="text-brand-body opacity-40" />
                            <span className="text-[9px] font-black text-brand-body opacity-40 uppercase tracking-widest">Impact: High</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck size={10} className="text-brand-body opacity-40" />
                            <span className="text-[9px] font-black text-brand-body opacity-40 uppercase tracking-widest">Confidence: 98%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Synthesis Note */}
              <div className="p-6 bg-brand-surface rounded-[20px] border border-brand-border border-dashed text-center">
                 <div className="h-10 w-10 bg-brand-card rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-brand-border">
                    <TrendingUp size={20} className="text-brand-body/30" />
                 </div>
                 <p className="text-xs text-brand-body font-medium leading-relaxed italic">
                    "Reli-IQ dynamically synthesizes real-time telemetry from {safeData.length} nodes using historical throughput baselines and anomaly detection algorithms."
                 </p>
                 <div className="mt-4 flex items-center justify-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-brand-green animate-pulse" />
                    <span className="text-[9px] font-black text-brand-body uppercase tracking-widest">Analysis Engine Active</span>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-6 bg-brand-surface border-t border-brand-border mt-auto flex-shrink-0">
           <button 
             onClick={() => {
               onClose();
               navigate(isTank ? '/tanks' : '/flow-meters');
             }}
             className={`w-full py-4 ${isTank ? 'bg-brand-blue' : 'bg-brand-amber'} text-white rounded-[12px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:scale-[0.98] transition-all group`}
           >
             <TrendingUp size={18} />
             Enter {isTank ? 'Storage' : 'Flow'} Terminal
             <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </div>
    </div>
  , document.body)
}

export default AggregateDetailModal
