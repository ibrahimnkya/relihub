import { MapPin, Clock, Activity, ExternalLink, Zap, ChevronRight, TrendingDown, RefreshCw, TrainFront } from 'lucide-react'
import StatusDot from '../ui/StatusDot'
import Badge from '../ui/Badge'
import { useTranslation } from 'react-i18next'
import TrainVisualizer from '../ui/TrainVisualizer'

const TrainCard = ({ train, onClick }) => {
  const { t } = useTranslation()
  const isLowFuel = train.fuelPct < 20

  return (
    <div 
      onClick={() => onClick(train)}
      className="bg-white rounded-[10px] border border-slate-100 shadow-sm p-6 space-y-6 hover:shadow-2xl hover:border-brand-blue/30 transition-all duration-500 cursor-pointer group relative overflow-hidden active:scale-[0.98]"
    >
      {/* Visual Accent */}
      <div className={`absolute top-0 left-0 w-1.5 h-full transition-all duration-500 ${isLowFuel ? 'bg-brand-red opacity-100' : 'bg-brand-blue opacity-0 group-hover:opacity-100'}`} />
      
      {/* Massive Train Icon Background - Immersive Full Cover */}
      <div className="absolute inset-0 z-0 opacity-[0.05] group-hover:opacity-[0.12] transition-all duration-1000 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="scale-[8] rotate-[-5deg] group-hover:scale-[9] group-hover:rotate-0 transition-all duration-1000 ease-out text-brand-navy">
           <TrainFront strokeWidth={0.5} />
        </div>
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between gap-8">
        {/* Train Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 rounded-[12px] flex items-center justify-center transition-all ${isLowFuel ? 'bg-red-50 text-brand-red border-red-100' : 'bg-blue-50 text-brand-blue border-blue-100'} group-hover:scale-110 shadow-sm border`}>
              <Zap size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-brand-navy uppercase tracking-tight group-hover:text-brand-blue transition-colors leading-none">{train.id}</h3>
              <div className="flex items-center gap-1.5 text-[10px] text-brand-muted font-black uppercase tracking-widest mt-2 px-2.5 py-1 bg-white/50 backdrop-blur-sm border border-slate-200/50 rounded-full w-fit">
                <MapPin size={10} />
                {train.location}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusDot status={train.status} pulse={train.status === 'active'} />
            <Badge label={`${train.fuelPct}% FUEL`} variant={isLowFuel ? 'danger' : 'info'} />
          </div>
        </div>

        {/* Performance Stats HUD */}
        <div className="grid grid-cols-2 gap-3 relative z-10">
          <div className="bg-white/40 backdrop-blur-md p-4 rounded-[12px] border border-white/60 group-hover:bg-white transition-colors group-hover:shadow-lg text-center group/stat">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 group-hover/stat:text-brand-blue transition-colors">Velocity</p>
            <div className="flex items-baseline justify-center gap-1">
               <span className="text-2xl font-black text-brand-navy tracking-tighter leading-none">{train.speed}</span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">KM/H</span>
            </div>
          </div>
          <div className="bg-white/40 backdrop-blur-md p-4 rounded-[12px] border border-white/60 group-hover:bg-white transition-colors group-hover:shadow-lg text-center group/stat">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 group-hover/stat:text-brand-blue transition-colors">Efficiency</p>
            <div className="flex items-baseline justify-center gap-1">
               <span className="text-2xl font-black text-brand-blue tracking-tighter leading-none">88</span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast Bar */}
      <div className={`p-4 rounded-[10px] border flex items-center justify-between group-hover:translate-y-[-2px] transition-transform ${isLowFuel ? 'bg-red-50/50 border-red-100' : 'bg-green-50/50 border-green-100'}`}>
         <div className="flex items-center gap-2">
            <TrendingDown size={16} className={isLowFuel ? 'text-brand-red' : 'text-brand-green'} />
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">RANGE ESTIMATE</span>
         </div>
         <span className={`text-sm font-black ${isLowFuel ? 'text-brand-red' : 'text-brand-green'}`}>142 KM</span>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-50 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <Activity size={12} className="text-brand-blue animate-pulse" />
            Active Signal Stream
          </div>
          <button className="flex items-center gap-1.5 text-brand-blue font-black text-[10px] uppercase tracking-[0.1em] opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
            ANALYZE <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default TrainCard
