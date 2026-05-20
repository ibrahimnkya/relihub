const FuelGauge = ({ percentage, variant = 'dynamic' }) => {
  const getDynamicVariant = () => {
    if (percentage > 30) return 'bg-brand-green'
    if (percentage > 15) return 'bg-brand-amber'
    return 'bg-brand-red'
  }

  const variantColor = variant === 'dynamic' ? getDynamicVariant() : 
    variant === 'success' ? 'bg-brand-green' : 
    variant === 'warning' ? 'bg-brand-amber' : 
    variant === 'danger' ? 'bg-brand-red' : 'bg-brand-blue'

  return (
    <div className="relative h-44 w-full bg-slate-50 rounded-[12px] border border-slate-100 flex flex-col items-center justify-end p-4 overflow-hidden group">
      {/* Visual gauge background */}
      <div className="absolute inset-x-6 bottom-16 top-6 bg-slate-100 rounded-[12px] overflow-hidden border border-slate-200 shadow-inner">
        {/* Animated Fill */}
        <div 
          className={`absolute bottom-0 inset-x-0 transition-all duration-[2000ms] ease-out ${variantColor} relative`}
          style={{ height: `${percentage}%` }}
        >
          {/* Wave Effect */}
          <div className="absolute top-0 left-0 right-0 h-4 -translate-y-1/2 opacity-30 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-white/40 animate-wave-slow rounded-full blur-sm" style={{ width: '200%', left: '-50%' }}></div>
          </div>
          
          {/* Bubbles / Texture */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="absolute bottom-2 left-4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
             <div className="absolute bottom-8 right-6 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-700"></div>
             <div className="absolute bottom-14 left-8 w-1 h-1 bg-white rounded-full animate-pulse delay-300"></div>
          </div>
        </div>

        {/* Gauge markers */}
        <div className="absolute inset-0 flex flex-col justify-between py-4 px-2 pointer-events-none opacity-20 z-10">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="border-t border-brand-navy w-3 ml-auto h-0" />
          ))}
        </div>
      </div>
      
      {/* Label/Percentage */}
      <div className="relative z-20 flex flex-col items-center mt-2">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-brand-navy tracking-tighter leading-none animate-fade-in">{percentage}</span>
          <span className="text-sm font-black text-brand-muted">%</span>
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 shadow-sm px-2 py-0.5 bg-white/50 rounded-[12px]">Telemetry Active</span>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wave {
          0% { transform: translateX(0) translateY(-50%) rotate(0deg); }
          100% { transform: translateX(-20%) translateY(-50%) rotate(360deg); }
        }
        .animate-wave-slow {
          animation: wave 10s linear infinite;
        }
      `}} />
    </div>
  )
}

export default FuelGauge
