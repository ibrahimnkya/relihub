import React from 'react'
import { Scale, TrendingUp, TrendingDown, ArrowRight, Package } from 'lucide-react'

const BalanceFlow = ({ opening, inflows, outflows, variance }) => {
  const isPositive = variance >= 0
  
  return (
    <div className="relative w-full h-48 bg-brand-navy rounded-[15px] border border-white/10 overflow-hidden flex items-center justify-between px-10">
      {/* Background HUD Layers */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0%,_transparent_70%)]"></div>
      
      {/* Left Node: Capital */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className="h-14 w-14 rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
          <Package size={28} className="text-white/40" />
        </div>
        <div className="text-center">
          <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Opening</p>
          <p className="text-xs font-black text-white">{opening.toLocaleString()} L</p>
        </div>
      </div>

      {/* Main Channel */}
      <div className="flex-1 px-4 relative">
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden flex">
          <div className="h-full bg-brand-green/40 shadow-[0_0_10px_rgba(34,197,94,0.3)]" style={{ width: '40%' }}></div>
          <div className="h-full bg-brand-red/40 shadow-[0_0_10px_rgba(220,38,38,0.3)] animate-pulse" style={{ width: '55%' }}></div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
           <div className={`h-12 w-12 rounded-full bg-brand-navy border-2 flex items-center justify-center shadow-2xl transition-all ${isPositive ? 'border-brand-green' : 'border-brand-red'}`}>
              <Scale size={24} className={isPositive ? 'text-brand-green' : 'text-brand-red'} />
           </div>
        </div>
      </div>

      {/* Right Node: Net */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className={`h-14 w-14 rounded-[12px] flex items-center justify-center backdrop-blur-md border ${isPositive ? 'bg-brand-green/10 border-brand-green/20' : 'bg-brand-red/10 border-brand-red/20'}`}>
           {isPositive ? <TrendingUp size={28} className="text-brand-green" /> : <TrendingDown size={28} className="text-brand-red" />}
        </div>
        <div className="text-center">
          <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Variance</p>
          <p className={`text-xs font-black ${isPositive ? 'text-brand-green' : 'text-brand-red'}`}>{variance.toLocaleString()} L</p>
        </div>
      </div>

      <div className="absolute top-4 left-6">
        <div className="flex items-center gap-2">
           <div className="h-1.5 w-1.5 rounded-full bg-brand-blue animate-ping"></div>
           <span className="text-[8px] font-black text-brand-blue uppercase tracking-widest">ledger reconciliation service</span>
        </div>
      </div>
    </div>
  )
}

export default BalanceFlow
