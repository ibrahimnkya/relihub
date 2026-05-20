import { MapPin, Clock, TrendingDown, ChevronRight, Cylinder, Activity, RefreshCw, Battery } from 'lucide-react'
import Badge from '../ui/Badge'
import TankVisualizer from '../ui/TankVisualizer'
import { formatApiDate } from '../../hooks/useDeviceData'

const TankCard = ({ tank, onSelect }) => {
  const isCritical = tank.fillPct <= tank.criticalThreshold
  const isWarning = tank.fillPct <= tank.warningThreshold && !isCritical

  return (
    <div 
      onClick={() => onSelect?.(tank)}
      className="bg-brand-card rounded-[12px] shadow-sm border border-white/5 p-6 space-y-6 group hover:shadow-2xl hover:border-brand-blue/30 transition-all duration-500 relative overflow-hidden cursor-pointer active:scale-[0.98]"
    >
      {/* Visual Accent */}
      <div className={`absolute top-0 left-0 w-1.5 h-full transition-all duration-500 ${isCritical ? 'bg-brand-red opacity-100' : isWarning ? 'bg-brand-amber opacity-100' : 'bg-brand-blue opacity-0 group-hover:opacity-100'}`} />

      {/* Immersive Background Icon */}
      <div className="absolute top-[-20px] right-[-20px] opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-700 pointer-events-none">
        <Cylinder size={180} strokeWidth={0.5} className="rotate-[-15deg] group-hover:rotate-0 transition-transform duration-1000" />
      </div>

      {/* Tank Header */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-4">
          {/* <div className={`h-14 w-14 rounded-[12px] flex items-center justify-center transition-all duration-500 ${isCritical ? 'bg-red-50 text-brand-red border-red-100' : isWarning ? 'bg-amber-50 text-brand-amber border-amber-100' : 'bg-brand-blue/10 text-brand-blue border-brand-blue/20'} group-hover:scale-110 shadow-lg border relative overflow-hidden`}>
             <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <Cylinder size={28} strokeWidth={2} className="relative z-10" />
          </div> */}
          <div>
            <h3 className="text-xl font-black text-brand-heading tracking-tight uppercase group-hover:text-brand-blue transition-colors leading-none">{tank.name}</h3>
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex items-center gap-1.5 text-[9px] text-brand-body font-black uppercase tracking-widest px-2 py-0.5 bg-brand-surface border border-white/5 rounded-full w-fit">
                <MapPin size={10} className="text-brand-blue" />
                {tank.site}
              </div>
              {tank.location && (
                <div className="flex items-center gap-1 text-[8px] text-slate-400 font-bold uppercase tracking-[0.15em] ml-2">
                   {typeof tank.location === 'object' ? tank.location.address : tank.location}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {tank.battery && (
              <div className={`flex items-center gap-1 text-[10px] font-black tracking-tight px-2 py-0.5 rounded-full ${parseInt(tank.battery.value) < 20 ? 'bg-red-500/10 text-brand-red' : 'bg-white/5 text-brand-body'}`}>
                <Battery size={10} />
                {tank.battery.value}%
              </div>
            )}
            {tank.isStale && <Badge label="OFFLINE" variant="danger" />}
            {tank.activeIncidents > 0 && <Badge label={`${tank.activeIncidents} !`} variant="danger" pulse />}
          </div>
        </div>
      </div>

      {/* Main Tank Visualization */}
      <TankVisualizer 
        percentage={tank.fillPct} 
        active={tank.fillPct > 0 && !tank.isStale} 
        label={tank.id} 
        status={tank.status} 
        className="h-48 my-4"
      />

      {/* Volume Analytics */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        <div className="bg-brand-surface p-4 rounded-[12px] border border-white/5 group-hover:bg-brand-card transition-colors group-hover:shadow-sm">
          <p className="text-[9px] font-black text-brand-body uppercase tracking-widest mb-1.5">Live Volume</p>
          <div className="flex items-baseline gap-1">
             <span className="text-2xl font-black text-brand-heading tracking-tighter leading-none">{tank.currentVolume.toLocaleString()}</span>
             <span className="text-[10px] font-bold text-brand-body uppercase tracking-wider">L</span>
          </div>
        </div>
        <div className="bg-brand-surface p-4 rounded-[12px] border border-white/5 group-hover:bg-brand-card transition-colors group-hover:shadow-sm">
          <p className="text-[9px] font-black text-brand-body uppercase tracking-widest mb-1.5">Total Capacity</p>
          <div className="flex items-baseline gap-1">
             <span className="text-2xl font-black text-brand-heading tracking-tighter leading-none">{tank.capacity.toLocaleString()}</span>
             <span className="text-[10px] font-bold text-brand-body uppercase tracking-wider">L</span>
          </div>
        </div>
      </div>

      {/* Forecast & Lifecycle */}
      <div className={`p-4 rounded-[12px] border flex items-center justify-between group-hover:translate-y-[-2px] transition-transform ${isCritical ? 'bg-red-50/50 border-red-100' : isWarning ? 'bg-amber-50/50 border-amber-100' : 'bg-green-50/50 border-green-100'}`}>
         <div className="flex items-center gap-2">
            <TrendingDown size={16} className={isCritical ? 'text-brand-red' : isWarning ? 'text-brand-amber' : 'text-brand-green'} />
            <span className="text-[10px] font-black uppercase text-slate-500">DAYS TO DEPLETION</span>
         </div>
         <span className={`text-sm font-black ${isCritical ? 'text-brand-red' : isWarning ? 'text-brand-amber' : 'text-brand-green'}`}>{tank.daysToEmpty} D</span>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-50 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <Activity size={12} className="text-brand-blue animate-pulse" />
            Last Reading: {formatApiDate(tank.lastReadingAt, { timeOnly: false })}
          </div>
          <button className="flex items-center gap-1.5 text-brand-blue font-black text-[10px] uppercase tracking-[0.1em] opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
            ANALYZE <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        {tank.lastSyncedAt && (
          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <RefreshCw size={10} className="text-slate-300" />
            Last Synced: {formatApiDate(tank.lastSyncedAt)}
          </div>
        )}
      </div>
    </div>
  )
}

export default TankCard
