import { useState, useEffect } from 'react'
import { Key, Copy, Plus, RefreshCw, Trash2, Loader2, Globe } from 'lucide-react'
import Badge from '../../../components/ui/Badge'
import { useToast } from '../../../store/toastStore'
import { systemService } from '../../../services/systemService'

const ApiKeys = () => {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [gatewayConfigs, setGatewayConfigs] = useState([])

  const fetchConfigs = async () => {
    setLoading(true)
    try {
      const response = await systemService.getGatewayConfigs()
      setGatewayConfigs(response.data || [])
    } catch (err) {
      addToast({ title: 'Gateway Error', message: 'Failed to synchronize hardware node parameters.', type: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfigs()
  }, [])

  const handleCopy = (prefix) => {
    navigator.clipboard.writeText(prefix)
    addToast({ title: "Key Copied", message: "Gateway token prefix copied to secure clipboard.", type: "info" })
  }

  const handleUpdate = async (id, data) => {
    try {
      await systemService.updateGatewayConfig(id, data)
      addToast({ title: "Node Updated", message: "Gateway configuration synchronized successfully.", type: "success" })
      fetchConfigs()
    } catch (err) {
      addToast({ title: 'Sync Error', message: 'Failed to update gateway node.', type: 'danger' })
    }
  }

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-brand-card rounded-[10px] border border-brand-border">
        <Loader2 className="animate-spin text-brand-blue" size={32} />
        <p className="mt-4 text-[10px] font-black text-brand-body uppercase tracking-widest animate-pulse">Polling Gateway Nodes...</p>
      </div>
    )
  }

  return (
    <div className="bg-brand-card rounded-[10px] p-4 sm:p-6 lg:p-8 border border-brand-border shadow-sm space-y-6 sm:space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-brand-heading mb-1 uppercase tracking-tight">Gateway API & Nodes</h2>
          <p className="text-xs text-brand-body font-bold uppercase tracking-widest opacity-60">Manage hardware integration nodes and authentication tokens.</p>
        </div>
        <button 
          onClick={fetchConfigs}
          className="bg-brand-surface text-brand-heading px-5 py-2.5 rounded-[10px] font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-black/5 transition-all border border-brand-border"
        >
          <RefreshCw size={16} />
          Refresh Nodes
        </button>
      </div>

      <div className="bg-brand-surface p-6 rounded-[10px] border border-brand-border flex items-start gap-4">
        <div className="p-3 bg-brand-blue text-white rounded-[10px] shadow-lg shadow-brand-blue/20">
          <Globe size={20} />
        </div>
        <div>
           <h3 className="text-sm font-black text-brand-heading uppercase mb-1">Active Gateway Gateway</h3>
           <code className="text-xs font-bold text-brand-blue bg-brand-blue/5 px-2 py-1 rounded inline-block border border-brand-blue/10">https://gateway.mafuta.trc.go.tz/v1/</code>
           <p className="text-[10px] text-brand-body font-bold mt-2">Telemetry nodes must utilize these encrypted endpoints for data ingestion.</p>
        </div>
      </div>

      <div className="border border-brand-border rounded-[10px] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-black/5">
            <tr>
              <th className="px-6 py-3.5 text-[10px] font-black text-brand-body uppercase tracking-widest border-b border-brand-border">Node ID / Name</th>
              <th className="px-6 py-3.5 text-[10px] font-black text-brand-body uppercase tracking-widest border-b border-brand-border">Endpoint / Protocol</th>
              <th className="px-6 py-3.5 text-[10px] font-black text-brand-body uppercase tracking-widest border-b border-brand-border">Status</th>
              <th className="px-6 py-3.5 text-right border-b border-brand-border"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {gatewayConfigs.map((config) => (
              <tr key={config.id} className="hover:bg-black/5 transition-all">
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-black text-brand-heading uppercase">{config.name || `Node-${config.node_id}`}</span>
                    <span className="text-[9px] font-bold text-brand-body uppercase tracking-tighter opacity-50">ID: {config.node_id}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono font-bold text-brand-heading bg-black/5 px-2 py-1 rounded border border-brand-border">
                      {config.protocol || 'MQTT'}://{config.endpoint || 'node-edge.local'}
                    </code>
                    <button 
                      onClick={() => handleCopy(config.endpoint)}
                      className="text-brand-body hover:text-brand-blue transition-all"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge label={config.status || 'Active'} variant={config.status === 'Offline' ? 'danger' : 'success'} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                     <button 
                        className="p-2 text-brand-body hover:text-brand-blue hover:bg-brand-blue/5 rounded-[8px] transition-all border border-transparent hover:border-brand-blue/20" 
                        title="Edit Node"
                      >
                        <RefreshCw size={16} />
                     </button>
                  </div>
                </td>
              </tr>
            ))}

            {gatewayConfigs.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-xs font-bold text-brand-body opacity-40 uppercase tracking-[0.2em]">
                  No operational gateway nodes detected.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ApiKeys
