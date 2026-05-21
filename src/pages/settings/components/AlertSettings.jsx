import { Bell, Mail, MessageSquare, AlertTriangle, Save } from 'lucide-react'
import { useToast } from '../../../store/toastStore'

const AlertSettings = () => {
  const { addToast } = useToast()
  return (
    <div className="bg-brand-card rounded-[10px] p-4 sm:p-6 lg:p-8 border border-brand-border shadow-sm space-y-6 sm:space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-brand-heading mb-1 uppercase tracking-tight">Telemetry Alerts</h2>
          <p className="text-xs text-brand-body font-bold uppercase tracking-widest">Configure anomaly detection and broadcast channels.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
           <h3 className="text-sm font-black text-brand-heading uppercase tracking-widest border-b border-brand-border pb-2">Broadcast Channels</h3>
           
           <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-brand-surface rounded-[10px] border border-brand-border transition-all hover:border-brand-blue/30 hover:bg-black/5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-blue text-white p-2 rounded-[8px]">
                     <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-brand-heading uppercase">Secure Email Gateway</p>
                    <p className="text-[10px] font-bold text-brand-body mt-0.5">Route: alerts@trc.go.tz</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-black/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black/5 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                </label>
              </div>

               <div className="flex items-center justify-between p-4 bg-brand-surface rounded-[10px] border border-brand-border transition-all hover:border-brand-blue/30 hover:bg-black/5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-blue text-white p-2 rounded-[8px]">
                     <MessageSquare size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-brand-heading uppercase">SMS Uplink</p>
                    <p className="text-[10px] font-bold text-brand-body mt-0.5">Critical anomalies only.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-black/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black/5 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                </label>
              </div>
           </div>
        </div>

        <div className="space-y-6">
            <h3 className="text-sm font-black text-brand-heading uppercase tracking-widest border-b border-brand-border pb-2">Detection Thresholds</h3>
           
           <div className="space-y-4">
               <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-body uppercase tracking-widest ml-1 flex items-center justify-between">
                  <span>Confidence Warning Level (%)</span>
                  <span className="text-brand-amber">Below 80% triggers investigation</span>
                </label>
                 <div className="relative">
                    <div className="w-full bg-brand-surface h-2 rounded-full overflow-hidden mt-4 border border-brand-border">
                       <div className="bg-brand-amber h-full" style={{ width: '80%' }}></div>
                    </div>
                   <input type="range" min="0" max="100" defaultValue="80" className="w-full absolute top-2 left-0 opacity-0 cursor-pointer" />
                </div>
              </div>

               <div className="space-y-2 pt-4">
                <label className="text-[10px] font-black text-brand-body uppercase tracking-widest ml-1 flex items-center justify-between">
                  <span>Severe Volume Delta (Liters)</span>
                  <span className="text-brand-red">&gt; 50L triggers Lockdown</span>
                </label>
                  <div className="relative">
                    <div className="w-full bg-brand-surface h-2 rounded-full overflow-hidden mt-4 border border-brand-border">
                       <div className="bg-brand-red h-full" style={{ width: '50%' }}></div>
                    </div>
                   <input type="range" min="0" max="100" defaultValue="50" className="w-full absolute top-2 left-0 opacity-0 cursor-pointer" />
                </div>
              </div>
           </div>
        </div>
      </div>

      <div className="pt-6 border-t border-brand-border flex justify-end">
        <button 
          onClick={() => addToast({ title: "Thresholds Updated", message: "Detection parameters have been synchronized with the signal processor.", type: "success" })}
          className="bg-brand-blue text-white px-6 py-3 rounded-[10px] font-bold text-xs uppercase tracking-widest hover:bg-brand-hover transition-colors shadow-lg shadow-brand-blue/10 flex items-center gap-2 border border-brand-hover"
        >
          <Save size={16} /> Update Thresholds
        </button>
      </div>
    </div>
  )
}

export default AlertSettings
