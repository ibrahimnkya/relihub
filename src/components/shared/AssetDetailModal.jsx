import { createPortal } from 'react-dom'
import { 
  X, 
  Download, 
  History, 
  Info, 
  RefreshCw, 
  Cpu, 
  Server, 
  CheckCircle2, 
  XCircle,
  Gauge,
  Cylinder,
  MapPin,
  TrendingDown,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Database,
  Scale,
  Activity,
  Battery
} from 'lucide-react'
import Badge from '../ui/Badge'
import TankVisualizer from '../ui/TankVisualizer'
import MeterVisualizer from '../ui/MeterVisualizer'
import { formatApiDate } from '../../hooks/useDeviceData'
import { useState } from 'react'
import { useToast } from '../../store/toastStore'

const AssetDetailModal = ({ asset, type, onClose }) => {
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState('stats')

  if (!asset) return null

  const handleDownload = () => {
    addToast({
      title: "Generating Report",
      message: `Generating ${type === 'tank' ? 'Fuel Tank' : 'Metric'} Report for ${asset.name || asset.id}...`,
      type: 'info'
    })
  }

  const isTank = type === 'tank'
  const isMeter = type === 'meter'

  // Dynamic AI Insights Logic
  const getAIInsights = () => {
    let score = 98.5
    let reliability = 99
    let precision = 96
    let message = "Asset exhibits high-fidelity telemetry patterns. No maintenance anomalies detected."
    
    if (asset.status === 'offline' || asset.isStale) {
      score -= 45.2
      reliability = 32
      message = "Critical communication latency. Device has failed to sync within the expected heartbeat window."
    } else if (isTank && asset.fillPct < 15) {
      score -= 12.5
      message = "Critical fuel level. Immediate replenishment required to maintain site operational continuity."
    } else if (isTank && asset.fillPct < 30) {
      score -= 5.8
      message = "Warning: Fuel reserves are approaching the lower boundary. Logistics dispatch is recommended."
    } else if (isMeter && asset.status === 'fault') {
      score -= 58.4
      precision = 12
      message = "Sensor data variance detected. Probable hardware fault or measurement drift requires field inspection."
    } else if (isMeter && asset.dailyTotal === 0) {
      score -= 10
      message = "Zero throughput detected in current cycle. Verify if this aligns with scheduled site activity."
    }

    return { 
      score: Math.max(5, score).toFixed(1), 
      reliability, 
      precision, 
      message 
    }
  }

  const ai = getAIInsights()

  // Common header colors/styles
  const getHeaderStyle = () => {
    if (isTank) {
      return asset.fillPct < 15 ? 'bg-brand-red' : 'bg-brand-blue'
    }
    return asset.status === 'fault' || asset.status === 'offline' ? 'bg-brand-red' : 'bg-brand-blue'
  }

  return createPortal(
    <div className="fixed inset-0 z-[999] flex justify-end">
      <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
      <div className="relative w-full sm:max-w-[500px] bg-brand-card h-full max-h-[100dvh] shadow-2xl flex flex-col animate-slide-in-right overflow-hidden border-l border-brand-border">
        
        {/* Header */}
        <div className={`p-6 text-white flex items-center justify-between ${getHeaderStyle()}`}>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-white/10 rounded-[12px] flex items-center justify-center">
              {isTank ? <Cylinder size={24} /> : <Gauge size={24} />}
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">{asset.name || asset.id}</h3>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">{asset.site || asset.linkedSite}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-brand-border bg-brand-surface px-2 flex-shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'stats', label: isTank ? 'HUD' : 'Telemetry', icon: isTank ? Cylinder : Gauge },
            { id: 'history', label: 'History', icon: TrendingUp },
            { id: 'logs', label: 'Logs', icon: History },
            { id: 'info', label: 'Info', icon: Info },
            { id: 'recommendations', label: 'Reli-IQ', icon: Sparkles },
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
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {activeTab === 'stats' ? (
            <>
              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-brand-body uppercase tracking-[0.2em]">Live Analytics</h4>
                <div className="p-2 bg-brand-surface rounded-[12px] border border-brand-border mb-6">
                  {isTank ? (
                    <TankVisualizer 
                      percentage={asset.fillPct} 
                      active={asset.fillPct > 0} 
                      label={asset.id} 
                    />
                  ) : (
                    <MeterVisualizer rate={asset.currentFlowRate} status={asset.status} />
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-brand-surface rounded-[12px] border border-brand-border flex flex-col gap-1">
                    <span className="text-[9px] font-black text-brand-body uppercase">{isTank ? 'Live Vol (L)' : 'Today Accum (L)'}</span>
                    <span className="text-2xl font-black text-brand-heading">
                      {(isTank ? asset.currentVolume : asset.dailyTotal || 0).toLocaleString()}
                    </span>
                  </div>
                  {isTank ? (
                    <div className={`p-4 rounded-[12px] border flex flex-col gap-1 ${asset.fillPct < 15 ? 'bg-red-50 border-red-100 text-brand-red' : 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue'}`}>
                      <span className="text-[9px] font-black opacity-50 uppercase">Fill State</span>
                      <span className="text-xl font-black">{asset.fillPct}%</span>
                    </div>
                  ) : (
                    <div className="p-4 bg-brand-surface rounded-[12px] border border-brand-border flex flex-col gap-1">
                      <span className="text-[9px] font-black text-brand-body uppercase">Polling Sync</span>
                      <span className="text-sm font-black text-brand-blue">EXCELLENT</span>
                    </div>
                  )}
                </div>

                {asset.battery && (
                  <div className="p-4 bg-brand-surface rounded-[12px] border border-brand-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${parseInt(asset.battery.value) < 20 ? 'bg-red-500/10 text-brand-red' : 'bg-brand-green/10 text-brand-green'}`}>
                        <Battery size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-brand-body uppercase">Hardware Battery</p>
                        <p className="text-xs font-black text-brand-heading">{asset.battery.value}{asset.battery.unit}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-brand-body uppercase">Last Sync</p>
                      <p className="text-[9px] font-bold text-brand-heading/60">{formatApiDate(asset.battery.updatedAt, { timeOnly: true })}</p>
                    </div>
                  </div>
                )}
                
                <div className="bg-brand-surface border border-brand-border rounded-[12px] overflow-hidden">
                  <div className="px-4 py-2.5 bg-black/5 border-b border-brand-border flex items-center gap-2">
                    <Cpu size={12} className="text-brand-blue" />
                    <span className="text-[9px] font-black text-brand-heading uppercase tracking-widest">Sensor Summary</span>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-6">
                    {[
                      { label: 'Sensor ID', value: asset.sensorInfo?.sensorId },
                      { label: 'Tag Name', value: asset.sensorInfo?.tagName },
                      { label: 'Type', value: asset.sensorInfo?.type },
                      { label: 'Protocol', value: asset.deviceInfo?.protocol },
                      { label: 'Unit', value: asset.sensorInfo?.unit },
                      { label: 'Status', value: asset.deviceInfo?.status?.toUpperCase() },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[8px] font-black text-brand-body uppercase mb-0.5">{label}</p>
                        <p className="text-[10px] font-black text-brand-heading truncate">{value || '—'}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {isTank && (
                  <div className="bg-brand-surface border border-brand-border rounded-[12px] overflow-hidden mt-4">
                    <div className="px-4 py-2.5 bg-black/5 border-b border-brand-border flex items-center gap-2">
                      <Database size={12} className="text-brand-blue" />
                      <span className="text-[9px] font-black text-brand-heading uppercase tracking-widest">Capacity Logic</span>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-6">
                      {[
                        { label: 'Primary Cap', value: `${asset.capacity} L` },
                        { label: 'Calib Active', value: asset.sensorInfo?.hasCalibration ? 'YES' : 'NO' },
                        { label: 'Calib Max', value: asset.sensorInfo?.calibrationCapacity !== '—' ? `${asset.sensorInfo?.calibrationCapacity} L` : '—' },
                        { label: 'Raw Config', value: asset.sensorInfo?.fullTank !== '—' ? `${asset.sensorInfo?.fullTank} L` : '—' },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-[8px] font-black text-brand-body uppercase mb-0.5">{label}</p>
                          <p className="text-[10px] font-black text-brand-heading truncate">{value || '—'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {isTank && (
                <section className="space-y-4">
                  <h4 className="text-[10px] font-black text-brand-body uppercase tracking-[0.2em]">Forecast Analytics</h4>
                  <div className="p-4 bg-brand-green/5 border border-brand-green/10 rounded-[12px] flex items-center gap-4">
                    <TrendingUp size={20} className="text-brand-green" />
                    <div>
                      <p className="text-[9px] font-bold text-brand-green uppercase">Next Stock Reorder</p>
                      <p className="text-lg font-black text-brand-green">In {asset.daysToEmpty} Days</p>
                    </div>
                  </div>
                </section>
              )}

              <button onClick={handleDownload} className="w-full flex items-center justify-center gap-3 p-4 bg-brand-blue text-white rounded-[12px] font-black text-[10px] uppercase tracking-widest hover:bg-brand-hover transition-all shadow-lg active:scale-95">
                <Download size={16} />
                Download {isTank ? 'Fuel Audit' : 'Telemetry Audit'}
              </button>
            </>
          ) : activeTab === 'recommendations' ? (
            <div className="space-y-6 animate-fade-in pb-10">
              {/* Asset Hero Intelligence */}
              <div className="bg-brand-blue rounded-[12px] p-6 text-white relative overflow-hidden border border-brand-hover shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12">
                  <Sparkles size={140} />
                </div>
                <div className="relative z-10 text-center py-4">
                  <div className="h-14 w-14 bg-brand-blue/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-blue/30 backdrop-blur-md">
                    <Sparkles size={28} className="text-brand-blue" />
                  </div>
                  <h4 className="text-xl font-black uppercase tracking-tight mb-1">Asset Intelligence</h4>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Reli-IQ Core Analysis</p>
                </div>
              </div>

              {/* Action Cards */}
              <div className="space-y-4">
                <div className={`p-5 rounded-[12px] border flex gap-4 transition-all hover:shadow-lg ${
                  isTank && asset.fillPct < 20 ? 'bg-brand-red/5 border-brand-red/10' : 'bg-brand-green/5 border-brand-green/10'
                }`}>
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                    isTank && asset.fillPct < 20 ? 'bg-brand-card text-brand-red border border-brand-red/10' : 'bg-brand-card text-brand-green border border-brand-green/10'
                  }`}>
                    {isTank && asset.fillPct < 20 ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-[11px] font-black uppercase tracking-tight ${
                        isTank && asset.fillPct < 20 ? 'text-brand-red' : 'text-brand-green'
                      }`}>
                        {isTank ? (asset.fillPct < 20 ? 'Critical Depletion' : 'Supply Stable') : 'Link Integrity'}
                      </h4>
                      <Badge 
                        label={isTank && asset.fillPct < 20 ? 'URGENT' : 'OPTIMAL'} 
                        variant={isTank && asset.fillPct < 20 ? 'danger' : 'success'} 
                      />
                    </div>
                    <p className="text-xs text-brand-body leading-relaxed font-bold">
                      {isTank 
                        ? (asset.fillPct < 20 
                            ? `Current level at ${asset.fillPct}% requires immediate refueling to maintain site operations.`
                            : "Fuel reserves are currently optimized. Predicted runtime exceeds 14-day operational baseline.")
                        : "Data stream is highly consistent. Variance within 0.02% of historical baseline."}
                    </p>
                  </div>
                </div>

                {/* Efficiency Scoring Section */}
                <div className="p-6 bg-slate-50 rounded-[12px] border border-slate-100 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Activity className="text-brand-blue" size={20} />
                      <h4 className="text-[10px] font-black text-brand-navy uppercase tracking-widest">Efficiency Matrix</h4>
                    </div>
                    <span className="text-lg font-black text-brand-blue">{ai.score}%</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Signal Reliability</p>
                      <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                         <div className="h-full bg-brand-green transition-all duration-1000" style={{ width: `${ai.reliability}%` }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Data Precision</p>
                      <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                         <div className="h-full bg-brand-blue transition-all duration-1000" style={{ width: `${ai.precision}%` }} />
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-slate-500 italic mt-6 leading-relaxed border-t border-slate-200 pt-4">
                    "{ai.message}"
                  </p>
                </div>

                <button className="w-full py-4 bg-white border-2 border-slate-100 rounded-[12px] flex items-center justify-center gap-3 hover:border-brand-blue hover:text-brand-blue transition-all group shadow-sm active:scale-95">
                   <TrendingUp size={18} className="group-hover:scale-110 transition-transform" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em]">Predictive Analysis Full Report</span>
                </button>
              </div>
            </div>
          ) : activeTab === 'history' ? (
            <div className="space-y-6 animate-fade-in pb-10">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-brand-body uppercase tracking-[0.2em]">Volume Trend (24h)</h4>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-brand-blue animate-pulse"></span>
                  <span className="text-[8px] font-black text-brand-body uppercase">Real-time Feed</span>
                </div>
              </div>
              
              <div className="h-[250px] w-full bg-brand-surface rounded-[12px] border border-brand-border p-4 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Data-Driven Chart Visualization */}
                {asset.history && asset.history.length > 0 ? (
                  <div className="absolute inset-0 opacity-20 pointer-events-none flex items-end justify-around px-4 gap-1">
                    {asset.history.map((point, i) => {
                      const maxVal = Math.max(...asset.history.map(p => p.volume || 0)) || 100
                      const height = ((point.volume || 0) / maxVal) * 100
                      return (
                        <div 
                          key={i} 
                          className="bg-brand-blue w-full rounded-t-sm transition-all duration-1000" 
                          style={{ height: `${height}%` }} 
                        />
                      )
                    })}
                  </div>
                ) : (
                  <div className="absolute inset-0 opacity-10 pointer-events-none flex items-end justify-around px-4 gap-1">
                    {[40, 65, 45, 90, 55, 70, 85, 40, 60, 75, 45, 95].map((h, i) => (
                      <div key={i} className="bg-brand-blue w-full rounded-t-sm transition-all duration-1000" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                )}
                <TrendingUp size={32} className="text-brand-blue mb-2 opacity-50 relative z-10" />
                <p className="text-[10px] font-black text-brand-heading uppercase tracking-widest relative z-10">
                  {asset.history && asset.history.length > 0 ? 'Historical Trend Active' : 'Initializing Trend Stream...'}
                </p>
                <p className="text-[9px] font-bold text-brand-body mt-1 uppercase tracking-tighter italic relative z-10">
                  {asset.history && asset.history.length > 0 ? `${asset.history.length} Data Points Synced` : 'No Historical Data Available'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Max Peak', value: '5,420 L', icon: TrendingUp },
                  { label: 'Avg Flow', value: '120 L/m', icon: Activity },
                  { label: 'Stability', value: '99.8%', icon: ShieldCheck },
                ].map((stat, i) => (
                  <div key={i} className="p-3 bg-brand-surface rounded-[12px] border border-brand-border flex flex-col gap-1">
                    <p className="text-[7px] font-black text-brand-body uppercase">{stat.label}</p>
                    <p className="text-xs font-black text-brand-heading">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'logs' ? (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-brand-body uppercase tracking-[0.2em] flex items-center gap-2">
                  <History size={12} />
                  Sensor Event Timeline
                </h4>
                <Badge label="LATEST" variant="info" />
              </div>
              {(!asset.eventLog || asset.eventLog.length === 0) ? (
                <div className="text-center py-8 text-xs font-bold text-brand-body">No event history available</div>
              ) : (
                <div className="divide-y divide-brand-border border border-brand-border rounded-[12px] overflow-hidden bg-brand-surface">
                  {asset.eventLog.map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-3 hover:bg-black/5 transition-colors group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-7 w-7 rounded-lg bg-brand-card border border-brand-border flex items-center justify-center shrink-0 group-hover:border-brand-blue/30 transition-all">
                          <RefreshCw size={12} className={log.variant === 'warning' ? 'text-brand-amber' : 'text-brand-blue'} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] font-black text-brand-heading uppercase truncate">{log.event?.replace(/_/g, ' ')}</p>
                            <span className="text-[7px] font-black text-brand-body uppercase opacity-40">{formatApiDate(log.time, { timeOnly: true })}</span>
                          </div>
                          <p className="text-[9px] font-bold text-brand-body truncate max-w-[200px]">{log.detail || '—'}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                         <span className="text-[8px] font-black text-brand-body uppercase">{formatApiDate(log.time, { timeOnly: false }).split(',')[0]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <section className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Info size={12} />
                Hardware Node Information
              </h4>

              {/* Device Block */}
              <div className="bg-brand-surface rounded-[12px] border border-brand-border overflow-hidden">
                <div className="px-4 py-3 bg-black/5 border-b border-brand-border flex items-center gap-2">
                  <Server size={12} className="text-brand-blue" />
                  <span className="text-[9px] font-black text-brand-heading uppercase tracking-widest">Device</span>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { label: 'Device ID', value: asset.deviceInfo?.id },
                    { label: 'Device Name', value: asset.deviceInfo?.name },
                    { label: 'Protocol', value: asset.deviceInfo?.protocol?.toUpperCase() },
                    { label: 'Power', value: asset.deviceInfo?.power || '—' },
                    { label: 'Status', value: asset.deviceInfo?.status?.toUpperCase() },
                    { label: 'Last Reading', value: formatApiDate(asset.deviceInfo?.lastReadingAt) },
                    { label: 'Last Synced', value: formatApiDate(asset.deviceInfo?.lastSyncedAt) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-brand-body uppercase">{label}</span>
                      <span className="text-[10px] font-black text-brand-heading text-right max-w-[55%]">{value || '—'}</span>
                    </div>
                  ))}
                  {isTank && asset.deviceInfo?.location?.address && (
                    <div className="pt-2 border-t border-brand-border">
                      <div className="flex items-start gap-2">
                        <MapPin size={10} className="text-brand-blue mt-0.5 flex-shrink-0" />
                        <p className="text-[9px] font-bold text-brand-body leading-relaxed">{asset.deviceInfo.location.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sensor Block */}
              <div className="bg-brand-surface rounded-[12px] border border-brand-border overflow-hidden">
                <div className="px-4 py-3 bg-black/5 border-b border-brand-border flex items-center gap-2">
                  <Cpu size={12} className="text-brand-blue" />
                  <span className="text-[9px] font-black text-brand-heading uppercase tracking-widest">Sensor Config</span>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { label: 'Sensor ID', value: asset.sensorInfo?.sensorId },
                    { label: 'Sensor Name', value: asset.sensorInfo?.sensorName },
                    { label: 'Tag Name', value: asset.sensorInfo?.tagName },
                    { label: 'Type', value: asset.sensorInfo?.type },
                    { label: 'Formula', value: asset.sensorInfo?.formula },
                    { label: 'Unit', value: asset.sensorInfo?.unit },
                    { label: 'Created', value: formatApiDate(asset.sensorInfo?.createdAt) },
                    { label: 'Updated', value: formatApiDate(asset.sensorInfo?.updatedAt) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-brand-body uppercase">{label}</span>
                      <span className="text-[10px] font-black text-brand-heading text-right max-w-[55%]">{value || '—'}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t border-brand-border">
                    <span className="text-[9px] font-black text-brand-body uppercase">Graph Enabled</span>
                    {asset.sensorInfo?.addToGraph ? <CheckCircle2 size={14} className="text-brand-green" /> : <XCircle size={14} className="text-slate-300" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-brand-body uppercase">History Enabled</span>
                    {asset.sensorInfo?.addToHistory ? <CheckCircle2 size={14} className="text-brand-green" /> : <XCircle size={14} className="text-slate-300" />}
                  </div>
                </div>
              </div>

              {/* Calibration Block */}
              {isTank && asset.sensorInfo?.hasCalibration && asset.sensorInfo?.calibrationData && (
                <div className="bg-slate-50 rounded-[12px] border border-slate-100 overflow-hidden">
                  <div className="px-4 py-3 bg-brand-navy/5 border-b border-slate-100 flex items-center gap-2">
                    <Scale size={12} className="text-brand-navy" />
                    <span className="text-[9px] font-black text-brand-navy uppercase tracking-widest">Calibration Table</span>
                  </div>
                  <div className="p-0 max-h-[300px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-slate-100 z-10">
                        <tr>
                          <th className="px-4 py-2 text-[8px] font-black text-slate-400 uppercase">Input Value</th>
                          <th className="px-4 py-2 text-[8px] font-black text-slate-400 uppercase text-right">Volume (L)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {asset.sensorInfo.calibrationData.map((point, idx) => (
                          <tr key={idx} className="hover:bg-white transition-colors">
                            <td className="px-4 py-2 text-[10px] font-bold text-slate-600">{point.value ?? point.raw ?? point.x ?? '—'}</td>
                            <td className="px-4 py-2 text-[10px] font-black text-brand-blue text-right">{point.volume ?? point.liters ?? point.y ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>, document.body
  )
}

export default AssetDetailModal
