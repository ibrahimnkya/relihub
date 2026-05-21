import { useState, useEffect } from 'react'
import { Save, RefreshCw, Loader2 } from 'lucide-react'
import Select from '../../../components/ui/Select'
import { useToast } from '../../../store/toastStore'
import { systemService } from '../../../services/systemService'
import { useAppStore } from '../../../store/appStore'

const GeneralSettings = () => {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const fetchPlatformSettings = useAppStore(state => state.fetchPlatformSettings)
  const [configs, setConfigs] = useState([])
  const [modules, setModules] = useState([])

  const toggleModuleStatus = (id) => {
    setModules(prev => {
      const next = prev.map(m => 
        m.id === id ? { ...m, status: m.status === 'Operational' ? 'Disabled' : 'Operational' } : m
      )
      return next
    })
  }

  const fetchConfigs = async () => {
    setLoading(true)
    try {
      const response = await systemService.getPlatformConfigs()
      const allConfigs = response.data || []
      
      // Separate module matrix from other configs
      const matrixConfig = allConfigs.find(c => c.key === 'module_matrix')
      const otherConfigs = allConfigs.filter(c => c.key !== 'module_matrix')
      
      setConfigs(otherConfigs)
      
      if (matrixConfig && matrixConfig.value) {
        const parsed = typeof matrixConfig.value === 'string' ? JSON.parse(matrixConfig.value) : matrixConfig.value
        setModules(parsed)
      }
    } catch (err) {
      addToast({ title: 'Fetch Error', message: 'Failed to synchronize platform parameters.', type: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfigs()
  }, [])

  const handleUpdate = async () => {
    setSaving(true)
    try {
      const response = await systemService.getPlatformConfigs()
      const allConfigs = response.data || []
      const matrixConfig = allConfigs.find(c => c.key === 'module_matrix')

      // Update standard configs
      await Promise.all(configs.map(cfg => systemService.updatePlatformConfig(cfg.id, cfg)))
      
      // Update module matrix config
      if (matrixConfig) {
        await systemService.updatePlatformConfig(matrixConfig.id, { 
          ...matrixConfig, 
          value: modules // Pass raw array, server handles stringification
        })
      }

      // Sync global store
      await fetchPlatformSettings()
      
      addToast({ title: "Configuration Updated", message: "Global platform parameters and module matrix successfully synchronized.", type: "success" })
    } catch (err) {
      addToast({ title: 'Update Error', message: 'Failed to persist platform changes.', type: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (id, value) => {
    setConfigs(prev => prev.map(cfg => cfg.id === id ? { ...cfg, value } : cfg))
  }

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center space-y-4 bg-brand-card rounded-[10px] border border-brand-border">
        <Loader2 className="animate-spin text-brand-blue" size={32} />
        <p className="text-[10px] font-black text-brand-body uppercase tracking-[0.2em] animate-pulse">Syncing Network Nodes...</p>
      </div>
    )
  }

  return (
    <div className="bg-brand-card rounded-[10px] p-4 sm:p-6 lg:p-8 border border-brand-border shadow-sm space-y-6 sm:space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-brand-heading mb-1 uppercase tracking-tight">Platform Configuration</h2>
          <p className="text-xs text-brand-body font-bold uppercase tracking-widest">Global parameters for fuel calculation and reporting.</p>
        </div>
        <button onClick={fetchConfigs} className="p-2 hover:bg-brand-surface rounded-lg transition-colors text-brand-body">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {configs.map((cfg) => (
          <div key={cfg.id} className="space-y-2">
            <label className="text-[10px] font-black text-brand-body uppercase tracking-widest ml-1">{cfg.label || cfg.key.replace(/_/g, ' ')}</label>
            <div className="relative">
              <input 
                type={(!isNaN(parseFloat(cfg.value)) && isFinite(cfg.value)) ? 'number' : 'text'} 
                value={cfg.value}
                onChange={(e) => handleChange(cfg.id, e.target.value)}
                className="w-full bg-brand-surface border border-brand-border rounded-[10px] px-4 py-3 text-sm font-bold text-brand-heading focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all"
              />
              {cfg.unit && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-brand-body/40 font-black uppercase">
                  {cfg.unit}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Example if configs list is empty, show default structure */}
        {configs.length === 0 && (
           <p className="col-span-2 text-center text-xs font-bold text-brand-body opacity-40 py-12 border-2 border-dashed border-brand-border rounded-xl uppercase tracking-widest">
             No active platform nodes detected.
           </p>
        )}
      </div>
      
      {/* Module Deployment Matrix */}
      <div className="pt-8 border-t border-brand-border space-y-6">
        <div>
          <h3 className="text-sm font-black text-brand-heading uppercase tracking-widest">Module Deployment Matrix</h3>
          <p className="text-[10px] text-brand-body font-bold uppercase tracking-widest opacity-50 mt-1">Toggle operational availability of core system nodes.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modules.map(module => (
            <div key={module.id} className="bg-brand-surface p-4 rounded-xl border border-brand-border flex items-center justify-between group hover:border-brand-blue/30 transition-all">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-brand-heading uppercase tracking-tight">{module.label || module.id}</span>
                <span className={`text-[9px] font-bold uppercase ${module.status === 'Operational' ? 'text-brand-green' : 'text-brand-red'}`}>{module.status}</span>
              </div>
              <button 
                onClick={() => toggleModuleStatus(module.id)}
                className={`h-5 w-10 rounded-full relative transition-all ${module.status === 'Operational' ? 'bg-brand-blue' : 'bg-slate-300'}`}
              >
                <div className={`h-3 w-3 bg-white rounded-full absolute top-1 transition-all ${module.status === 'Operational' ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* System Maintenance Planning */}
      <div className="pt-8 border-t border-brand-border space-y-6">
        <div>
          <h3 className="text-sm font-black text-brand-heading uppercase tracking-widest">System Maintenance Planning</h3>
          <p className="text-[10px] text-brand-body font-bold uppercase tracking-widest opacity-50 mt-1">Schedule downtime windows for hardware and software upgrades.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-body uppercase tracking-widest ml-1">Planned Maintenance Start</label>
            <input type="datetime-local" className="w-full bg-brand-surface border border-brand-border rounded-[10px] px-4 py-3 text-sm font-bold text-brand-heading focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-body uppercase tracking-widest ml-1">Estimated Duration</label>
            <div className="relative">
              <input type="number" placeholder="4" className="w-full bg-brand-surface border border-brand-border rounded-[10px] px-4 py-3 text-sm font-bold text-brand-heading focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-brand-body/40 font-black uppercase">HOURS</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-6 border-t border-brand-border flex justify-end">
        <button 
          onClick={handleUpdate}
          disabled={saving || configs.length === 0}
          className="bg-brand-blue text-white px-6 py-3 rounded-[10px] font-bold text-xs uppercase tracking-widest hover:bg-brand-hover transition-colors shadow-lg shadow-brand-blue/10 flex items-center gap-2 border border-brand-hover disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
          {saving ? 'Synchronizing...' : 'Update Configuration'}
        </button>
      </div>
    </div>
  )
}

export default GeneralSettings
