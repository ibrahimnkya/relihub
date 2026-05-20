import React from 'react'
import { ShieldAlert, Zap, Radio } from 'lucide-react'

const AlertRadar = ({ alertCount = 0 }) => {
  return (
    <div className="relative w-full h-48 bg-brand-navy rounded-[12px] border border-white/10 overflow-hidden flex items-center justify-center p-6">
      {/* Radar Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/10 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/5 rounded-full"></div>
        <div className="absolute top-0 left-1/2 w-px h-full bg-white/5 -translate-x-1/2"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 -translate-y-1/2"></div>
      </div>

      {/* Sweeper Line */}
      <div className="absolute top-1/2 left-1/2 w-[50%] h-[50%] bg-gradient-to-tr from-brand-blue/30 to-transparent origin-bottom-left animate-radar-sweep shadow-[0_0_20px_rgba(162,42,42,0.1)]"></div>

      {/* Center Node */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className={`h-20 w-20 rounded-full bg-brand-navy border-2 border-brand-blue flex items-center justify-center shadow-[0_0_30px_rgba(162,42,42,0.3)]`}>
          <Radio size={36} className="text-brand-blue animate-pulse" />
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] leading-none mb-1">Active Surveillance</p>
          <div className="flex items-center gap-2 justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse"></div>
            <p className="text-xs font-black text-white uppercase tracking-widest">Global Watchdog Online</p>
          </div>
        </div>
      </div>

      {/* "Detected" Anomalies in Radar */}
      <div className="absolute top-1/4 right-1/3 animate-pulse opacity-60">
        <div className="h-3 w-3 rounded-full bg-brand-red shadow-[0_0_10px_rgba(220,38,38,0.8)]"></div>
      </div>
      <div className="absolute bottom-1/3 left-1/4 animate-pulse-slow opacity-40">
        <div className="h-2 w-2 rounded-full bg-brand-amber shadow-[0_0_10px_rgba(234,179,8,0.8)]"></div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes radar-sweep {
          from { transform: rotate(0deg) translate(-100%, -100%); }
          to { transform: rotate(360deg) translate(-100%, -100%); }
        }
        .animate-radar-sweep {
          animation: radar-sweep 4s linear infinite;
        }
      `}} />
    </div>
  )
}

export default AlertRadar
