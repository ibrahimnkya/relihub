import React, { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Plus, 
  Save, 
  Trash2, 
  Edit2, 
  Users, 
  X,
  Globe,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Search,
  LayoutGrid,
  List,
  MoreVertical,
  ChevronRight,
  ExternalLink,
  Settings,
  Database,
  RefreshCw,
  Layout
} from 'lucide-react'
import { createPortal } from 'react-dom'
import ProvisioningModal from '../../../components/shared/ProvisioningModal'
import { companyService } from '../../../services/companyService'
import { useToast } from '../../../store/toastStore'
import Badge from '../../../components/ui/Badge'
import StatCard from '../../../components/ui/StatCard'

const CompanyPortal = ({ company, onBack }) => {
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Divisions')
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [formData, setFormData] = useState({ name: '', location: '' })
  const [isCompanyEditModalOpen, setIsCompanyEditModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState('list')
  const { addToast } = useToast()

  useEffect(() => {
    fetchBranches()
  }, [company.id])

  const parseModules = (modules) => {
    if (!modules) return []
    if (Array.isArray(modules)) return modules
    try {
      return JSON.parse(modules)
    } catch (e) {
      return typeof modules === 'string' ? modules.split(',').map(m => m.trim()) : []
    }
  }

  const fetchBranches = async () => {
    setLoading(true)
    try {
      const res = await companyService.getBranches(company.id)
      setBranches(res.data || [])
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to load branches', type: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBranch = async () => {
    if (!formData.name) return addToast({ title: 'Validation', message: 'Branch name required', type: 'warning' })
    
    try {
      if (editingBranch) {
        await companyService.updateBranch(editingBranch.id, formData)
        addToast({ title: 'Success', message: 'Branch updated', type: 'success' })
      } else {
        await companyService.createBranch(company.id, formData)
        addToast({ title: 'Success', message: 'Branch created', type: 'success' })
      }
      setIsBranchModalOpen(false)
      setEditingBranch(null)
      setFormData({ name: '', location: '' })
      fetchBranches()
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to save branch', type: 'danger' })
    }
  }

  const handleDeleteBranch = async (id) => {
    if (!confirm('Are you sure you want to delete this branch?')) return
    try {
      await companyService.deleteBranch(id)
      addToast({ title: 'Success', message: 'Branch deleted', type: 'success' })
      fetchBranches()
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to delete branch', type: 'danger' })
    }
  }

  const openEditModal = (branch) => {
    setEditingBranch(branch)
    setFormData({ name: branch.name, location: branch.location || '' })
    setIsBranchModalOpen(true)
  }

  const activeModules = parseModules(company.modules)

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-brand-surface flex flex-col animate-fade-in overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12">
        <div className="max-w-[1600px] mx-auto space-y-8 relative">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
            <Building2 size={300} />
          </div>

          {/* Compact Navigation Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <button 
                onClick={onBack}
                className="h-12 w-12 bg-brand-card rounded-[15px] flex items-center justify-center text-brand-body hover:text-brand-blue hover:bg-brand-blue/5 transition-all border border-brand-border shadow-sm group active:scale-95"
              >
                <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-3xl font-black text-brand-heading uppercase tracking-tighter leading-none mb-1.5 italic">{company.name}<span className="text-brand-blue"> Portal</span></h1>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">{company.registration_number || 'TRC-ORG-001'}</span>
                  <div className="h-1 w-1 rounded-full bg-brand-body/20"></div>
                  <span className="text-[10px] font-black text-brand-body/40 uppercase tracking-[0.2em]">Organization Management Portal</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-brand-green/10 rounded-full border border-brand-green/20">
                <div className="h-2 w-2 rounded-full bg-brand-green animate-pulse"></div>
                <span className="text-[10px] font-black text-brand-green uppercase tracking-widest">Active Status</span>
              </div>
              <button 
                onClick={() => setIsCompanyEditModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-brand-card text-brand-heading rounded-[15px] text-[10px] font-black uppercase tracking-widest hover:bg-black/5 transition-all border border-brand-border shadow-sm active:scale-95"
              >
                <Settings size={18} /> Edit Profile
              </button>
            </div>
          </div>

          {/* Internal Tabs */}
          <div className="flex gap-1 bg-black/5 p-1 rounded-[18px] border border-brand-border w-fit relative z-10 overflow-x-auto backdrop-blur-sm">
            {['Divisions', 'Staff', 'Modules', 'Health'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-3 px-10 py-3.5 rounded-[15px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab 
                    ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20' 
                    : 'text-brand-body hover:bg-white/50'
                }`}
              >
                {tab === 'Divisions' && <MapPin size={16} />}
                {tab === 'Staff' && <Users size={16} />}
                {tab === 'Modules' && <Layers size={16} />}
                {tab === 'Health' && <Activity size={16} />}
                {tab}
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="relative z-10">
            {activeTab === 'Divisions' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-brand-blue/10 rounded-[15px] flex items-center justify-center text-brand-blue font-black border border-brand-blue/20 shadow-inner">
                      {branches.length}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-brand-heading uppercase tracking-tight">Active Divisions</h3>
                      <p className="text-[10px] text-brand-body font-bold uppercase tracking-widest opacity-60">Organizational Structure</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingBranch(null)
                      setFormData({ name: '', location: '' })
                      setIsBranchModalOpen(true)
                    }}
                    className="flex items-center gap-3 px-8 py-4 bg-brand-blue text-white rounded-[18px] text-[10px] font-black uppercase tracking-widest hover:bg-brand-hover transition-all shadow-2xl shadow-brand-blue/20 border border-brand-hover active:scale-95"
                  >
                    <Plus size={18} /> Add Division
                  </button>
                </div>

                <div className="border border-brand-border rounded-[24px] overflow-hidden bg-brand-card/30 backdrop-blur-xl shadow-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/5">
                        <th className="px-8 py-5 text-[10px] font-black text-brand-body uppercase tracking-[0.2em] border-b border-brand-border">Division Details</th>
                        <th className="px-8 py-5 text-[10px] font-black text-brand-body uppercase tracking-[0.2em] border-b border-brand-border">Location</th>
                        <th className="px-8 py-5 text-[10px] font-black text-brand-body uppercase tracking-[0.2em] border-b border-brand-border text-center">Resources</th>
                        <th className="px-8 py-5 text-[10px] font-black text-brand-body uppercase tracking-[0.2em] border-b border-brand-border">Status</th>
                        <th className="px-8 py-5 text-right border-b border-brand-border"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/50">
                      {loading ? (
                        [1,2,3].map(i => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan="5" className="px-8 py-10"><div className="h-4 bg-black/5 rounded w-full"></div></td>
                          </tr>
                        ))
                      ) : branches.length > 0 ? (
                        branches.map(branch => (
                          <tr key={branch.id} className="hover:bg-brand-blue/[0.02] transition-all group">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-brand-surface text-brand-blue rounded-[12px] flex items-center justify-center font-black border border-brand-border shadow-sm group-hover:bg-brand-blue group-hover:text-white transition-all duration-500">
                                  <Building2 size={20} />
                                </div>
                                <span className="text-sm font-black text-brand-heading uppercase tracking-tight group-hover:text-brand-blue transition-colors">{branch.name}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-brand-blue opacity-50" />
                                <span className="text-[11px] font-black text-brand-body uppercase tracking-widest">{branch.location || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <Users size={14} className="text-brand-blue opacity-40" />
                                <span className="text-sm font-black text-brand-heading">0</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <Badge label="ACTIVE" variant="success" />
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-300">
                                <button onClick={() => openEditModal(branch)} className="h-10 w-10 flex items-center justify-center text-brand-body hover:text-brand-blue hover:bg-brand-blue/5 rounded-xl transition-all border border-transparent hover:border-brand-blue/20" title="Edit Division"><Edit2 size={16} /></button>
                                <button onClick={() => handleDeleteBranch(branch.id)} className="h-10 w-10 flex items-center justify-center text-brand-body hover:text-brand-red hover:bg-brand-red/5 rounded-xl transition-all border border-transparent hover:border-brand-red/20" title="Delete Division"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-8 py-32 text-center opacity-10">
                            <Layers size={64} className="mx-auto mb-6" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Divisions Found</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'Staff' && (
              <div className="py-32 text-center bg-brand-card/30 rounded-[24px] border-2 border-dashed border-brand-border opacity-30 animate-in fade-in duration-500">
                <Users size={64} className="mx-auto mb-6 text-brand-body" />
                <h3 className="text-xl font-black uppercase tracking-widest text-brand-heading mb-2">Personnel Registry</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Staff and management directory.</p>
              </div>
            )}

            {activeTab === 'Modules' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                {activeModules.map(mod => (
                  <div key={mod} className="bg-brand-card/50 backdrop-blur-md p-10 rounded-[24px] border border-brand-border hover:border-brand-blue/30 transition-all group flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 bg-brand-blue/5 rounded-[18px] flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all shadow-inner">
                        <Layers size={28} />
                      </div>
                      <div>
                        <h4 className="text-[13px] font-black text-brand-heading uppercase tracking-tight group-hover:text-brand-blue transition-colors">{mod}</h4>
                        <p className="text-[9px] font-black text-brand-body uppercase tracking-widest opacity-40">Enabled Feature</p>
                      </div>
                    </div>
                    <div className="h-3 w-3 rounded-full bg-brand-blue shadow-[0_0_12px_#3B82F6] animate-pulse"></div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'Health' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
                {[
                  { label: 'Integrity Score', value: '98%', icon: Activity, color: 'text-brand-green' },
                  { label: 'Uptime', value: '99.9%', icon: RefreshCw, color: 'text-brand-blue' },
                  { label: 'Security Level', value: 'Tier 4', icon: ShieldCheck, color: 'text-brand-blue' },
                  { label: 'Data Latency', value: '< 12ms', icon: Zap, color: 'text-brand-amber' },
                ].map((stat, i) => (
                  <div key={i} className="bg-brand-card/50 backdrop-blur-md p-10 rounded-[24px] border border-brand-border hover:border-brand-blue/30 transition-all shadow-sm">
                    <div className={`h-14 w-14 rounded-[18px] bg-black/5 ${stat.color} flex items-center justify-center mb-8 shadow-inner`}>
                      <stat.icon size={28} />
                    </div>
                    <p className="text-[10px] font-black text-brand-body uppercase tracking-[0.2em] opacity-40 mb-2">{stat.label}</p>
                    <h4 className="text-3xl font-black text-brand-heading tracking-tighter uppercase italic">{stat.value}</h4>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Branch Management Modal - Refined to Side Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-[10000] flex justify-end">
          <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-md animate-fade-in" onClick={() => setIsBranchModalOpen(false)}></div>
          <div className="relative w-full max-w-md h-full bg-brand-card shadow-2xl border-l border-brand-border flex flex-col animate-slide-in-right overflow-hidden">
            
            <div className="p-8 border-b border-brand-border flex items-center justify-between bg-black/5">
              <div>
                <h3 className="text-xl font-black text-brand-heading uppercase tracking-tight">
                  {editingBranch ? 'Edit Division' : 'Add Division'}
                </h3>
                <p className="text-[10px] text-brand-body font-bold uppercase tracking-widest opacity-50 mt-1">Manage organizational divisions</p>
              </div>
              <button onClick={() => setIsBranchModalOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-brand-body">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 p-10 space-y-8 overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-brand-body uppercase tracking-[0.2em] ml-1">Division Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. SOUTH PORT HUB"
                  className="w-full bg-brand-surface border border-brand-border rounded-[18px] p-5 text-sm font-black uppercase text-brand-heading focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all shadow-inner"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-brand-body uppercase tracking-[0.2em] ml-1">Location</label>
                <input 
                  type="text" 
                  placeholder="e.g. DAR ES SALAAM, TZ"
                  className="w-full bg-brand-surface border border-brand-border rounded-[18px] p-5 text-sm font-black uppercase text-brand-heading focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all shadow-inner"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>

              <div className="bg-brand-blue/5 p-6 rounded-[18px] border border-brand-blue/10">
                <p className="text-[10px] font-bold text-brand-blue leading-relaxed uppercase tracking-widest">
                  Divisions represent distinct operational units. Ensure location details are kept up to date for reporting.
                </p>
              </div>
            </div>

            <div className="p-8 border-t border-brand-border bg-black/5 grid grid-cols-2 gap-4">
              <button onClick={() => setIsBranchModalOpen(false)} className="py-4 text-[11px] font-black uppercase tracking-widest text-brand-body hover:bg-black/5 rounded-[18px] transition-all border border-brand-border bg-brand-surface">Cancel</button>
              <button onClick={handleSaveBranch} className="bg-brand-blue text-white py-4 rounded-[18px] font-black text-[11px] uppercase tracking-widest shadow-xl shadow-brand-blue/20 hover:bg-brand-hover transition-all active:scale-95">
                {editingBranch ? 'Save Changes' : 'Add Division'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ProvisioningModal 
        isOpen={isCompanyEditModalOpen}
        onClose={() => setIsCompanyEditModalOpen(false)}
        companyId={company.id}
        onSaveSuccess={() => window.location.reload()}
      />
    </div>,
    document.body
  )
}

export default CompanyPortal
