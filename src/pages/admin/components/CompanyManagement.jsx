import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { 
  Building2, 
  Plus, 
  Search, 
  ExternalLink, 
  X, 
  Save, 
  Trash2, 
  Edit2, 
  RefreshCw,
  MoreVertical,
  Activity,
  Users as UsersIcon,
  Database,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import Badge from '../../../components/ui/Badge'
import { useToast } from '../../../store/toastStore'
import { companyService } from '../../../services/companyService'

const CompanyManagement = () => {
  const { addToast } = useToast()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [form, setForm] = useState({
    name: '',
    registration_number: '',
    email: '',
    phone: '',
    address: '',
    status: 'active'
  })

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    setLoading(true)
    try {
      const res = await companyService.getCompanies()
      setCompanies(res.data?.returnData?.list_of_item || [])
    } catch (error) {
      console.error('Failed to fetch companies:', error)
      addToast({ title: 'Sync Error', message: 'Failed to retrieve administrative entities from the live gateway.', type: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (selectedCompany) {
        await companyService.updateCompany(selectedCompany.id, form)
        addToast({ title: 'Company Updated', message: `${form.name} configuration synchronized.`, type: 'success' })
      } else {
        await companyService.createCompany(form)
        addToast({ title: 'Company Registered', message: `${form.name} has been provisioned as a new node.`, type: 'success' })
      }
      setIsModalOpen(false)
      fetchCompanies()
    } catch (error) {
      addToast({ title: 'Protocol Error', message: 'Failed to synchronize company data.', type: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to decommission this company? All associated node data will be archived.')) return
    try {
      await companyService.deleteCompany(id)
      addToast({ title: 'Company Decommissioned', message: 'Entity has been removed from active oversight.', type: 'success' })
      fetchCompanies()
    } catch (error) {
      addToast({ title: 'Decommission Failed', message: 'Entity is locked by active hardware nodes.', type: 'danger' })
    }
  }

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.registration_number.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="bg-brand-card rounded-[10px] p-8 border border-brand-border shadow-sm space-y-8 animate-fade-in-up relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
        <Building2 size={200} />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <h2 className="text-xl font-black text-brand-heading mb-1 uppercase tracking-tight">Entity Oversight</h2>
          <p className="text-xs text-brand-body font-bold uppercase tracking-widest opacity-60">Multi-Tenant Organization Management & Node Provisioning</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setSelectedCompany(null)
              setForm({ name: '', registration_number: '', email: '', phone: '', address: '', status: 'active' })
              setIsModalOpen(true)
            }}
            className="bg-brand-blue text-white px-5 py-2.5 rounded-[10px] font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-2 shadow-lg shadow-brand-blue/20 hover:bg-brand-hover transition-all border border-brand-hover active:scale-95"
          >
            <Plus size={16} />
            Register Company
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-body opacity-40 group-focus-within:text-brand-blue transition-colors" size={18} />
        <input 
          type="text"
          placeholder="SEARCH ORGANIZATIONS OR REGISTRATION IDs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-black/5 border border-brand-border rounded-[12px] py-3.5 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue/50 transition-all placeholder:opacity-30"
        />
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <div key={company.id} className="bg-brand-surface border border-brand-border rounded-[24px] overflow-hidden hover:border-brand-blue/30 transition-all group flex flex-col">
            <div className="p-6 space-y-4 flex-1">
              <div className="flex items-start justify-between">
                <div className="h-12 w-12 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue border border-brand-blue/20 group-hover:scale-110 transition-transform">
                  <Building2 size={24} />
                </div>
                <Badge variant={company.status === 'active' ? 'success' : 'warning'}>
                  {company.status}
                </Badge>
              </div>
              
              <div>
                <h3 className="text-lg font-black text-brand-heading uppercase tracking-tight line-clamp-1">{company.name}</h3>
                <p className="text-[10px] text-brand-body font-bold uppercase tracking-widest opacity-60">ID: {company.registration_number}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-black/5 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-[8px] font-black text-brand-body uppercase tracking-wider mb-1">
                    <UsersIcon size={10} /> Users
                  </div>
                  <p className="text-sm font-black text-brand-heading">{company.user_count || 0}</p>
                </div>
                <div className="bg-black/5 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-[8px] font-black text-brand-body uppercase tracking-wider mb-1">
                    <Activity size={10} /> Nodes
                  </div>
                  <p className="text-sm font-black text-brand-heading">{company.node_count || 0}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-black/5 border-t border-brand-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setSelectedCompany(company)
                    setForm({ ...company })
                    setIsModalOpen(true)
                  }}
                  className="p-2 text-brand-body hover:text-brand-blue rounded-lg hover:bg-white/50 transition-all"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(company.id)}
                  className="p-2 text-brand-body hover:text-brand-red rounded-lg hover:bg-white/50 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <button 
                onClick={() => {
                  addToast({ title: 'Accessing Portal', message: `Initializing encrypted session for ${company.name}...`, type: 'info' })
                  // Logic to "enter" company portal would go here
                  // e.g., update store with activeCompanyId and navigate
                }}
                className="flex items-center gap-2 px-4 py-2 bg-brand-blue/10 text-brand-blue text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-brand-blue hover:text-white transition-all group/btn"
              >
                Enter Portal
                <ExternalLink size={12} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {loading && filteredCompanies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <RefreshCw className="animate-spin text-brand-blue mb-4" size={32} />
          <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-body">Syncing Organization Data...</p>
        </div>
      )}

      {!loading && filteredCompanies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="h-20 w-20 bg-black/5 rounded-full flex items-center justify-center text-brand-body/20">
            <Database size={40} />
          </div>
          <div>
            <h3 className="text-lg font-black text-brand-heading uppercase">No Organizations Found</h3>
            <p className="text-xs text-brand-body font-bold uppercase tracking-widest max-w-xs mx-auto">Initialize the system by registering your first administrative entity.</p>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[999] flex justify-end">
          <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-xl bg-brand-card shadow-2xl border-l border-brand-border overflow-hidden animate-slide-in-right flex flex-col h-full">
            <div className="p-8 border-b border-brand-border bg-black/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue border border-brand-blue/20">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-brand-heading uppercase tracking-tight">{selectedCompany ? 'Configure Entity' : 'Register Entity'}</h3>
                  <p className="text-[10px] text-brand-body font-bold uppercase tracking-widest">Provision Multi-Tenant Node Access</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-black/5 text-brand-body transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-brand-body uppercase tracking-widest ml-1">Company Name</label>
                  <input 
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-black/5 border border-brand-border rounded-xl p-4 text-sm font-bold text-brand-heading focus:outline-none focus:border-brand-blue transition-all"
                    placeholder="e.g. TRC HQ"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-brand-body uppercase tracking-widest ml-1">Registration ID</label>
                  <input 
                    type="text"
                    required
                    value={form.registration_number}
                    onChange={(e) => setForm({ ...form, registration_number: e.target.value })}
                    className="w-full bg-black/5 border border-brand-border rounded-xl p-4 text-sm font-bold text-brand-heading focus:outline-none focus:border-brand-blue transition-all"
                    placeholder="e.g. TRC-2024-X"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-brand-body uppercase tracking-widest ml-1">Contact Email</label>
                  <input 
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-black/5 border border-brand-border rounded-xl p-4 text-sm font-bold text-brand-heading focus:outline-none focus:border-brand-blue transition-all"
                    placeholder="admin@company.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-brand-body uppercase tracking-widest ml-1">Status</label>
                  <select 
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-black/5 border border-brand-border rounded-xl p-4 text-sm font-bold text-brand-heading focus:outline-none focus:border-brand-blue transition-all"
                  >
                    <option value="active">ACTIVE</option>
                    <option value="pending">PENDING</option>
                    <option value="suspended">SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-brand-body uppercase tracking-widest ml-1">Physical Address</label>
                <textarea 
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-black/5 border border-brand-border rounded-xl p-4 text-sm font-bold text-brand-heading focus:outline-none focus:border-brand-blue transition-all h-24 resize-none"
                  placeholder="Street, City, Country"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-black/5 text-brand-body text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black/10 transition-all border border-brand-border"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-4 bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-hover transition-all shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                  {selectedCompany ? 'Update Config' : 'Register Entity'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default CompanyManagement
