import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { 
  Scale, 
  Download, 
  Calendar, 
  ChevronDown, 
  AlertTriangle, 
  ArrowRight,
  RefreshCcw,
  CheckCircle2,
  Zap,
  TrendingDown,
  TrendingUp,
  History,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Package,
  X,
  Play,
  Check,
  Loader2
} from 'lucide-react'
import Badge from '../../components/ui/Badge'
import TableBase from '../../components/ui/TableBase'
import StatCard from '../../components/ui/StatCard'
import { RECONCILIATION_SUMMARY } from '../../mock/reconciliation.mock'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../store/toastStore'
import { checkHasModule } from '../../utils/modules'
import AccessRestricted from '../../components/shared/AccessRestricted'
import BalanceFlow from '../../components/ui/BalanceFlow'

const ReconciliationPage = () => {
  const { user } = useAuthStore()
  const { addToast } = useToast()
  const hasAccess = checkHasModule(user, 'recon')

  const [isEngineOpen, setIsEngineOpen] = useState(false)
  const [engineStep, setEngineStep] = useState('config') // 'config' | 'processing' | 'results'
  const [selectedRuleSet, setSelectedRuleSet] = useState('standard')
  const [completedSteps, setCompletedSteps] = useState([])
  const [isPeriodClosed, setIsPeriodClosed] = useState(false)

  if (!hasAccess) {
    return <AccessRestricted moduleName="Reconciliation & Auditing" moduleCode="RECON_MGMT" />
  }

  const s = RECONCILIATION_SUMMARY

  const startEngineScan = () => {
    setEngineStep('processing')
    setCompletedSteps([])
    
    const steps = [
      'Scanning flow meter telemetry logs...',
      'Comparing physical dip level changes...',
      'Matching geofenced depot boundaries...',
      'Validating attendant login logs...',
      'Reconciling final mass-balance equations...'
    ]

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setCompletedSteps(prev => [...prev, step])
        if (idx === steps.length - 1) {
          setTimeout(() => {
            setEngineStep('results')
          }, 800)
        }
      }, (idx + 1) * 800)
    })
  }

  return (
    <div className="space-y-6 animate-fade-in relative h-[calc(100vh-140px)] flex flex-col overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 flex-shrink-0 bg-white p-6 rounded-[15px] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 bg-brand-blue/10 text-brand-blue rounded-[10px] flex items-center justify-center border border-brand-blue/20">
            <Scale size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-brand-navy tracking-tight uppercase">Reconciliation Engine</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">Daily inventory balancing and asset consistency auditing</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
          <button className="flex items-center gap-2 bg-brand-card border border-brand-border rounded-[10px] px-4 py-2.5 text-xs font-black text-brand-heading hover:bg-black/5 transition-all uppercase tracking-widest shadow-sm">
            <Calendar size={14} className="text-brand-blue" />
            Today
            <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2.5 rounded-[10px] font-black text-xs hover:bg-brand-hover transition-all shadow-lg active:scale-95 uppercase tracking-widest border border-brand-hover">
            <Download size={16} />
            Export Audit
          </button>
        </div>
      </div>

      {/* Ledger Handsake HUD */}
      <div className="flex-shrink-0 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
           <BalanceFlow 
             opening={s.openingStock} 
             inflows={s.confirmedInflows} 
             outflows={s.meteredOutflows} 
             variance={s.variance} 
           />
        </div>
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
           <StatCard 
            label="Inflows today" 
            value={s.confirmedInflows.toLocaleString()} 
            icon={ArrowUpRight} 
            variant="success" 
            compact 
            unit="LITRES"
          />
          <StatCard 
            label="Outflows today" 
            value={s.meteredOutflows.toLocaleString()} 
            icon={ArrowDownRight} 
            variant="danger" 
            compact 
            unit="LITRES"
          />
          <StatCard 
            label="Variance %" 
            value={s.variancePct} 
            icon={Activity} 
            variant={Math.abs(s.variancePct) < 0.2 ? 'success' : 'warning'} 
            compact 
            unit="PERCENT"
          />
          <StatCard 
            label="Actual Physical" 
            value={s.actualClosing.toLocaleString()} 
            icon={Package} 
            variant="info" 
            compact 
            unit="LITRES"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6 pt-2">
        {/* Left: Balance Terminal */}
        <div className="lg:col-span-4 flex flex-col overflow-hidden">
          <div className="flex-1 bg-brand-card rounded-[15px] shadow-lg border border-brand-border overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-brand-border bg-black/5 flex items-center justify-between">
              <h3 className="text-[10px] font-black text-brand-heading uppercase tracking-[0.2em] flex items-center gap-2">
                <Scale size={18} className="text-brand-blue" />
                Ledger Balancing
              </h3>
              <Badge 
                label={isPeriodClosed ? "PERIOD: CLOSED" : "PERIOD: OPEN"} 
                variant={isPeriodClosed ? "success" : "info"} 
              />
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="space-y-4">
                <div className="flex items-center justify-between group">
                  <p className="text-[10px] font-black text-brand-body uppercase tracking-widest">Initial Ledger Balance</p>
                  <p className="text-sm font-black text-brand-heading">{s.openingStock.toLocaleString()} L</p>
                </div>
                
                <div className="space-y-3 pt-4">
                  <div className="flex items-center justify-between p-3 bg-black/5 rounded-[10px] border border-brand-border">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-brand-green"></div>
                      <span className="text-[10px] font-black text-brand-body uppercase">Confirmed Inflows</span>
                    </div>
                    <span className="text-xs font-black text-brand-green">+{s.confirmedInflows.toLocaleString()} L</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-black/5 rounded-[10px] border border-brand-border">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-brand-red"></div>
                      <span className="text-[10px] font-black text-brand-body uppercase">Metered Outflows</span>
                    </div>
                    <span className="text-xs font-black text-brand-red">-{s.meteredOutflows.toLocaleString()} L</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-black/5 rounded-[10px] border border-brand-border">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-black/20"></div>
                      <span className="text-[10px] font-black text-brand-body uppercase">System Losses</span>
                    </div>
                    <span className="text-xs font-black text-brand-heading">-{ (s.approvedLosses + s.estimatedEvaporation).toLocaleString() } L</span>
                  </div>
                </div>

                <div className="pt-8 border-t border-brand-border grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-brand-body uppercase tracking-widest">Expected Close</p>
                    <p className="text-lg font-black text-brand-heading tabular-nums">{s.expectedClosing.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[8px] font-black text-brand-body uppercase tracking-widest">Actual Physical</p>
                    <p className="text-lg font-black text-brand-blue tabular-nums">{s.actualClosing.toLocaleString()}</p>
                  </div>
                </div>

                <div className={`p-5 rounded-[12px] border-2 flex items-center justify-between transition-all ${s.variancePct < 0 ? 'bg-red-500/10 border-red-500/20 text-brand-red' : 'bg-brand-green/10 border-brand-green/20 text-brand-green'}`}>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60">Net Variance Threshold</p>
                    <p className="text-2xl font-black tabular-nums">{s.variance} L</p>
                  </div>
                  <div className="text-right">
                     <div className="h-10 w-10 rounded-[10px] bg-brand-card flex items-center justify-center border border-brand-border shadow-sm">
                        {s.variancePct < 0.2 ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                     </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-black/5 border-t border-brand-border">
              <button 
                onClick={() => {
                  setEngineStep('config')
                  setIsEngineOpen(true)
                }}
                className="w-full bg-brand-card border border-brand-border hover:bg-black/5 text-brand-heading py-3 rounded-[10px] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group shadow-sm active:scale-95"
              >
                <RefreshCcw size={14} className="group-hover:rotate-180 transition-transform duration-500 text-brand-blue" />
                Synchronize Ledger
              </button>
            </div>
          </div>
        </div>

        {/* Right: Consistency Hub */}
        <div className="lg:col-span-8 flex flex-col overflow-hidden space-y-6">
          <div className="flex-1 bg-brand-card rounded-[15px] border border-brand-border shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-black/5">
              <h3 className="text-[10px] font-black text-brand-heading uppercase tracking-[0.2em] flex items-center gap-2">
                <Zap size={16} className="text-brand-blue" />
                Hardware Accuracy Audit
              </h3>
              <Badge label="CONSISTENT" variant="success" />
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar">
              <TableBase 
                headers={['Asset Identity', 'Meter Volume', 'Asset Gain', 'Source Drop', 'Variance', 'Integrity']}
              >
                {s.locomotiveConsistency.map((item, idx) => (
                  <tr key={idx} className="hover:bg-black/5 transition-colors group border-b border-brand-border last:border-0">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-brand-surface border border-brand-border rounded-[8px] flex items-center justify-center text-brand-body group-hover:bg-brand-blue group-hover:text-white transition-all">
                          <Activity size={14} />
                        </div>
                        <span className="text-xs font-black text-brand-heading uppercase">{item.train}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-black text-brand-heading">{item.metered} L</td>
                    <td className="px-6 py-4 text-xs font-bold text-brand-body">{item.gain} L</td>
                    <td className="px-6 py-4 text-xs font-bold text-brand-body">{item.drop} L</td>
                    <td className={`px-6 py-4`}>
                      <span className={`text-xs font-black px-2 py-1 rounded-full ${Math.abs(item.variance) > 5 ? 'bg-brand-red/10 text-brand-red' : 'bg-brand-green/10 text-brand-green'}`}>
                        {item.variance} L
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        label={item.status === 'ok' ? 'LOCKED' : 'AUDIT REQ'} 
                        variant={item.status === 'ok' ? 'success' : 'warning'} 
                      />
                    </td>
                  </tr>
                ))}
              </TableBase>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
             <div 
                onClick={() => {
                  setEngineStep('results')
                  setIsEngineOpen(true)
                }}
                className="bg-brand-red/10 border border-brand-red/20 rounded-[15px] p-5 flex items-start gap-4 hover:bg-brand-red/20 transition-all cursor-pointer group"
             >
                <div className="h-10 w-10 rounded-[10px] bg-brand-card border border-brand-red/20 flex items-center justify-center text-brand-red shadow-sm group-hover:scale-110 transition-transform">
                   <AlertTriangle size={20} />
                </div>
                <div>
                   <h4 className="text-[10px] font-black text-brand-red uppercase tracking-widest mb-1">Unmatched Signals</h4>
                   <p className="text-[18px] font-black text-brand-heading leading-none mb-1">{s.unmatchedSessions.length}</p>
                   <p className="text-[9px] font-medium text-brand-body uppercase">Awaiting rule classification</p>
                </div>
             </div>
             
             <div 
                onClick={() => {
                  setEngineStep('results')
                  setIsEngineOpen(true)
                }}
                className="bg-brand-card rounded-[15px] p-5 border border-brand-border flex items-center justify-between hover:bg-black/5 transition-all cursor-pointer group shadow-lg"
             >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-[10px] bg-brand-surface flex items-center justify-center text-brand-blue border border-brand-border group-hover:rotate-12 transition-transform">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-brand-heading uppercase tracking-widest mb-0.5">Ready for Closure</h4>
                    <p className="text-[9px] font-bold text-brand-body uppercase tracking-tighter">Variance within 0.2% tolerance</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setEngineStep('results')
                    setIsEngineOpen(true)
                  }}
                  className="h-10 w-10 rounded-full bg-brand-blue text-white flex items-center justify-center hover:bg-brand-hover active:scale-95 transition-all shadow-md"
                >
                   <ArrowRight size={20} />
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Reconciliation Engine Modal */}
      {isEngineOpen && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300">
          {/* Backdrop Overlay */}
          <div 
            className="absolute inset-0 bg-slate-200/40 backdrop-blur-xl backdrop-saturate-150"
            onClick={() => {
              if (engineStep !== 'processing') setIsEngineOpen(false)
            }}
          ></div>

          {/* Modal Container */}
          <div className="w-full max-w-[550px] bg-white rounded-[12px] p-8 shadow-[0_25px_60px_rgba(15,23,42,0.12)] relative overflow-hidden border border-slate-200 z-10 animate-scale-in flex flex-col">
            {/* Crimson Brand Accent Top Line */}
            <div className="absolute top-0 left-0 right-0 h-[5px] bg-brand-blue shadow-[0_1px_5px_rgba(164,23,32,0.2)]"></div>

            {/* Modal Header */}
            <div className="flex items-start justify-between pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-brand-blue/10 text-brand-blue rounded-[10px] flex items-center justify-center border border-brand-blue/20">
                  <Zap size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-brand-navy uppercase tracking-tight">Reconciliation Engine</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Automated Mass-Balance & Rule Engine</p>
                </div>
              </div>
              {engineStep !== 'processing' && (
                <button 
                  onClick={() => setIsEngineOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-brand-navy"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="py-6 flex-1">
              {engineStep === 'config' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      Reconciliation Mode
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { id: 'standard', title: 'Standard Audit Profile', desc: '0.20% variance tolerance. Geofence & pulse match verification.', badge: 'Recommended' },
                        { id: 'strict', title: 'Strict Integrity Profile', desc: '0.05% variance tolerance. Exhaustive sensor signal correlation.', badge: 'High Precision' },
                        { id: 'express', title: 'Express Terminal Sync', desc: '0.50% variance tolerance. Skip secondary spatial mapping.', badge: 'Quick Check' }
                      ].map(profile => (
                        <button
                          key={profile.id}
                          onClick={() => setSelectedRuleSet(profile.id)}
                          className={`p-4 rounded-[12px] border text-left flex items-start gap-4 transition-all ${
                            selectedRuleSet === profile.id 
                              ? 'border-brand-blue bg-brand-blue/5 shadow-sm' 
                              : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                          }`}
                        >
                          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                            selectedRuleSet === profile.id ? 'border-brand-blue text-brand-blue' : 'border-slate-300'
                          }`}>
                            {selectedRuleSet === profile.id && <div className="h-2.5 w-2.5 bg-brand-blue rounded-full"></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-xs font-black uppercase ${selectedRuleSet === profile.id ? 'text-brand-blue' : 'text-brand-navy'}`}>{profile.title}</p>
                              <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                selectedRuleSet === profile.id 
                                  ? 'bg-brand-blue/10 text-brand-blue' 
                                  : 'bg-slate-200/60 text-slate-500'
                              }`}>
                                {profile.badge}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-tight">{profile.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      Auditing Range
                    </label>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-[12px] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-slate-400" />
                        <div>
                          <p className="text-[10px] font-black text-brand-navy uppercase tracking-wider">Current Balancing Period</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">Today (24 hours span)</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black bg-brand-blue/10 text-brand-blue px-2.5 py-1 rounded uppercase tracking-wider">Active</span>
                    </div>
                  </div>
                </div>
              )}

              {engineStep === 'processing' && (
                <div className="py-8 flex flex-col items-center justify-center space-y-8 animate-fade-in">
                  {/* Radar Scanner Animation */}
                  <div className="relative h-24 w-24 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-brand-blue/10 animate-ping opacity-60"></div>
                    <div className="absolute inset-2 rounded-full border-2 border-dashed border-brand-blue/20 animate-spin" style={{ animationDuration: '6s' }}></div>
                    <div className="h-14 w-14 bg-brand-blue/5 border border-brand-blue/20 rounded-full flex items-center justify-center shadow-lg relative z-10">
                      <Loader2 size={26} className="text-brand-blue animate-spin" />
                    </div>
                  </div>

                  <div className="text-center space-y-2 max-w-sm">
                    <h4 className="text-xs font-black text-brand-navy uppercase tracking-[0.2em] animate-pulse">Running Reconciliation...</h4>
                    <p className="text-[10px] text-slate-400 font-bold">
                      Applying algorithmic rulesets to telemetry endpoints and hardware ledger records.
                    </p>
                  </div>

                  {/* Progressive Scan Stepper */}
                  <div className="w-full max-w-sm bg-slate-50 border border-slate-100 rounded-[12px] p-4.5 space-y-3">
                    {[
                      'Scanning flow meter telemetry logs...',
                      'Comparing physical dip level changes...',
                      'Matching geofenced depot boundaries...',
                      'Validating attendant login logs...',
                      'Reconciling final mass-balance equations...'
                    ].map((step, idx) => {
                      const isDone = completedSteps.includes(step)
                      const isActive = !isDone && (completedSteps.length === idx)
                      return (
                        <div key={idx} className="flex items-center justify-between text-left">
                          <span className={`text-[9px] font-black uppercase tracking-wider transition-colors duration-300 ${
                            isDone ? 'text-brand-green' : isActive ? 'text-brand-blue animate-pulse' : 'text-slate-300'
                          }`}>
                            {step}
                          </span>
                          {isDone ? (
                            <CheckCircle2 size={13} className="text-brand-green shrink-0" />
                          ) : isActive ? (
                            <Loader2 size={13} className="text-brand-blue animate-spin shrink-0" />
                          ) : (
                            <div className="h-3 w-3 rounded-full border border-slate-200 shrink-0"></div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {engineStep === 'results' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Results Callout */}
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-[12px] flex items-start gap-4">
                    <div className="h-10 w-10 rounded-[10px] bg-white border border-emerald-100 flex items-center justify-center text-brand-green shadow-sm shrink-0">
                      <CheckCircle2 size={22} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-brand-green uppercase tracking-widest mb-1">Reconciliation Audit Succeeded</h4>
                      <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                        Net variance lies well within standard tolerance boundaries (±0.20%). The physical tank readings correlate with the metered logs.
                      </p>
                    </div>
                  </div>

                  {/* Dashboard Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-[12px] space-y-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Net Discrepancy</span>
                      <p className="text-2xl font-black text-brand-navy tabular-nums">{s.variance} L</p>
                      <p className="text-[9px] text-brand-green font-black uppercase mt-1">Variance: {s.variancePct}%</p>
                    </div>
                    
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-[12px] space-y-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Audited Assets</span>
                      <p className="text-2xl font-black text-brand-navy tabular-nums">3/3</p>
                      <p className="text-[9px] text-brand-blue font-black uppercase mt-1">Consistent & Verified</p>
                    </div>
                  </div>

                  {/* Summary Checkpoints */}
                  <div className="bg-slate-50/50 border border-slate-200 rounded-[12px] divide-y divide-slate-100">
                    <div className="p-3 flex items-center justify-between text-left">
                      <span className="text-[9px] font-black text-brand-navy uppercase tracking-wider">Flow Meter Output vs Tank Drop</span>
                      <span className="text-[8px] font-black bg-emerald-100 text-brand-green px-2 py-0.5 rounded">MATCHED</span>
                    </div>
                    <div className="p-3 flex items-center justify-between text-left">
                      <span className="text-[9px] font-black text-brand-navy uppercase tracking-wider">Locomotive Intake Gain vs Meter Outflow</span>
                      <span className="text-[8px] font-black bg-emerald-100 text-brand-green px-2 py-0.5 rounded">MATCHED</span>
                    </div>
                    <div className="p-3 flex items-center justify-between text-left">
                      <span className="text-[9px] font-black text-brand-navy uppercase tracking-wider">Depot Geofencing Verification</span>
                      <span className="text-[8px] font-black bg-emerald-100 text-brand-green px-2 py-0.5 rounded">PASSED</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-6 border-t border-slate-100 flex items-center gap-4 mt-auto">
              {engineStep === 'config' && (
                <>
                  <button 
                    onClick={() => setIsEngineOpen(false)}
                    className="flex-1 py-3.5 bg-slate-50 border border-slate-200 text-brand-navy rounded-[12px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all active:scale-95 text-center"
                  >
                    Cancel Setup
                  </button>
                  <button 
                    onClick={startEngineScan}
                    className="flex-1 py-3.5 bg-brand-blue hover:bg-brand-hover text-white rounded-[12px] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-brand-blue/20 active:scale-95 flex items-center justify-center gap-2 group border border-brand-hover"
                  >
                    <Play size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    Run Engine
                  </button>
                </>
              )}

              {engineStep === 'processing' && (
                <button 
                  disabled
                  className="w-full py-3.5 bg-slate-50 border border-slate-200 text-slate-400 rounded-[12px] font-black text-[10px] uppercase tracking-[0.2em] cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Loader2 size={14} className="animate-spin text-brand-blue" />
                  Engine Auditing...
                </button>
              )}

              {engineStep === 'results' && (
                <>
                  <button 
                    onClick={() => {
                      setEngineStep('config')
                    }}
                    className="flex-1 py-3.5 bg-slate-50 border border-slate-200 text-brand-navy rounded-[12px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all active:scale-95 text-center"
                  >
                    Re-Run Analysis
                  </button>
                  <button 
                    onClick={() => {
                      setIsPeriodClosed(true)
                      setIsEngineOpen(false)
                      addToast({
                        title: 'Ledger Closed',
                        message: `Balancing period has been approved under ${selectedRuleSet.toUpperCase()} ruleset.`,
                        type: 'success'
                      })
                    }}
                    className="flex-1 py-3.5 bg-brand-blue hover:bg-brand-hover text-white rounded-[12px] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-brand-blue/20 active:scale-95 flex items-center justify-center gap-2 group border border-brand-hover"
                  >
                    <Check size={14} />
                    Approve & Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default ReconciliationPage
