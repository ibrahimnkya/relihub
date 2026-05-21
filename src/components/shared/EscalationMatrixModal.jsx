import { createPortal } from 'react-dom'
import { X, Phone, Mail, Shield, User, ChevronRight, AlertCircle } from 'lucide-react'

const EscalationMatrixModal = ({ alert, onClose }) => {
  if (!alert) return null

  const matrix = [
    {
      level: 1,
      role: 'Site Supervisor',
      name: 'John Doe',
      phone: '+255 712 345 678',
      email: 'j.doe@trc.go.tz',
      time: 'Immediate',
      status: 'Notified'
    },
    {
      level: 2,
      role: 'Operations Manager',
      name: 'Sarah Smith',
      phone: '+255 754 987 654',
      email: 's.smith@trc.go.tz',
      time: 'T + 30 Mins',
      status: 'Pending'
    },
    {
      level: 3,
      role: 'Technical Admin',
      name: 'Alex Johnson',
      phone: '+255 682 111 222',
      email: 'a.johnson@techtonics.co.tz',
      time: 'T + 1 Hour',
      status: 'Standby'
    }
  ]

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex justify-end">
      <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
      <div className="relative w-full sm:max-w-[500px] bg-white h-full max-h-[100dvh] shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-brand-blue text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-white/10 rounded-[10px] flex items-center justify-center">
              <Shield size={24} className="animate-pulse text-brand-red" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight leading-none mb-1">Escalation Matrix</h3>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">{alert.asset}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Alert Context */}
          <div className="p-4 bg-red-50 border border-red-100 rounded-[12px] flex items-start gap-3">
            <AlertCircle className="text-brand-red flex-shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-[10px] font-black text-brand-red uppercase mb-1">Active Incident</p>
              <p className="text-xs font-bold text-slate-700 leading-snug">{alert.message}</p>
            </div>
          </div>

          {/* Matrix Steps */}
          <div className="space-y-4 relative">
            <div className="absolute left-[21px] top-6 bottom-6 w-0.5 bg-slate-100"></div>
            
            {matrix.map((step, i) => (
              <div key={i} className="relative flex items-start gap-4 group">
                <div className={`
                  h-11 w-11 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 transition-all
                  ${step.status === 'Notified' ? 'bg-brand-green text-white' : 'bg-slate-100 text-slate-400'}
                `}>
                  <span className="text-xs font-black">{step.level}</span>
                </div>
                
                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-[12px] p-4 group-hover:bg-white group-hover:border-brand-blue/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{step.role}</p>
                      <p className="text-sm font-black text-brand-navy">{step.name}</p>
                    </div>
                    <Badge 
                      label={step.time} 
                      variant={step.status === 'Notified' ? 'success' : 'neutral'} 
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <a href={`tel:${step.phone}`} className="flex items-center gap-2 text-[10px] font-bold text-brand-blue hover:underline">
                      <Phone size={12} />
                      {step.phone}
                    </a>
                    <a href={`mailto:${step.email}`} className="flex items-center gap-2 text-[10px] font-bold text-brand-blue hover:underline">
                      <Mail size={12} />
                      {step.email}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white border-t border-slate-100">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-brand-blue text-white rounded-[10px] font-black text-xs uppercase tracking-widest hover:bg-brand-hover transition-all shadow-lg active:scale-95"
          >
            Acknowledge Escalation
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

const Badge = ({ label, variant }) => (
  <span className={`
    px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest
    ${variant === 'success' ? 'bg-brand-green/10 text-brand-green' : 'bg-slate-200 text-slate-500'}
  `}>
    {label}
  </span>
)

export default EscalationMatrixModal
