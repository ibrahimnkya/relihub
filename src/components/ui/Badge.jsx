const Badge = ({ label, variant = 'neutral', pulse = false }) => {
  const variants = {
    success: 'bg-brand-green/10 text-brand-green border-brand-green/20',
    warning: 'bg-brand-amber/10 text-brand-amber border-brand-amber/20',
    danger:  'bg-brand-red/10 text-brand-red border-brand-red/20',
    info:    'bg-brand-blue/10 text-brand-blue border-brand-blue/20',
    neutral: 'bg-black/5 text-brand-body border-brand-border',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${variants[variant]}`}>
      {pulse && (
        <span className={`h-1.5 w-1.5 rounded-full ${variant === 'success' ? 'bg-brand-green' : variant === 'danger' ? 'bg-brand-red' : 'bg-brand-blue'} animate-pulse`}></span>
      )}
      {label}
    </span>
  )
}

export default Badge
