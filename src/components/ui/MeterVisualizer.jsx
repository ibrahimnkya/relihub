const MeterVisualizer = ({ rate = 0, status = 'active' }) => {
  const isActive = rate > 0 && status === 'active'
  const isFaulty = status === 'fault'
  
  // High Rate = Faster Rotation
  const rotationDuration = isActive ? Math.max(0.3, 3 - (rate / 35)) : 0
  
  return (
    <div className="relative w-full h-52 flex items-center justify-center bg-brand-surface rounded-[12px] border border-brand-border overflow-hidden group shadow-inner">
      {/* Background Technical Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)" /></svg>
      </div>

      {/* Main Meter Dial Container */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        
        {/* Outer Ring with Progress */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 filter drop-shadow-sm">
          <circle
            cx="88"
            cy="88"
            r="80"
            fill="none"
            stroke="rgba(0,0,0,0.05)"
            strokeWidth="8"
          />
          <circle
            cx="88"
            cy="88"
            r="80"
            fill="none"
            stroke={isFaulty ? '#A41720' : '#2563eb'}
            strokeWidth="8"
            strokeDasharray="502.6"
            strokeDashoffset={502.6 - (502.6 * (Math.min(rate, 100) / 100))}
            className="transition-all duration-[2000ms] ease-out"
            strokeLinecap="round"
          />
        </svg>

        {/* The Turbine - Industrial Look */}
        <div 
          className="relative w-32 h-32 rounded-full bg-brand-card border-2 border-brand-border shadow-xl flex items-center justify-center overflow-hidden z-10"
        >
          {/* Animated Turbine Blades */}
          <div 
            className="absolute inset-0 flex items-center justify-center scale-95"
            style={{ 
                animation: isActive ? `spin-turbine ${rotationDuration}s linear infinite` : 'none',
                opacity: isFaulty ? 0.3 : 1
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M50 50 L50 2 C58 2 65 15 50 50 Z" className="fill-brand-body opacity-40" />
                <path d="M50 50 L50 98 C42 98 35 85 50 50 Z" className="fill-brand-body opacity-40" />
                <path d="M50 50 L2 50 C2 42 15 35 50 50 Z" className="fill-brand-body opacity-60" />
                <path d="M50 50 L98 50 C98 58 85 65 50 50 Z" className="fill-brand-body opacity-60" />
                <circle cx="50" cy="50" r="10" className="fill-brand-heading" />
                <circle cx="50" cy="50" r="4" className="fill-white" />
            </svg>
          </div>
          
          {/* Readout Overlay */}
          <div className="relative z-20 flex flex-col items-center bg-white/95 backdrop-blur-sm px-4 py-2 rounded-[12px] border border-brand-border shadow-sm pointer-events-none">
             <div className="text-3xl font-black text-brand-heading tracking-tighter leading-none animate-fade-in">{rate}</div>
             <div className="text-[8px] font-black text-brand-body uppercase tracking-widest leading-none mt-1">L/MIN</div>
          </div>
        </div>

        {/* Pulsing Aura if active */}
        {isActive && (
            <div className="absolute inset-0 rounded-full bg-brand-blue/5 animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Decorative Flow Lines (Animated) */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
                <div 
                    key={i} 
                    className="absolute h-[1.5px] bg-brand-blue/20 animate-flow-horizontal"
                    style={{ 
                        width: '30px',
                        top: `${20 + i * 15}%`,
                        left: '-50px',
                        animationDelay: `${i * 0.4}s`,
                        animationDuration: `${1.5 + (rate / 50)}s`
                    }}
                />
            ))}
        </div>
      )}

      {/* Hardware Ident Overlay */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
         <div className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-brand-green' : isFaulty ? 'bg-brand-red' : 'bg-brand-border'} animate-pulse`} />
         <span className="text-[7.5px] font-black text-brand-body uppercase tracking-[0.25em] bg-brand-card px-3 py-1 rounded-full border border-brand-border shadow-sm whitespace-nowrap">
            {isFaulty ? 'REPAIR REQ' : isActive ? 'CALIBRATED POLLING' : 'HW IDLE'}
         </span>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-turbine {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes flowHorizontal {
          0% { transform: translateX(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(450px); opacity: 0; }
        }
        .animate-flow-horizontal {
          animation: flowHorizontal linear infinite;
        }
      `}} />
    </div>
  )
}

export default MeterVisualizer
