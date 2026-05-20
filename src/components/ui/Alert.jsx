import { ShieldAlert, Info, CheckCircle2, AlertTriangle } from 'lucide-react'

const VARIANTS = {
  info: {
    base: 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue',
    icon: Info,
    iconBase: 'text-brand-blue bg-brand-blue/10 flex-shrink-0'
  },
  warning: {
    base: 'bg-brand-amber/10 border-brand-amber/20 text-brand-amber',
    icon: AlertTriangle,
    iconBase: 'text-brand-amber bg-brand-amber/10 flex-shrink-0'
  },
  danger: {
    base: 'bg-brand-red/10 border-brand-red/20 text-brand-red',
    icon: ShieldAlert,
    iconBase: 'text-brand-red bg-brand-red/10 flex-shrink-0 pulse-red-glow'
  },
  success: {
    base: 'bg-brand-green/10 border-brand-green/20 text-brand-green',
    icon: CheckCircle2,
    iconBase: 'text-brand-green bg-brand-green/10 flex-shrink-0'
  }
}

const Alert = ({ variant = 'info', title, children, className = '' }) => {
  const config = VARIANTS[variant] || VARIANTS.info
  const Icon = config.icon

  return (
    <div className={`p-4 rounded-[12px] border flex gap-4 transition-all overflow-hidden relative ${config.base} ${className}`}>
      {/* Decorative HUD Scanline */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none opacity-50" />
      
      <div className={`p-2 rounded-[8px] h-fit flex items-center justify-center ${config.iconBase}`}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      
      <div className="flex-1 pt-0.5">
        {title && <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</h4>}
        <div className="text-xs font-medium text-slate-600 leading-relaxed max-w-[95%]">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Alert
