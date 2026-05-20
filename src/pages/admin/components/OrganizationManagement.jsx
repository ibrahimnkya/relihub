import { useState, useEffect } from 'react'
import { 
  Building2, 
  Plus, 
  Search, 
  MoreVertical, 
  ExternalLink, 
  Users, 
  Database,
  Globe,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  X,
  Settings,
  AlertTriangle,
  ChevronRight,
  RefreshCw
} from 'lucide-react'
import { createPortal } from 'react-dom'
import Badge from '../../../components/ui/Badge'
import { companyService } from '../../../services/companyService'
import { useToast } from '../../../store/toastStore'
import { useAuthStore } from '../../../store/authStore'
import CompanyPortal from './CompanyPortal'
import ProvisioningModal from '../../../components/shared/ProvisioningModal'

const OrganizationManagement = () => {
  const [entities, setEntities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteConfirmName, setDeleteConfirmName] = useState('')
  const [provisioningCompanyId, setProvisioningCompanyId] = useState(null)
  const [isProvisioningModalOpen, setIsProvisioningModalOpen] = useState(false)
  
  const { user } = useAuthStore()
  const { addToast } = useToast()
  
  const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'Technical Admin' || user?.role === 'System Admin' || !user?.company_id
  const entityType = isSuperAdmin ? 'Company' : 'Branch'
  const entityLabel = isSuperAdmin ? 'Companies' : 'Branches'

  useEffect(() => {
    fetchEntities()
  }, [])

  const fetchEntities = async () => {
    setLoading(true)
    try {
      const res = isSuperAdmin 
        ? await companyService.getCompanies()
        : await companyService.getBranches(user?.company_id)
        
      setEntities(res.data?.returnData?.list_of_item || res.data || [])
    } catch (error) {
      console.error(`Failed to fetch ${entityType}s:`, error)
      addToast({ 
        title: 'Sync Error', 
        message: `Failed to retrieve ${entityType.toLowerCase()} records from the live gateway.`, 
        type: 'danger' 
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredEntities = entities.filter(e => {
    const matchesSearch = e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.registration_number?.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false
    
    if (statusFilter === 'Active') return e.status === 'active'
    if (statusFilter === 'Pending') return e.status === 'pending' || e.status !== 'active'
    return true
  })

  if (!isSuperAdmin && user?.company_id) {
    return <CompanyPortal company={{ id: user.company_id, name: user.company_name || user.company?.name || 'Your Company', status: 'active' }} onBack={() => {}} />
  }

  if (selectedCompany) {
    return <CompanyPortal company={selectedCompany} onBack={() => setSelectedCompany(null)} />
  }

  const handleDelete = async () => {
    if (deleteConfirmName !== deleteTarget?.name) return
    
    try {
      await companyService.deleteCompany(deleteTarget.id)
      addToast({ title: 'Success', message: 'Company record has been permanently removed.', type: 'success' })
      setDeleteTarget(null)
      setDeleteConfirmName('')
      fetchEntities()
    } catch (err) {
      addToast({ title: 'Delete Error', message: 'Failed to remove company record.', type: 'danger' })
    }
  }

  const initiateDelete = (entity) => {
    setDeleteTarget(entity)
    setDeleteConfirmName('')
  }

  const handleEdit = (entity) => {
    setProvisioningCompanyId(entity.id)
    setIsProvisioningModalOpen(true)
  }

  const handleOpenCreate = () => {
    setProvisioningCompanyId(null)
    setIsProvisioningModalOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in-up relative font-sans">
      
      {/* Background Decor blur shapes */}
      <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-[#A41720]/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
      
      {/* Header HUD Banner - Beautiful Glassmorphic Light layout */}
      <div className="bg-white p-8 rounded-[24px] border border-slate-200/80 relative overflow-hidden shadow-sm z-10">
        
        {/* Subtle glow beacon in top-right */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[120%] bg-gradient-to-br from-[#A41720]/5 via-transparent to-transparent rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 bg-red-50 rounded-full border border-red-100/80 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#A41720] animate-pulse"></span>
                <span className="text-[9px] font-black text-[#A41720] tracking-widest uppercase">System Directory</span>
              </div>
              <button 
                onClick={fetchEntities}
                className="p-1 text-slate-400 hover:text-[#A41720] transition-colors"
                title="Refresh Records"
              >
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic leading-none">
              {entityLabel} <span className="text-[#A41720] not-italic">Setup</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              Company Administration, Network Nodes, & Operational Profile Configuration
            </p>
          </div>
          
          <button 
            onClick={handleOpenCreate}
            className="px-6 py-3.5 bg-[#A41720] hover:bg-[#C0152A] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md shadow-[#A41720]/15 hover:shadow-lg transition-all flex items-center gap-2 border border-[#C0152A] active:scale-95 shrink-0"
          >
            <Plus size={14} />
            Add {entityType}
          </button>
        </div>
      </div>

      {/* Statistics HUD Metrics - Modern Premium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
        {[
          { label: `Total ${entityLabel}`, value: entities.length, icon: Building2, active: true },
          { label: 'Active Divisions', value: entities.reduce((acc, e) => acc + (e.node_count || 0), 0), icon: Database, active: false },
          { label: 'Total Employees', value: entities.reduce((acc, e) => acc + (e.user_count || 0), 0), icon: Users, active: false },
          { label: 'Gateway Security', value: 'Active', icon: ShieldCheck, active: true },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200/80 p-6 rounded-[20px] hover:border-[#A41720]/30 transition-all duration-300 shadow-sm relative overflow-hidden group">
            {/* Soft decorative hover blob */}
            <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-[#A41720]/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
            
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[#A41720] group-hover:bg-[#A41720]/10 transition-colors duration-300">
                <stat.icon size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-black text-slate-800 tracking-tight uppercase italic">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Control Bar - Filters & High-Contrast Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 relative z-10">
        
        {/* Modern Pill Segmented Control */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/60 backdrop-blur-sm self-start">
          {['All', 'Active', 'Pending'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                statusFilter === status 
                  ? 'bg-[#A41720] text-white shadow-md shadow-[#A41720]/15' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Clean Rounded Search Box */}
        <div className="relative group w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#A41720] transition-colors" size={14} />
          <input 
            type="text"
            placeholder="SEARCH ORGANISATION..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-[14px] py-3 pl-11 pr-4 text-[10px] font-black uppercase tracking-[0.15em] focus:outline-none focus:ring-4 focus:ring-[#A41720]/5 focus:border-[#A41720] transition-all placeholder:text-slate-400 text-slate-800"
          />
        </div>
      </div>

      {/* Main List Table View - High Contrast Clean Standard Table */}
      <div className="border border-slate-200/80 rounded-[20px] overflow-hidden bg-white relative z-10 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/60">
                <th className="px-8 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Company Details</th>
                <th className="px-8 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Registration ID</th>
                <th className="px-8 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Active Resources</th>
                <th className="px-8 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4.5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3, 4].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-slate-100 rounded-lg"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                          <div className="h-2 bg-slate-100 rounded w-1/3"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredEntities.length > 0 ? (
                filteredEntities.map((entity) => (
                  <tr key={entity.id} className="hover:bg-slate-50/40 transition-all duration-300 group">
                    
                    {/* Details Column */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center font-black border border-slate-200/60 shadow-sm group-hover:bg-[#A41720]/10 group-hover:text-[#A41720] group-hover:border-[#A41720]/20 transition-all duration-500 shrink-0">
                          {isSuperAdmin ? <Building2 size={18} /> : <MapPin size={18} />}
                        </div>
                        <div>
                          <p className="text-[12.5px] font-black text-slate-800 uppercase leading-none mb-1 group-hover:text-[#A41720] transition-colors duration-300">{entity.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase leading-none">{entity.email || 'system@mafuta.io'}</p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Registration ID Column */}
                    <td className="px-8 py-5">
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest py-1.5 px-2.5 bg-slate-50 rounded-lg border border-slate-200/60 group-hover:bg-white group-hover:border-[#A41720]/20 transition-all">
                        {entity.registration_number || `ORG-${entity.id}`}
                      </span>
                    </td>
                    
                    {/* Active Resources Column */}
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-6">
                        <div className="flex flex-col items-center" title="Personnel Count">
                          <span className="text-[11px] font-black text-slate-700 leading-none">{entity.user_count || 0}</span>
                          <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider mt-1 flex items-center gap-0.5">
                            <Users size={10} className="text-[#A41720]/60" /> Staff
                          </span>
                        </div>
                        
                        <div className="h-6 w-px bg-slate-100"></div>
                        
                        <div className="flex flex-col items-center" title="Deployed Nodes">
                          <span className="text-[11px] font-black text-slate-700 leading-none">{entity.node_count || 0}</span>
                          <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider mt-1 flex items-center gap-0.5">
                            <Database size={10} className="text-[#A41720]/60" /> Nodes
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    {/* Status Column */}
                    <td className="px-8 py-5">
                      <Badge variant={entity.status === 'active' ? 'success' : 'warning'}>
                        {entity.status?.toUpperCase() || 'ONLINE'}
                      </Badge>
                    </td>
                    
                    {/* Actions Column (Reveals on Hover) */}
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-all duration-300">
                        <button 
                          onClick={() => setSelectedCompany(entity)}
                          className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#A41720] rounded-[10px] transition-all border border-slate-100 hover:border-[#A41720] shadow-sm active:scale-95"
                          title="Enter Portal Dashboard"
                        >
                          <ExternalLink size={14} />
                        </button>
                        
                        <button 
                          onClick={() => handleEdit(entity)}
                          className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#A41720] rounded-[10px] transition-all border border-slate-100 hover:border-[#A41720] shadow-sm active:scale-95"
                          title="Configure Settings"
                        >
                          <Settings size={14} />
                        </button>
                        
                        <button 
                          onClick={() => initiateDelete(entity)}
                          className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-600 rounded-[10px] transition-all border border-slate-100 hover:border-red-600 shadow-sm active:scale-95"
                          title="Delete Permanently"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-300">
                      <Globe size={48} className="animate-pulse" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">No active entities located</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provisioning Configuration Modal */}
      <ProvisioningModal 
        isOpen={isProvisioningModalOpen}
        onClose={() => setIsProvisioningModalOpen(false)}
        companyId={provisioningCompanyId}
        onSaveSuccess={fetchEntities}
      />

      {/* Delete Confirmation Portal Overlay - Restyled to modern clean light overlay */}
      {deleteTarget && createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setDeleteTarget(null)} />
          
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl relative z-10 overflow-hidden animate-scale-in">
            <div className="p-8 text-center">
              
              {/* Caution Icon badge */}
              <div className="h-14 w-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                <AlertTriangle size={24} className="text-[#A41720]" />
              </div>
              
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-1">Delete Entity</h3>
              <p className="text-[9px] text-slate-400 font-black leading-relaxed mb-6 uppercase tracking-wider">
                This action is <span className="text-[#A41720]">irreversible</span>. All node channels and databases bound to this record will be purged.
              </p>

              <div className="text-left mb-6">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                  Confirm by typing <span className="text-slate-800 font-bold">"{deleteTarget.name}"</span>
                </label>
                <input 
                  type="text"
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  placeholder="TYPE ENTITY NAME..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-xs font-black uppercase tracking-[0.1em] focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all text-center text-[#A41720]"
                />
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setDeleteTarget(null)}
                  className="py-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={deleteConfirmName.trim().toLowerCase() !== deleteTarget.name.trim().toLowerCase()}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md ${
                    deleteConfirmName.trim().toLowerCase() === deleteTarget.name.trim().toLowerCase() 
                      ? 'bg-[#A41720] hover:bg-[#C0152A] text-white shadow-[#A41720]/15 active:scale-95' 
                      : 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed'
                  }`}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default OrganizationManagement
