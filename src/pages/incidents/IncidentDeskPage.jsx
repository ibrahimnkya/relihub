import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { 
  AlertTriangle, 
  Search, 
  CheckCircle2, 
  MessageSquare,
  Activity,
  ShieldAlert,
  X,
  Zap,
  ChevronRight,
  FileText,
  Trash2,
  RefreshCw,
  Droplet,
  Clock,
  User,
  Mail,
  Phone,
  Shield,
  TrainFront
} from 'lucide-react'
import Badge from '../../components/ui/Badge'
import AlertRow from '../../components/ui/AlertRow'
import StatCard from '../../components/ui/StatCard'
import EscalationMatrixModal from '../../components/shared/EscalationMatrixModal'
import { useDeviceData, formatApiDate } from '../../hooks/useDeviceData'
import { useIncidents } from '../../hooks/useIncidents'
import { useAuthStore } from '../../store/authStore'
import { checkHasModule } from '../../utils/modules'
import AccessRestricted from '../../components/shared/AccessRestricted'
import AlertRadar from '../../components/ui/AlertRadar'

const IncidentDeskPage = () => {
  const { tanks, flowMeters, device, loading: deviceLoading } = useDeviceData()
  const { incidents: allIncidents, alerts: allAlerts, loading: incidentsLoading } = useIncidents()
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [activeDrawerTab, setActiveDrawerTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [escalatingAlert, setEscalatingAlert] = useState(null)

  const { user } = useAuthStore()
  const hasAccess = checkHasModule(user, 'incidents')

  useEffect(() => {
    if (selectedIncident) {
      setActiveDrawerTab('overview')
    }
  }, [selectedIncident])

  if (!hasAccess) {
    return <AccessRestricted moduleName="Incident & Event Log" moduleCode="INCIDENT_MGMT" />
  }

  const loading = deviceLoading || incidentsLoading

  // Dynamic Alert stream from telemetry alerts
  const alertStream = useMemo(() => {
    if (!allAlerts) return []
    return allAlerts.map(alert => ({
      id: alert.id || 'N/A',
      severity: alert.severity || 'low',
      category: alert.category || 'system',
      message: alert.message || 'No description available',
      asset: alert.asset || 'System',
      timestamp: alert.timestamp || new Date().toISOString(),
      status: alert.status || 'active',
    }))
  }, [allAlerts])

  const filteredIncidents = useMemo(() => {
    if (!allIncidents) return []
    return allIncidents.filter(i =>
      String(i.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(i.assetId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(i.assetName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(i.type || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, allIncidents])

  // Click-to-view interaction: clicking alert streams highlights incident or spawns one on the fly
  const handleAlertClick = (alert) => {
    const matchingIncident = allIncidents.find(
      inc => inc.linkedAlertId === alert.id || inc.id === alert.id
    )
    if (matchingIncident) {
      setSelectedIncident(matchingIncident)
    } else {
      setSelectedIncident({
        id: `INC-${alert.id.toUpperCase()}`,
        type: alert.category.toUpperCase(),
        severity: alert.severity,
        assetId: alert.asset,
        assetName: 'Telemetry Node',
        message: alert.message,
        status: 'open',
        createdAt: alert.timestamp,
        notes: 'Telemetry alert active. Formal incident ledger investigation pending.',
        isTemporary: true
      })
    }
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center">
        <div className="relative">
          <div className="h-12 w-12 border-4 border-brand-border rounded-full"></div>
          <div className="absolute top-0 h-12 w-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in relative min-h-0 flex flex-col overflow-hidden">
      {/* Premium HUD Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 flex-shrink-0 bg-white p-4 sm:p-6 rounded-[15px] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-lg sm:text-2xl font-black text-brand-navy tracking-tight uppercase flex items-center gap-2 sm:gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 bg-brand-blue/10 text-brand-blue rounded-[10px] flex items-center justify-center border border-brand-blue/20 flex-shrink-0">
              <ShieldAlert size={20} />
            </div>
            <span className="leading-tight">Incident Desk HUD</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2 sm:ml-14">
            Real-time monitoring of hardware anomalies and system variances
            {device?.lastSyncedAt && (
              <span className="ml-2 text-[10px] font-black text-slate-400 uppercase tracking-normal font-bold">
                • Synced: {formatApiDate(device.lastSyncedAt)}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 relative z-10 w-full lg:w-auto">
          <div className="relative group w-full sm:max-w-md lg:min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-body group-focus-within:text-brand-blue transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search incidents, assets..."
              className="bg-brand-surface border border-brand-border rounded-[10px] py-2.5 pl-10 pr-4 text-xs font-bold text-brand-heading focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue w-full transition-all placeholder:text-brand-body/40"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Dynamic Radar and Stat Cards */}
      <div className="flex-shrink-0 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <AlertRadar alertCount={alertStream.length} />
        </div>
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard 
            label="Critical Breach" 
            value={allIncidents.filter(i => i.severity === 'critical').length} 
            icon={ShieldAlert} 
            variant="danger" 
            compact 
            unit="ALERTS"
          />
          <StatCard 
            label="High Variance" 
            value={allIncidents.filter(i => i.severity === 'high').length} 
            icon={AlertTriangle} 
            variant="warning" 
            compact 
            unit="ISSUES"
          />
          <StatCard 
            label="In Investigation" 
            value={allIncidents.filter(i => i.status === 'under_investigation').length} 
            icon={Activity} 
            variant="info" 
            compact 
            unit="TRACING"
          />
          <StatCard 
            label="Online Nodes" 
            value={[...tanks.filter(t => !t.isStale), ...flowMeters.filter(m => m.status === 'active')].length} 
            icon={CheckCircle2} 
            variant="success" 
            compact 
            unit="ONLINE"
          />
        </div>
      </div>

      {/* Main Split Layout Workspace */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6 mt-2">
        {/* Left: Live Signal Stream */}
        <div className="lg:col-span-5 flex flex-col overflow-hidden">
          <div className="flex-1 bg-white rounded-[15px] border border-brand-border shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-brand-border flex items-center justify-between bg-black/5">
              <h3 className="text-[10px] font-black text-brand-navy uppercase tracking-[0.2em] flex items-center gap-2">
                <Zap size={16} className="text-brand-blue" />
                Live Signal Stream
              </h3>
              <Badge label={alertStream.length > 0 ? 'LIVE' : 'CLEAR'} variant={alertStream.length > 0 ? 'danger' : 'success'} pulse={alertStream.length > 0} />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-brand-border bg-slate-50/30">
              {alertStream.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="h-12 w-12 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={24} className="text-brand-green" />
                  </div>
                  <p className="text-xs font-black text-brand-heading uppercase">No active signals</p>
                  <p className="text-[10px] text-brand-body/40 font-bold mt-1 uppercase tracking-widest">All hardware nodes nominal</p>
                </div>
              ) : (
                alertStream.map((alert) => (
                  <AlertRow 
                    key={alert.id} 
                    alert={alert} 
                    onClick={() => handleAlertClick(alert)}
                    onEscalate={(a) => setEscalatingAlert(a)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Incident Table (Ledger) */}
        <div className="lg:col-span-7 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden flex flex-col border border-brand-border rounded-[15px] bg-brand-card/50 backdrop-blur-sm relative z-10">
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="bg-black/5 sticky top-0 z-10">
                  <tr>
                    {['Incident', 'Affected Asset', 'Impact', 'Timing', ''].map((header, index) => (
                      <th 
                        key={index} 
                        className="px-6 py-4 text-[10px] font-black text-brand-body uppercase tracking-widest border-b border-brand-border bg-slate-50/90 backdrop-blur-md"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {filteredIncidents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-12 w-12 bg-brand-green/5 rounded-full flex items-center justify-center">
                            <CheckCircle2 size={24} className="text-brand-green" />
                          </div>
                          <p className="text-xs font-black text-brand-body uppercase">No incidents detected</p>
                          <p className="text-[10px] text-brand-body/40 font-bold uppercase tracking-widest">All hardware nominal</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredIncidents.map((inc) => {
                      const isCritical = inc.severity === 'critical';
                      const isHigh = inc.severity === 'high';
                      return (
                        <tr 
                          key={inc.id} 
                          className={`hover:bg-black/5 transition-all cursor-pointer group ${selectedIncident?.id === inc.id ? 'bg-brand-blue/5 border-l-4 border-l-brand-blue' : ''}`}
                          onClick={() => setSelectedIncident(inc)}
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className={`h-11 w-11 flex items-center justify-center rounded-[12px] transition-all border border-brand-border shadow-sm bg-brand-surface group-hover:bg-brand-blue group-hover:text-white ${isCritical ? 'text-brand-red bg-red-50 border-red-100' : 'text-brand-blue'}`}>
                                 <ShieldAlert size={18} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-brand-heading uppercase tracking-tight leading-none mb-1">{inc.id}</span>
                                <span className="text-[9px] text-brand-body font-bold uppercase tracking-tighter">{(inc.type || '').replace(/_/g, ' ')}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-brand-border">
                                {inc.assetType === 'train' ? <TrainFront size={12} /> : inc.assetType === 'flow_meter' ? <Activity size={12} /> : <Droplet size={12} />}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-black text-brand-heading">{inc.assetId}</span>
                                <span className="text-[9px] text-brand-body font-bold">{inc.assetName}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <Badge 
                              label={inc.severity} 
                              variant={isCritical ? 'danger' : isHigh ? 'warning' : 'info'} 
                            />
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5 text-xs font-black text-brand-heading">
                                <Clock size={12} className="text-brand-blue" />
                                {formatApiDate(inc.createdAt, { timeOnly: true })}
                              </div>
                              <span className="text-[9px] font-bold text-brand-body uppercase tracking-wider opacity-60">
                                {formatApiDate(inc.createdAt)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2 text-brand-body hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-all">
                                <ChevronRight size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Details Drawer Panel */}
      {selectedIncident && createPortal(
        <div className="fixed inset-0 z-[999] flex justify-end">
          <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedIncident(null)}></div>
          <div className="relative w-full sm:max-w-[500px] bg-white h-full max-h-[100dvh] shadow-2xl flex flex-col animate-slide-in-right overflow-hidden border-l border-slate-200">
            {/* Header */}
            <div className={`p-5 sm:p-8 pb-8 sm:pb-12 text-white relative overflow-hidden transition-colors duration-500 ${selectedIncident.severity === 'critical' ? 'bg-red-600' : 'bg-brand-navy'}`}>
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex flex-col gap-4 sm:gap-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-5">
                    <div className="h-16 w-16 bg-white/10 rounded-[18px] flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl group overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <AlertTriangle size={28} className="relative z-10 group-hover:scale-110 transition-all duration-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Incident Dossier</span>
                        <div className="h-1 w-1 rounded-full bg-white/30" />
                        <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">{selectedIncident.isTemporary ? 'Temporary Alert' : 'Active Triage'}</span>
                      </div>
                      <h3 className="text-3xl font-black uppercase tracking-tight leading-none">{selectedIncident.id}</h3>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedIncident(null)} 
                    className="h-10 w-10 bg-white/5 hover:bg-white/10 flex items-center justify-center rounded-full border border-white/10 transition-all text-white/60 hover:text-white backdrop-blur-md"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                   <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Detection Type</span>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                         <ShieldAlert size={12} className="text-brand-blue" />
                         <span className="text-[10px] font-black uppercase tracking-wider">{(selectedIncident.type || 'UNKNOWN').replace(/_/g, ' ')}</span>
                      </div>
                   </div>
                   <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Detected At</span>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                         <Clock size={12} className="text-brand-blue" />
                         <span className="text-[10px] font-black uppercase tracking-wider">{formatApiDate(selectedIncident.createdAt)}</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-white px-4 flex-shrink-0 overflow-x-auto no-scrollbar">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'timeline', label: 'Timeline Trace', icon: FileText },
                { id: 'escalation', label: 'Escalation Matrix', icon: Shield }
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveDrawerTab(tab.id)}
                  className={`py-4 px-3 text-[10px] font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap flex-1 justify-center ${activeDrawerTab === tab.id ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-slate-50 relative">
               <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />

               {activeDrawerTab === 'overview' && (
                 <>
                   <section className="space-y-5 relative z-10">
                     <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-brand-navy uppercase tracking-[0.4em]">Signal Severity</h4>
                        <Badge label={selectedIncident.severity} variant={selectedIncident.severity === 'critical' ? 'danger' : selectedIncident.severity === 'high' ? 'warning' : 'info'} />
                     </div>
                     
                     <div className="bg-white p-6 rounded-[22px] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                           <Activity size={80} className="text-brand-blue" />
                        </div>
                        
                        <div className="space-y-2">
                           <p className="text-[9px] font-black text-brand-body uppercase tracking-[0.2em] leading-none">Diagnostic Message</p>
                           <p className="text-sm font-black text-brand-heading leading-relaxed">{selectedIncident.message}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                          <div className="space-y-1.5">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Affected Node ID</span>
                             <p className="text-xs font-black text-brand-heading font-mono bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg w-fit">{selectedIncident.assetId}</p>
                          </div>
                          <div className="space-y-1.5">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Telemetry Nickname</span>
                             <p className="text-xs font-black text-brand-heading bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg w-fit truncate max-w-full">{selectedIncident.assetName}</p>
                          </div>
                        </div>

                        <div className="pt-4 flex items-center justify-between text-[10px] font-black uppercase text-slate-400">
                          <span>Workflow Status</span>
                          <Badge label={selectedIncident.status?.replace(/_/g, ' ')} variant={selectedIncident.status === 'open' ? 'danger' : 'warning'} />
                        </div>
                     </div>
                   </section>

                   <section className="space-y-4">
                     <h4 className="text-[10px] font-black text-brand-navy uppercase tracking-[0.4em]">Investigation Notes</h4>
                     <div className="bg-white p-6 rounded-[22px] border border-slate-200 shadow-lg shadow-slate-200/50">
                       <p className="text-xs font-medium text-slate-600 leading-relaxed">
                         {selectedIncident.notes || 'No investigation notes reported yet. Field diagnostics and log validation are currently pending assignees.'}
                       </p>
                     </div>
                   </section>
                 </>
               )}

               {activeDrawerTab === 'timeline' && (
                 <section className="space-y-5">
                   <h4 className="text-[10px] font-black text-brand-navy uppercase tracking-[0.4em]">Resolution Timeline</h4>
                   <div className="space-y-5 relative pl-4">
                     <div className="absolute left-[7px] top-6 bottom-6 w-0.5 bg-slate-200"></div>
                     
                     {[
                       { time: formatApiDate(selectedIncident.createdAt, { timeOnly: true }), date: formatApiDate(selectedIncident.createdAt), user: 'System Relay', action: 'Anomaly Detected', desc: 'Automatic hardware variance exception triggered.', icon: Activity, done: true },
                       { time: '—', date: 'Pending Operator', user: 'Operations Controller', action: 'Under Investigation', desc: 'Assigned to active queue for triage review.', icon: FileText, done: selectedIncident.status === 'under_investigation' },
                       { time: '—', date: 'Pending Dispatch', user: 'Field Engineer', action: 'Site Dispatch Queue', desc: 'Pending onsite sensor diagnostics or calibration.', icon: MessageSquare, done: false }
                     ].map((step, i) => (
                       <div key={i} className="relative flex gap-5 group">
                         <div className={`h-4 w-4 rounded-full border-2 border-white shadow-md flex items-center justify-center z-10 transition-all ${step.done ? 'bg-brand-blue ring-4 ring-brand-blue/10' : 'bg-slate-200'}`} />
                         
                         <div className="flex-1 bg-white p-5 rounded-[18px] border border-slate-200 shadow-sm group-hover:border-brand-blue/30 transition-all">
                           <div className="flex items-center justify-between mb-1.5">
                             <span className="text-xs font-black text-brand-heading">{step.action}</span>
                             <span className="text-[9px] font-black text-brand-blue uppercase tracking-wide bg-brand-surface border border-brand-border px-2 py-0.5 rounded-[6px]">{step.date}</span>
                           </div>
                           <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-2">{step.desc}</p>
                           <p className="text-[9px] font-black text-brand-body uppercase tracking-tighter opacity-60">Actor: {step.user}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                 </section>
               )}

               {activeDrawerTab === 'escalation' && (
                 <section className="space-y-5">
                   <h4 className="text-[10px] font-black text-brand-navy uppercase tracking-[0.4em]">Direct Escalation Contacts</h4>
                   <div className="space-y-4 relative pl-4">
                     <div className="absolute left-[7px] top-6 bottom-6 w-0.5 bg-slate-200"></div>
                     
                     {[
                       { level: 1, role: 'Site Supervisor', name: 'John Doe', phone: '+255 712 345 678', email: 'j.doe@trc.go.tz', time: 'Immediate', status: 'Notified' },
                       { level: 2, role: 'Operations Manager', name: 'Sarah Smith', phone: '+255 754 987 654', email: 's.smith@trc.go.tz', time: 'T + 30 Mins', status: 'Pending' },
                       { level: 3, role: 'Technical Admin', name: 'Alex Johnson', phone: '+255 682 111 222', email: 'a.johnson@techtonics.co.tz', time: 'T + 1 Hour', status: 'Standby' }
                     ].map((contact, i) => (
                       <div key={i} className="relative flex gap-5 group">
                         <div className="h-4 w-4 rounded-full bg-brand-blue border-2 border-white shadow-md z-10 flex items-center justify-center">
                           <span className="text-[7px] font-black text-white">{contact.level}</span>
                         </div>
                         
                         <div className="flex-1 bg-white p-5 rounded-[18px] border border-slate-200 shadow-sm group-hover:border-brand-blue/30 transition-all">
                           <div className="flex items-center justify-between mb-3">
                             <div>
                               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{contact.role}</p>
                               <h5 className="text-sm font-black text-brand-navy leading-none">{contact.name}</h5>
                             </div>
                             <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${contact.status === 'Notified' ? 'bg-brand-green/10 text-brand-green' : 'bg-slate-100 text-slate-500'}`}>{contact.time}</span>
                           </div>
                           
                           <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-[10px] font-bold text-brand-blue">
                             <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 hover:underline">
                               <Phone size={12} className="text-slate-400" />
                               {contact.phone}
                             </a>
                             <div className="hidden sm:block h-3 w-px bg-slate-200" />
                             <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 hover:underline">
                               <Mail size={12} className="text-slate-400" />
                               {contact.email}
                             </a>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </section>
               )}
            </div>
            
            {/* Action Footer */}
            <div className="p-4 sm:p-8 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-auto shadow-[0_-20px_30px_rgba(0,0,0,0.02)] relative z-20">
               <button className="flex-1 py-4 bg-slate-50 border border-slate-200 text-brand-navy rounded-[14px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 hover:border-brand-blue/30 transition-all shadow-sm flex items-center justify-center gap-3 group active:scale-95">
                 <RefreshCw size={16} className="text-slate-400 group-hover:rotate-45 transition-all" /> 
                 Sync Status
               </button>
               <button className="flex-1 py-4 bg-brand-blue text-white rounded-[14px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand-hover transition-all shadow-xl shadow-brand-blue/30 active:scale-95 flex items-center justify-center gap-3 group border border-brand-hover">
                 <CheckCircle2 size={16} className="group-hover:scale-110 transition-transform" /> 
                 Mark Resolved
               </button>
            </div>
          </div>
        </div>
      , document.body)}

      <EscalationMatrixModal 
        alert={escalatingAlert} 
        onClose={() => setEscalatingAlert(null)} 
      />
    </div>
  )
}

export default IncidentDeskPage
