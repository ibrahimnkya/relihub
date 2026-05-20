const StatCard = ({ label, value, unit, variant = 'info', icon: Icon, compact = false }) => {
  const variants = {
    info: 'bg-brand-blue/10 text-brand-blue',
    success: 'bg-brand-green/10 text-brand-green',
    warning: 'bg-brand-amber/10 text-brand-amber',
    danger: 'bg-brand-red/10 text-brand-red',
    neutral: 'bg-black/5 text-brand-body',
  }

  return (
    <div className={`bg-brand-card p-4 rounded-[12px] border border-brand-border shadow-sm flex items-center gap-4 group hover:border-brand-blue/30 transition-all ${compact ? 'py-3 px-4' : 'p-5'}`}>
      <div className={`h-10 w-10 ${variants[variant]} rounded-[12px] flex items-center justify-center transition-transform group-hover:scale-110`}>
        {Icon && <Icon size={20} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-brand-body uppercase tracking-widest mb-0.5 truncate">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-xl font-black ${variant === 'info' || variant === 'neutral' ? 'text-brand-heading' : variants[variant].split(' ')[1]}`}>
            {value}
          </span>
          {unit && <span className="text-[10px] font-bold text-brand-body uppercase">{unit}</span>}
        </div>
      </div>
    </div>
  )
}

export default StatCard
