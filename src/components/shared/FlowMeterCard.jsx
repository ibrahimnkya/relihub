import { AlertTriangle, MapPin, Clock, Gauge, ChevronRight, Settings, RefreshCw, Battery } from 'lucide-react'
import Badge from '../ui/Badge'
import MeterVisualizer from '../ui/MeterVisualizer'
import { formatApiDate } from '../../hooks/useDeviceData'

const FlowMeterCard = ({ meter, onSelect }) => {
  const isFaulty = meter.status === 'fault'
  const isWarning = meter.status === 'calib_due'

  return (
    <div 
      onClick={() => onSelect?.(meter)}
      className="bg-brand-card rounded-[10px] shadow-sm border border-white/5 p-6 space-y-6 group hover:shadow-2xl hover:border-brand-blue/30 transition-all duration-500 relative overflow-hidden cursor-pointer active:scale-[0.98]"
    >
      {/* Visual Accent */}
      <div className={`absolute top-0 left-0 w-1.5 h-full transition-all duration-500 ${isFaulty ? 'bg-brand-red opacity-100' : isWarning ? 'bg-brand-amber opacity-100' : 'bg-brand-blue opacity-0 group-hover:opacity-100'}`} />

      {/* Meter Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-[10px] flex items-center justify-center transition-all ${isFaulty ? 'bg-red-50 text-brand-red' : isWarning ? 'bg-amber-50 text-brand-amber' : 'bg-brand-blue/10 text-brand-blue'} group-hover:scale-110 shadow-sm border border-black/5`}>
            <Gauge size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-brand-heading tracking-tight uppercase group-hover:text-brand-blue transition-colors leading-none">{meter.id}</h3>
            <div className="flex items-center gap-1.5 text-[10px] text-brand-body font-black uppercase tracking-widest mt-2 px-2 py-0.5 bg-brand-surface border border-white/5 rounded-full w-fit">
              <MapPin size={10} />
              {meter.linkedSite}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {meter.battery && (
              <div className={`flex items-center gap-1 text-[10px] font-black tracking-tight px-2 py-0.5 rounded-full ${parseInt(meter.battery.value) < 20 ? 'bg-red-500/10 text-brand-red' : 'bg-white/5 text-brand-body'}`}>
                <Battery size={10} />
                {meter.battery.value}%
              </div>
            )}
            <Badge 
              label={meter.status === 'calib_due' ? 'Calib Due' : meter.status} 
              variant={
                meter.status === 'active' ? 'success' : 
                meter.status === 'fault' ? 'danger' : 
                meter.status === 'calib_due' ? 'warning' : 'neutral'
              } 
              pulse={isFaulty}
            />
          </div>
          {meter.mismatched && <Badge label="VARIANCE" variant="danger" />}
        </div>
      </div>

      {/* Main Flow Visualization */}
      <MeterVisualizer 
        rate={meter.currentFlowRate} 
        status={meter.status} 
      />

      {/* Volume Analytics */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        <div className="bg-brand-surface p-4 rounded-[10px] border border-white/5 group-hover:bg-brand-card transition-colors group-hover:shadow-sm">
          <p className="text-[9px] font-black text-brand-body uppercase tracking-widest mb-1.5">Today Total</p>
          <div className="flex items-baseline gap-1">
             <span className="text-2xl font-black text-brand-heading tracking-tighter leading-none">{(meter.dailyTotal || 0).toLocaleString()}</span>
             <span className="text-[10px] font-bold text-brand-body uppercase tracking-wider">L</span>
          </div>
        </div>
        <div className="bg-brand-surface p-4 rounded-[10px] border border-white/5 group-hover:bg-brand-card transition-colors group-hover:shadow-sm">
          <p className="text-[9px] font-black text-brand-body uppercase tracking-widest mb-1.5">Shift Total</p>
          <div className="flex items-baseline gap-1">
             <span className="text-2xl font-black text-brand-heading tracking-tighter leading-none">{(meter.shiftTotal || 0).toLocaleString()}</span>
             <span className="text-[10px] font-bold text-brand-body uppercase tracking-wider">L</span>
          </div>
        </div>
      </div>

      {/* Lifespan & Serviceability */}
      <div className={`p-4 rounded-[10px] border flex items-center justify-between group-hover:translate-y-[-2px] transition-transform ${isFaulty ? 'bg-red-50/50 border-red-100' : isWarning ? 'bg-amber-50/50 border-amber-100' : 'bg-green-50/50 border-green-100'}`}>
         <div className="flex items-center gap-2">
            <Settings size={16} className={isFaulty ? 'text-brand-red' : isWarning ? 'text-brand-amber' : 'text-brand-green'} />
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Operational Health</span>
         </div>
         <span className={`text-xs font-black font-mono ${isFaulty ? 'text-brand-red' : isWarning ? 'text-brand-amber' : 'text-brand-green'}`}>
            {isFaulty ? 'CRITICAL' : isWarning ? 'CAL DUE' : 'OPTIMAL'}
         </span>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-50 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <Clock size={10} className="text-slate-300" />
            Last Reading: {formatApiDate(meter.lastReadingAt, { timeOnly: false })}
          </div>
          <div className="flex items-center gap-1.5 text-brand-blue font-black text-[10px] uppercase tracking-[0.1em] opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
            ANALYZE LOGS <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
        {meter.lastSyncedAt && (
          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <RefreshCw size={10} className="text-slate-300" />
            Last Synced: {formatApiDate(meter.lastSyncedAt)}
          </div>
        )}
      </div>
    </div>
  )
}

export default FlowMeterCard
