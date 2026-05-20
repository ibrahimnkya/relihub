import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { 
  X, 
  Plus, 
  Building2, 
  User, 
  Shield, 
  CheckCircle2, 
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'
import { companyService } from '../../services/companyService'
import { userService } from '../../services/userService'
import { useToast } from '../../store/toastStore'
import { useAuthStore } from '../../store/authStore'

const MODULES = [
  { id: 'locomotive', label: 'Locomotive Intelligence', description: 'Real-time tracking and telemetry for locomotive assets.' },
  { id: 'tanks', label: 'Tank Management', description: 'Monitoring fuel levels, capacity, and replenishment for stationary tanks.' },
  { id: 'meters', label: 'Flow Meters', description: 'High-precision throughput tracking for fuel dispensing points.' },
  { id: 'fueling', label: 'Fueling Operations', description: 'Manage fueling sessions, authorized personnel, and digital receipts.' },
  { id: 'recon', label: 'Reconciliation', description: 'Automated fuel variance analysis and shift-end reports.' },
  { id: 'ai', label: 'Reli-IQ Predictive', description: 'Predictive maintenance and consumption forecasting via AI.' },
  { id: 'incidents', label: 'Incident Desk', description: 'Centralized alert management and escalation workflows.' }
]

const ProvisioningModal = ({ isOpen, onClose, companyId = null, onSaveSuccess }) => {
  const { addToast } = useToast()
  const { user, updateUser } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    registration_number: '',
    email: '',
    contact_person: '',
    admin_name: '',
    admin_email: '',
    admin_phone: '',
    password: '',
    modules: []
  })

  useEffect(() => {
    if (isOpen && companyId) {
      fetchCompanyData()
    } else if (isOpen) {
      // Reset for new company
      setFormData({
        name: '',
        registration_number: `RH-${Math.floor(10000 + Math.random() * 90000)}`,
        email: '',
        contact_person: '',
        admin_name: '',
        admin_email: '',
        admin_phone: '',
        password: '',
        modules: []
      })
      setCurrentStep(1)
    }
  }, [isOpen, companyId])

  const fetchCompanyData = async () => {
    setLoading(true)
    try {
      const res = await companyService.getCompanies()
      const companies = res.data?.returnData?.list_of_item || res.data || []
      const company = companies.find(c => c.id === companyId)
      
      if (company) {
        // Try to find the admin user for this company
        let adminData = { admin_name: '', admin_email: '', admin_phone: '' }
        try {
          const uRes = await userService.getUsers()
          const users = uRes.data?.returnData?.list_of_item || []
          const admin = users.find(u => u.company_id === companyId && u.roles?.some(r => r.slug === 'company_admin' || r.name === 'Company Admin'))
          if (admin) {
            adminData = {
              admin_name: admin.name,
              admin_email: admin.email,
              admin_phone: admin.phone || ''
            }
          }
        } catch (e) {
          console.error('Failed to fetch admin data:', e)
        }

        let modules = []
        if (company.modules) {
          modules = Array.isArray(company.modules) ? company.modules : JSON.parse(company.modules)
        }

        setFormData({
          id: company.id,
          name: company.name,
          registration_number: company.registration_number,
          email: company.email,
          contact_person: company.contact_person || '',
          ...adminData,
          password: '', // Don't pre-fill password for security
          modules
        })
      }
    } catch (error) {
      addToast({ title: 'Error', message: 'Failed to load organization data.', type: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (companyId) {
        // Update existing
        await companyService.updateCompany(companyId, {
          name: formData.name,
          registration_number: formData.registration_number,
          email: formData.email,
          contact_person: formData.contact_person,
          modules: formData.modules
        })
        
        // If admin fields are provided, we'd typically update the admin user here
        // For now, focusing on the company record per user request
        
        // Sync local auth store if this is the user's company
        if (companyId === user?.company_id) {
          updateUser({ 
            company_modules: formData.modules,
            company: { ...user.company, modules: formData.modules }
          })
        }
        
        addToast({ title: 'Success', message: 'Company details updated successfully.', type: 'success' })
      } else {
        // Atomic Provisioning (Company + Admin)
        await companyService.provisionOrganization(formData)
        addToast({ title: 'Success', message: 'Company and Admin added successfully.', type: 'success' })
      }
      
      if (onSaveSuccess) onSaveSuccess()
      onClose()
    } catch (error) {
      addToast({ title: 'Error', message: 'Failed to save company information.', type: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex justify-end">
      <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-md animate-fade-in" onClick={onClose}></div>
      <div className="relative w-full max-w-xl h-full bg-brand-card shadow-2xl border-l border-brand-border flex flex-col animate-slide-in-right overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-brand-border bg-black/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-brand-blue/10 rounded-[12px] flex items-center justify-center text-brand-blue border border-brand-blue/20">
              {companyId ? <Building2 size={20} /> : <Plus size={20} />}
            </div>
            <div>
              <h3 className="text-lg font-black text-brand-heading uppercase tracking-tight">
                {companyId ? 'Edit Company' : 'Company Setup'}
              </h3>
              <p className="text-[10px] text-brand-body font-bold uppercase tracking-widest">
                Step {currentStep} of 4 — {
                  currentStep === 1 ? 'Information' :
                  currentStep === 2 ? 'Admin User' :
                  currentStep === 3 ? 'Features' : 'Review & Save'
                }
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors text-brand-body"><X size={20} /></button>
        </div>

        {/* Stepper Progress */}
        <div className="flex px-8 py-4 gap-2 bg-black/5">
          {[1, 2, 3, 4].map(step => (
            <div key={step} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step <= currentStep ? 'bg-brand-blue' : 'bg-brand-border'}`}></div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40 gap-4">
              <RefreshCw size={40} className="animate-spin text-brand-blue" />
              <p className="text-xs font-black uppercase tracking-widest">Loading system data...</p>
            </div>
          ) : (
            <>
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-brand-body uppercase tracking-widest ml-1">Company Name *</label>
                      <input 
                        type="text" 
                        className="w-full bg-brand-surface border border-brand-border rounded-[12px] py-4 px-5 text-sm font-bold text-brand-heading focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                        placeholder="e.g. TRC Main Hub"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5 opacity-60">
                      <label className="text-[10px] font-black text-brand-body uppercase tracking-widest ml-1">Company ID (Auto-Generated)</label>
                      <input 
                        type="text" 
                        readOnly
                        className="w-full bg-black/5 border border-brand-border rounded-[12px] py-4 px-5 text-sm font-bold text-brand-heading"
                        value={formData.registration_number}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-brand-body uppercase tracking-widest ml-1">Contact Person</label>
                      <input 
                        type="text" 
                        className="w-full bg-brand-surface border border-brand-border rounded-[12px] py-4 px-5 text-sm font-bold text-brand-heading focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                        placeholder="e.g. John Doe"
                        value={formData.contact_person}
                        onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-brand-body uppercase tracking-widest ml-1">Company Email *</label>
                      <input 
                        type="email" 
                        className="w-full bg-brand-surface border border-brand-border rounded-[12px] py-4 px-5 text-sm font-bold text-brand-heading focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                        placeholder="contact@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-brand-blue/5 p-4 rounded-[12px] border border-brand-blue/10 mb-6">
                    <p className="text-[10px] font-bold text-brand-blue leading-relaxed uppercase tracking-wider">
                      This user will have administrative permissions to manage this company's platform.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-brand-body uppercase tracking-widest ml-1">Admin Full Name</label>
                      <input 
                        type="text" 
                        className="w-full bg-brand-surface border border-brand-border rounded-[12px] py-4 px-5 text-sm font-bold text-brand-heading focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                        placeholder="e.g. Jane Smith"
                        value={formData.admin_name}
                        onChange={(e) => setFormData({...formData, admin_name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-brand-body uppercase tracking-widest ml-1">Admin Email *</label>
                      <input 
                        type="email" 
                        className="w-full bg-brand-surface border border-brand-border rounded-[12px] py-4 px-5 text-sm font-bold text-brand-heading focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                        placeholder="admin@company.com"
                        value={formData.admin_email}
                        onChange={(e) => setFormData({...formData, admin_email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-brand-body uppercase tracking-widest ml-1">Admin Phone</label>
                      <input 
                        type="text" 
                        className="w-full bg-brand-surface border border-brand-border rounded-[12px] py-4 px-5 text-sm font-bold text-brand-heading focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                        placeholder="07XX XXX XXX"
                        value={formData.admin_phone}
                        onChange={(e) => setFormData({...formData, admin_phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-brand-body uppercase tracking-widest ml-1">
                        {companyId ? 'New Password (Leave blank to keep current)' : 'Password *'}
                      </label>
                      <div className="relative group">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          className="w-full bg-brand-surface border border-brand-border rounded-[12px] py-4 pl-5 pr-12 text-sm font-bold text-brand-heading focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-body hover:text-brand-blue transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 gap-3">
                    {MODULES.map(module => (
                      <button
                        key={module.id}
                        onClick={() => {
                          const exists = formData.modules.includes(module.id)
                          setFormData({
                            ...formData,
                            modules: exists 
                              ? formData.modules.filter(id => id !== module.id)
                              : [...formData.modules, module.id]
                          })
                        }}
                        className={`p-5 rounded-[12px] border text-left transition-all group ${
                          formData.modules.includes(module.id)
                            ? 'bg-brand-blue/10 border-brand-blue/40 shadow-lg shadow-brand-blue/5'
                            : 'bg-brand-surface border-brand-border hover:border-brand-blue/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`text-xs font-black uppercase tracking-widest ${formData.modules.includes(module.id) ? 'text-brand-blue' : 'text-brand-heading'}`}>
                            {module.label}
                          </h4>
                          {formData.modules.includes(module.id) && <CheckCircle2 size={16} className="text-brand-blue" />}
                        </div>
                        <p className="text-[10px] font-bold text-brand-body leading-relaxed">{module.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-brand-surface rounded-[12px] border border-brand-border p-6 space-y-4">
                    <h4 className="text-[10px] font-black text-brand-body uppercase tracking-[0.2em] opacity-40">Company Information</h4>
                    <div className="space-y-2">
                      {[
                        ['Name', formData.name],
                        ['ID', formData.registration_number],
                        ['Email', formData.email],
                        ['Contact', formData.contact_person],
                      ].map(([k,v]) => (
                        <div key={k} className="flex justify-between text-[11px]">
                          <span className="text-brand-body font-bold uppercase">{k}</span>
                          <span className="text-brand-heading font-black">{v || '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-brand-surface rounded-[12px] border border-brand-border p-6 space-y-4">
                    <h4 className="text-[10px] font-black text-brand-body uppercase tracking-[0.2em] opacity-40">Admin User</h4>
                    <div className="space-y-2">
                      {[
                        ['Admin Name', formData.admin_name],
                        ['Admin Email', formData.admin_email],
                      ].map(([k,v]) => (
                        <div key={k} className="flex justify-between text-[11px]">
                          <span className="text-brand-body font-bold uppercase">{k}</span>
                          <span className="text-brand-heading font-black">{v || '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-brand-surface rounded-[12px] border border-brand-border p-6 space-y-4">
                    <h4 className="text-[10px] font-black text-brand-body uppercase tracking-[0.2em] opacity-40">Enabled Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.modules.length === 0 ? (
                        <p className="text-[11px] text-brand-body italic">No features selected</p>
                      ) : (
                        formData.modules.map(id => {
                          const m = MODULES.find(x => x.id === id);
                          return m ? (
                            <span key={id} className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-lg text-[9px] font-black uppercase tracking-widest">
                              {m.label}
                            </span>
                          ) : null;
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-black/5 border-t border-brand-border flex gap-3">
          {currentStep > 1 && (
            <button 
              onClick={() => setCurrentStep(s => s - 1)}
              className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-brand-body hover:text-brand-heading transition-colors border border-brand-border rounded-[12px] bg-brand-surface"
            >
              Back
            </button>
          )}
          {currentStep === 1 && (
            <button 
              onClick={onClose}
              className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-brand-body hover:text-brand-heading transition-colors border border-brand-border rounded-[12px] bg-brand-surface"
            >
              Cancel
            </button>
          )}
          {currentStep < 4 ? (
            <button 
              onClick={() => {
                if (currentStep === 1 && (!formData.name || !formData.email)) {
                  return addToast({ title: 'Required', message: 'Name and Email are mandatory.', type: 'warning' })
                }
                if (currentStep === 2 && !formData.admin_email && !companyId) {
                  return addToast({ title: 'Required', message: 'Admin email is mandatory for new companies.', type: 'warning' })
                }
                setCurrentStep(s => s + 1)
              }}
              className="flex-[2] bg-brand-blue text-white py-4 rounded-[12px] font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:bg-brand-hover transition-all"
            >
              {currentStep === 1 ? 'Next: Admin User' : currentStep === 2 ? 'Next: Features' : 'Review & Confirm'}
            </button>
          ) : (
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="flex-[2] bg-brand-blue text-white py-4 rounded-[12px] font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:bg-brand-hover transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : null}
              {saving ? (companyId ? 'Saving Changes...' : 'Creating...') : (companyId ? 'Save Changes' : 'Create Company')}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ProvisioningModal
