import { Clock } from 'lucide-react'

const AlertRow = ({ alert, onClick, onEscalate, variant = 'default' }) => {
  const isCompact = variant === 'compact'
  
  return (
    <div 
      onClick={onClick}
      className={`px-6 py-4 transition-all cursor-pointer group border-l-4 border-transparent ${
        isCompact 
          ? 'hover:bg-brand-red/5 hover:border-l-brand-red' 
          : 'hover:bg-black/5 relative'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black uppercase tracking-widest ${isCompact ? 'text-brand-red' : 'text-brand-heading'}`}>
            {alert.category}
          </span>
        </div>
        <span className="text-[10px] text-brand-body font-bold flex items-center gap-1 opacity-60">
          <Clock size={10} /> 
          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      <p className={`text-xs font-black text-brand-heading mb-1 leading-relaxed ${isCompact ? 'group-hover:text-brand-red transition-colors truncate' : ''}`}>
        {alert.message}
      </p>
      
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2 text-[10px] text-brand-body font-bold uppercase tracking-tighter">
          <span className="font-black text-brand-heading px-1.5 py-0.5 bg-black/5 rounded border border-brand-border">{alert.asset}</span>
          {!isCompact && <span className="opacity-60">• Investigation Pending</span>}
        </div>
        
        {!isCompact && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEscalate(alert);
            }}
            className="text-[10px] font-black text-white bg-brand-red px-3 py-1.5 rounded-[12px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-brand-red/10 border border-red-600/20"
          >
            Escalate
          </button>
        )}
        
        {!isCompact && alert.status === 'converted' && (
          <span className="text-[10px] font-bold text-brand-blue flex items-center gap-1">
            Converted to Incident
          </span>
        )}
      </div>
    </div>
  )
}

export default AlertRow
