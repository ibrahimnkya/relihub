const StatusDot = ({ status = 'idle', pulse = false }) => {
  const colors = {
    active:  'bg-brand-green',
    idle:    'bg-brand-amber',
    offline: 'bg-brand-red',
    fault:   'bg-brand-red',
    calib_due: 'bg-brand-amber',
  }

  return (
    <div className={`h-2.5 w-2.5 rounded-full ${colors[status]} ${pulse ? 'animate-pulse' : ''} shadow-sm border border-white/20`} />
  )
}

export default StatusDot
