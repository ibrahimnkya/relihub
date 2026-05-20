import React from 'react'
import { Cylinder, Gauge, Zap, ArrowRight, TrainFront } from 'lucide-react'

const FlowVisualizer = ({ source, meter, target, isActive = true }) => {
  return (
    <div className="relative w-full h-48 bg-brand-navy rounded-[15px] border border-white/10 overflow-hidden flex items-center justify-around p-6">
      {/* Background Grid/HUD Lines */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-white/20"></div>
      </div>

      {/* Connection Pipes */}
      <div className="absolute top-1/2 left-1/4 w-1/2 h-1 bg-white/10 -translate-y-1/2 overflow-hidden">
        {isActive && (
          <div className="absolute top-0 right-[-100%] w-full h-full bg-gradient-to-l from-brand-blue via-brand-blue/50 to-transparent animate-flow-horizontal"></div>
        )}
      </div>

      {/* Nodes */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className={`h-16 w-16 rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md transition-all ${isActive ? 'shadow-[0_0_20px_rgba(162,42,42,0.2)] border-brand-blue/50' : ''}`}>
          <Cylinder size={32} className={isActive ? 'text-brand-blue' : 'text-white/20'} />
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">Source Node</p>
          <p className="text-xs font-black text-white uppercase">{source || 'Tank-01'}</p>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className={`h-20 w-20 rounded-full bg-brand-navy border-2 flex items-center justify-center transition-all ${isActive ? 'border-brand-blue shadow-[0_0_30px_rgba(162,42,42,0.3)]' : 'border-white/10'}`}>
           <div className={`absolute inset-0 rounded-full border border-brand-blue/20 ${isActive ? 'animate-spin-slow' : ''}`}></div>
           <Gauge size={36} className={isActive ? 'text-brand-blue' : 'text-white/20'} />
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">Throughput</p>
          <p className="text-xs font-black text-brand-blue uppercase">{meter || 'FM-102'}</p>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className={`h-16 w-16 rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md transition-all ${isActive ? 'shadow-[0_0_20px_rgba(162,42,42,0.2)] border-brand-blue/50' : ''}`}>
          <TrainFront size={32} className={isActive ? 'text-brand-blue' : 'text-white/20'} />
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">Target Node</p>
          <p className="text-xs font-black text-white uppercase">{target || 'Loco-99'}</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flow-horizontal {
          0% { right: -100%; opacity: 0; }
          50% { opacity: 1; }
          100% { right: 100%; opacity: 0; }
        }
        .animate-flow-horizontal {
          animation: flow-horizontal 2s linear infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}} />
    </div>
  )
}

export default FlowVisualizer
