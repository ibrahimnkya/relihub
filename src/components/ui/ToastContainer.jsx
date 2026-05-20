import { useToast } from '../../store/toastStore'
import { createPortal } from 'react-dom'
import { ShieldAlert, Info, CheckCircle2, AlertTriangle, X } from 'lucide-react'

const VARIANTS = {
  info: {
    bg: 'bg-brand-navy border-brand-navy',
    icon: <Info size={18} className="text-brand-blue" />,
  },
  success: {
    bg: 'bg-brand-navy border-brand-green/30',
    icon: <CheckCircle2 size={18} className="text-brand-green" />,
  },
  warning: {
    bg: 'bg-brand-navy border-brand-amber/30',
    icon: <AlertTriangle size={18} className="text-brand-amber" />,
  },
  danger: {
    bg: 'bg-brand-red border-red-500',
    icon: <ShieldAlert size={18} className="text-white pulse-red-glow" />,
  }
}

const ToastContainer = () => {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return createPortal(
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => {
        const config = VARIANTS[toast.type] || VARIANTS.info
        
        return (
          <div 
            key={toast.id}
            className={`pointer-events-auto min-w-[320px] max-w-[400px] p-4 rounded-[12px] shadow-2xl border flex items-start gap-4 animate-slide-in-right ${config.bg} text-white`}
          >
            <div className="mt-0.5">{config.icon}</div>
            <div className="flex-1">
              {toast.title && <h4 className="text-[11px] font-black uppercase tracking-widest mb-1 leading-tight">{toast.title}</h4>}
              {toast.message && <p className="text-xs font-medium text-white/70 leading-relaxed">{toast.message}</p>}
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>,
    document.body
  )
}

export default ToastContainer
