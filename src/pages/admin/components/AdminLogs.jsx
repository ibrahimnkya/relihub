import { useState, useEffect } from 'react'
import { 
  History, 
  Search, 
  Download, 
  Filter, 
  Terminal, 
  User, 
  Shield, 
  Activity,
  AlertCircle,
  Database,
  RefreshCw
} from 'lucide-react'
import Badge from '../../../components/ui/Badge'
import { systemService } from '../../../services/systemService'

const AdminLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all') // all, security, system, hardware
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await systemService.getAuditLogs({
        type: filter !== 'all' ? filter : undefined,
        search: searchQuery || undefined
      })
      setLogs(res.data?.returnData?.list_of_item || [])
    } catch (error) {
      console.error('Failed to fetch logs:', error)
      // If live API fails, we show empty state rather than mock
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.type === filter
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.user.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getLogIcon = (type) => {
    switch (type) {
      case 'security': return <Shield size={16} className="text-brand-amber" />
      case 'internal': 
      case 'system': return <Activity size={16} className="text-brand-blue" />
      case 'equipment': 
      case 'hardware': return <Database size={16} className="text-brand-green" />
      default: return <History size={16} className="text-brand-body" />
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up relative">
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
        <Terminal size={200} />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <h2 className="text-xl font-black text-brand-heading mb-1 uppercase tracking-tight">Activity History</h2>
          <p className="text-xs text-brand-body font-bold uppercase tracking-widest opacity-60">Complete Audit Trail for Management Actions & Equipment Events</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-brand-surface border border-brand-border rounded-xl text-brand-body hover:text-brand-blue transition-all shadow-sm">
            <Download size={20} />
          </button>
          <button onClick={fetchLogs} className="p-3 bg-brand-surface border border-brand-border rounded-xl text-brand-body hover:text-brand-blue transition-all shadow-sm">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4 relative z-10">
        <div className="relative group flex-1 w-full md:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-body opacity-40 group-focus-within:text-brand-blue transition-colors" size={18} />
          <input 
            type="text"
            placeholder="FILTER BY ACTION, TARGET OR OPERATOR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/5 border border-brand-border rounded-[12px] py-3 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 bg-black/5 p-1 rounded-xl border border-brand-border w-full md:w-auto overflow-x-auto">
          {['all', 'security', 'internal', 'equipment'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 text-[9px] font-black uppercase tracking-[0.15em] rounded-lg transition-all ${
                filter === type 
                  ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                  : 'text-brand-body hover:bg-white/50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-brand-surface border border-brand-border rounded-[24px] overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-black/5 border-b border-brand-border">
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-brand-body opacity-60">Type</th>
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-brand-body opacity-60">Action & Target</th>
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-brand-body opacity-60">Performed By</th>
              <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-brand-body opacity-60">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-brand-blue/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-black/5 rounded-lg flex items-center justify-center">
                      {getLogIcon(log.type)}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-heading">{log.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-black text-brand-heading uppercase tracking-tight">{log.action}</p>
                    <p className="text-[9px] text-brand-body font-bold uppercase tracking-widest opacity-60">Ref: {log.target}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User size={12} className="text-brand-blue" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-body">{log.user}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-brand-heading uppercase tracking-tighter">
                      <Clock size={10} className="opacity-40" />
                      {log.timestamp}
                    </div>
                    <Badge variant={log.status === 'success' ? 'success' : 'danger'}>
                      {log.status === 'success' ? 'LOGGED' : 'ALERT'}
                    </Badge>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="py-20 flex flex-col items-center justify-center gap-4 animate-pulse">
            <RefreshCw className="animate-spin text-brand-blue" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-body">Synchronizing Event Stream...</p>
          </div>
        )}

        {!loading && filteredLogs.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-20">
            <Database size={48} />
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-body">No Historical Records Found</p>
          </div>
        )}
      </div>
    </div>
  )
}

const Clock = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)

export default AdminLogs
