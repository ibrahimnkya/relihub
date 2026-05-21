import { ShieldAlert } from 'lucide-react'

const AccessRestricted = ({ moduleName, moduleCode }) => {
  return (
    <div className="h-[calc(100vh-140px)] flex items-center justify-center p-6">
      <div className="bg-brand-card border border-brand-border p-6 sm:p-12 rounded-[20px] sm:rounded-[32px] max-w-md mx-4 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-red opacity-20"></div>
        <div className="h-20 w-20 bg-brand-red/10 text-brand-red rounded-full flex items-center justify-center mx-auto animate-pulse">
          <ShieldAlert size={40} className="text-brand-red" />
        </div>
        <div>
          <h3 className="text-xl font-black text-brand-heading uppercase tracking-tight">Access Restricted</h3>
          <p className="text-xs text-brand-body font-bold uppercase tracking-widest mt-2 opacity-60">Module Node: {moduleCode}</p>
        </div>
        <p className="text-sm text-brand-body font-medium leading-relaxed">
          The {moduleName} infrastructure is currently <span className="text-brand-red font-black">DEACTIVATED</span> for your organization. Please contact your system administrator to provision this node.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="w-full py-4 bg-brand-surface border border-brand-border rounded-[16px] font-black text-[10px] uppercase tracking-widest hover:bg-black/5 transition-all text-brand-heading"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  )
}

export default AccessRestricted
