import { useState } from 'react'
import { Link2, Shield, Lock, Fingerprint, Eye, EyeOff, Save } from 'lucide-react'
import { useToast } from '../../../store/toastStore'

const SecuritySettings = () => {
  const { addToast } = useToast()
  const [showPwd, setShowPwd] = useState(false)
  
  return (
    <div className="bg-brand-card rounded-[10px] p-8 border border-brand-border shadow-sm space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-brand-heading mb-1 uppercase tracking-tight">Security Protocol</h2>
          <p className="text-xs text-brand-body font-bold uppercase tracking-widest opacity-60">Configure authentication policies and access layers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Password Policy */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="text-brand-blue" size={20} />
            <h3 className="text-sm font-black text-brand-heading uppercase tracking-widest">Authentication</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-brand-surface rounded-[10px] border border-brand-border transition-all hover:bg-black/5 cursor-pointer">
              <div>
                <p className="text-xs font-black text-brand-heading uppercase">Enforce Multi-Factor (MFA)</p>
                <p className="text-[10px] font-bold text-brand-body mt-0.5 opacity-60">Require 2FA for all admin nodes.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-black/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-transparent after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green"></div>
              </label>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-body uppercase tracking-widest ml-1">Session Expiry (Minutes)</label>
              <input 
                type="number" 
                defaultValue="30"
                className="w-full bg-brand-surface border border-brand-border rounded-[10px] px-4 py-3 text-sm font-bold text-brand-heading focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Global Access Config */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="text-brand-blue" size={20} />
            <h3 className="text-sm font-black text-brand-heading uppercase tracking-widest">Global Integrity</h3>
          </div>
          
          <div className="space-y-4">
             <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-body uppercase tracking-widest ml-1">IP Whitelist (Comma Separated)</label>
              <textarea 
                rows="3"
                defaultValue="192.168.1.0/24, 10.0.0.0/8"
                className="w-full bg-brand-surface border border-brand-border rounded-[10px] px-4 py-3 text-sm font-mono text-brand-heading focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all resize-none"
              ></textarea>
            </div>

            <div className="flex items-center justify-between p-4 bg-brand-surface rounded-[10px] border border-brand-border transition-all hover:bg-black/5 cursor-pointer">
              <div>
                <p className="text-xs font-black text-brand-heading uppercase">Strict Device Binding</p>
                <p className="text-[10px] font-bold text-brand-body mt-0.5 opacity-60">Bind sessions to hardware signatures.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" />
                <div className="w-11 h-6 bg-black/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-transparent after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-brand-border flex justify-end">
        <button 
          onClick={() => addToast({ title: "Security Protocols Enforced", message: "Global security layers have been updated across all nodes.", type: "success" })}
          className="bg-brand-blue text-white px-6 py-3 rounded-[10px] font-bold text-xs uppercase tracking-widest hover:bg-brand-hover transition-all shadow-lg shadow-brand-blue/10 flex items-center gap-2 border border-brand-hover"
        >
          <Save size={16} /> Enforce Policies
        </button>
      </div>
    </div>
  )
}

export default SecuritySettings
