const ProgressBar = ({ value, max = 100, label, showVariance = false, variant = 'info' }) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100)
  
  const variants = {
    info: 'bg-brand-blue',
    success: 'bg-brand-green',
    warning: 'bg-brand-amber',
    danger: 'bg-brand-red',
  }

  const getDynamicVariant = () => {
    if (percentage > 75) return variants.success
    if (percentage > 25) return variants.warning
    return variants.danger
  }

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">{label}</span>
          <span className="text-xs font-bold text-brand-navy">{percentage}%</span>
        </div>
      )}
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200">
        <div 
          className={`h-full transition-all duration-500 rounded-full ${variant === 'dynamic' ? getDynamicVariant() : variants[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showVariance && (
        <p className="text-[10px] text-brand-muted mt-1 font-medium">
          Expected vs Actual variance: <span className="text-brand-red font-bold">-2.5%</span>
        </p>
      )}
    </div>
  )
}

export default ProgressBar
