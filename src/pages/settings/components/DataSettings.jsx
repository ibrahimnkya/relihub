import { useState, useEffect } from 'react'
import { Database, Save, Trash2, Loader2, RefreshCw } from 'lucide-react'
import Select from '../../../components/ui/Select'
import Alert from '../../../components/ui/Alert'
import { useToast } from '../../../store/toastStore'
import { systemService } from '../../../services/systemService'

const DataSettings = () => {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [retentionPolicies, setRetentionPolicies] = useState([])

  const fetchPolicies = async () => {
    setLoading(true)
    try {
      const response = await systemService.getDataRetention()
      setRetentionPolicies(response.data || [])
    } catch (err) {
      addToast({ title: 'Sync Failure', message: 'Could not retrieve data retention policies.', type: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPolicies()
  }, [])

  const handleUpdate = async () => {
    setSaving(true)
    try {
      await Promise.all(retentionPolicies.map(p => systemService.updateDataRetention(p.id, p)))
      addToast({ title: "Retention Policy Updated", message: "Data lifecycle parameters have been synchronized.", type: "success" })
    } catch (err) {
      addToast({ title: 'Update Error', message: 'Failed to persist retention changes.', type: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (id, field, value) => {
    setRetentionPolicies(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-brand-card rounded-[10px] border border-brand-border">
        <Loader2 className="animate-spin text-brand-blue" size={32} />
        <p className="mt-4 text-[10px] font-black text-brand-body uppercase tracking-widest animate-pulse">Accessing Data Vault...</p>
      </div>
    )
  }

  return (
    <div className="bg-brand-card rounded-[10px] p-8 border border-brand-border shadow-sm space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-brand-heading mb-1 uppercase tracking-tight">Data Retention</h2>
          <p className="text-xs text-brand-body font-bold uppercase tracking-widest opacity-60">Manage telemetry purging and archive policies.</p>
        </div>
        <button onClick={fetchPolicies} className="p-2 hover:bg-brand-surface rounded-lg transition-colors text-brand-body">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="text-brand-blue" size={20} />
          <h3 className="text-sm font-black text-brand-heading uppercase tracking-widest">Storage Policy</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {retentionPolicies.map((policy) => (
            <div key={policy.id} className="space-y-4">
              <label className="text-[10px] font-black text-brand-body uppercase tracking-widest ml-1">{policy.label || policy.type}</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={policy.value}
                  onChange={(e) => handleChange(policy.id, 'value', e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border rounded-[10px] px-4 py-3 text-sm font-bold text-brand-heading focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all"
                />
              </div>
            </div>
          ))}

          {retentionPolicies.length === 0 && (
             <div className="col-span-2 p-12 text-center bg-brand-surface rounded-xl border border-brand-border">
                <p className="text-xs font-black text-brand-body uppercase tracking-widest opacity-40">No retention policies found.</p>
             </div>
          )}
        </div>
        
        <div className="pt-8">
          <Alert variant="danger" title="Danger Zone">
            <p className="mb-4 text-xs font-medium">Manual purging of operational data is irreversible. Requires dual-admin authorization.</p>
            <button className="bg-brand-red text-white px-5 py-2.5 rounded-[10px] font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-red-600 transition-all shadow-lg shadow-brand-red/10 border border-red-600/20">
              <Trash2 size={16} /> Force Purge Archive
            </button>
          </Alert>
        </div>
      </div>

      <div className="pt-6 border-t border-brand-border flex justify-end">
        <button 
          onClick={handleUpdate}
          disabled={saving || retentionPolicies.length === 0}
          className="bg-brand-blue text-white px-6 py-3 rounded-[10px] font-bold text-xs uppercase tracking-widest hover:bg-brand-hover transition-all shadow-lg shadow-brand-blue/10 flex items-center gap-2 border border-brand-hover disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
          {saving ? 'Synchronizing...' : 'Apply Policy'}
        </button>
      </div>
    </div>
  )
}

export default DataSettings
