import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { 
  Fuel, 
  Search, 
  Filter, 
  ArrowRight, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronDown,
  X,
  Zap,
  Activity,
  History,
  TrendingUp,
  MapPin,
  Share2,
  ChevronRight,
  ChevronLeft,
  Droplet,
  User,
  Building2, 
  Map, 
  LayoutGrid, 
  List as ListIcon,
  TrainFront
} from 'lucide-react'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'
import StatusDot from '../../components/ui/StatusDot'
import { FUELING_SESSIONS } from '../../mock/fuelingSessions.mock'
import FlowVisualizer from '../../components/ui/FlowVisualizer'
import Select from '../../components/ui/Select'
import { useAuthStore } from '../../store/authStore'
import { checkHasModule } from '../../utils/modules'
import AccessRestricted from '../../components/shared/AccessRestricted'
import { History as HistoryIcon } from 'lucide-react'

const getFriendlyStatus = (status) => {
  switch (status) {
    case 'matched':
    case 'likely_match':
      return 'Verified'
    case 'suspicious':
      return 'Discrepancy'
    case 'unmatched':
      return 'Mismatch'
    default:
      return status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'
  }
}

const getFuelFlowStyle = (flow) => {
  switch (flow) {
    case 'locomotive to tank':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200/50',
        badgeBg: 'bg-amber-100/80 text-amber-800',
        label: 'Locomotive to Tank',
        desc: 'Maintenance Return',
        iconColor: 'text-amber-500'
      }
    case 'tank to locomotive':
      return {
        bg: 'bg-blue-50 text-brand-blue border-blue-200/50',
        badgeBg: 'bg-blue-100/80 text-brand-blue',
        label: 'Tank to Locomotive',
        desc: 'Active Fueling',
        iconColor: 'text-brand-blue'
      }
    case 'tank refuel':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
        badgeBg: 'bg-emerald-100/80 text-emerald-800',
        label: 'Tank Refill',
        desc: 'Replenishment',
        iconColor: 'text-emerald-500'
      }
    case 'tank dispensing':
      return {
        bg: 'bg-purple-50 text-purple-700 border-purple-200/50',
        badgeBg: 'bg-purple-100/80 text-purple-800',
        label: 'Tank Dispensing',
        desc: 'Auxiliary Supply',
        iconColor: 'text-purple-500'
      }
    default:
      return {
        bg: 'bg-slate-50 text-slate-700 border-slate-200',
        badgeBg: 'bg-slate-100 text-slate-800',
        label: flow || 'Unknown Flow',
        desc: 'Unclassified Flow',
        iconColor: 'text-slate-500'
      }
  }
}

const getDuration = (start, end) => {
  if (!start || !end) return 'N/A';
  const diffMs = new Date(end) - new Date(start);
  const diffMins = Math.floor(diffMs / 60000);
  const diffSecs = Math.floor((diffMs % 60000) / 1000);
  return `${diffMins}m ${diffSecs}s`;
}

const getDetailFlowConfig = (session) => {
  if (!session) return null;
  const flow = session.fuelFlow;
  switch (flow) {
    case 'locomotive to tank':
      return {
        leftLabel: 'Locomotive',
        leftVal: session.sourceTankId,
        leftIcon: TrainFront,
        rightLabel: 'Target Storage Tank',
        rightVal: session.targetTrainId,
        rightIcon: Droplet,
      }
    case 'tank to locomotive':
      return {
        leftLabel: 'Source Tank',
        leftVal: session.sourceTankId,
        leftIcon: Droplet,
        rightLabel: 'Locomotive',
        rightVal: session.targetTrainId,
        rightIcon: TrainFront,
      }
    case 'tank refuel':
      return {
        leftLabel: 'Supplier Truck',
        leftVal: session.sourceTankId,
        leftIcon: Droplet,
        rightLabel: 'Target Storage Tank',
        rightVal: session.targetTrainId,
        rightIcon: Droplet,
      }
    case 'tank dispensing':
      return {
        leftLabel: 'Storage Tank',
        leftVal: session.sourceTankId,
        leftIcon: Droplet,
        rightLabel: 'Auxiliary System',
        rightVal: session.targetTrainId,
        rightIcon: Building2,
      }
    default:
      return {
        leftLabel: 'Source',
        leftVal: session.sourceTankId,
        leftIcon: Droplet,
        rightLabel: 'Target',
        rightVal: session.targetTrainId,
        rightIcon: TrainFront,
      }
  }
}



const FuelingSessionsPage = () => {
  const { user } = useAuthStore()
  const hasAccess = checkHasModule(user, 'fueling')
  const [selectedSession, setSelectedSession] = useState(null)
  const [activeDetailTab, setActiveDetailTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('All Sessions')
  const [depotFilter, setDepotFilter] = useState('All Terminals')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  if (!hasAccess) {
    return <AccessRestricted moduleName="Fueling Session Management" moduleCode="FUELING_MGMT" />
  }

  const filteredSessions = useMemo(() => {
    if (!FUELING_SESSIONS) return [];
    return FUELING_SESSIONS.filter(s => {
      const matchesSearch = (s.id && s.id.toLowerCase().includes(searchTerm.toLowerCase())) || 
                          (s.targetTrainId && s.targetTrainId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (s.sourceTankId && s.sourceTankId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (s.fuelFlow && s.fuelFlow.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesDepot = depotFilter === 'All Terminals' || (s.site && s.site.includes(depotFilter))
      
      if (activeFilter === 'All Sessions') return matchesSearch && matchesDepot
      if (activeFilter === 'Verified') return matchesSearch && matchesDepot && (s.status === 'matched' || s.status === 'likely_match')
      if (activeFilter === 'Discrepancies') return matchesSearch && matchesDepot && (s.status === 'suspicious' || s.status === 'unmatched')
      return matchesSearch && matchesDepot
    })
  }, [searchTerm, activeFilter, depotFilter])

  // Reset pagination on search or filter updates
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, activeFilter, depotFilter])

  // Reset tab to overview when a new session is selected
  useEffect(() => {
    if (selectedSession) {
      setActiveDetailTab('overview')
    }
  }, [selectedSession])

  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE)
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredSessions.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredSessions, currentPage])

  const totalSessions = filteredSessions.length
  const startIndex = totalSessions > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalSessions)

  const totalVolume = useMemo(() => FUELING_SESSIONS?.reduce((sum, s) => sum + (s.meteredLiters || 0), 0) || 0, [])
  const avgConfidence = useMemo(() => {
    if (!FUELING_SESSIONS || FUELING_SESSIONS.length === 0) return 0;
    return Math.round(FUELING_SESSIONS.reduce((sum, s) => sum + (s.confidenceScore || 0), 0) / FUELING_SESSIONS.length)
  }, [])

  const activeSession = FUELING_SESSIONS?.find(s => s.status === 'matched')

  return (
    <div className="space-y-6 animate-fade-in relative h-[calc(100vh-140px)] flex flex-col overflow-hidden">
      {/* Dynamic Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 flex-shrink-0 bg-white p-6 rounded-[15px] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-2xl font-black text-brand-navy tracking-tight uppercase flex items-center gap-3">
            <div className="h-10 w-10 bg-brand-blue/10 text-brand-blue rounded-[10px] flex items-center justify-center border border-brand-blue/20">
              <Fuel size={20} />
            </div>
            Fueling Sessions Hub
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2 ml-14">Real-time fueling activity and audit stream</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative group min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-body group-focus-within:text-brand-blue transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search sessions by ID or fleet..."
                className="bg-brand-surface border border-brand-border rounded-[10px] py-2.5 pl-10 pr-4 text-xs font-bold text-brand-heading focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue w-full transition-all placeholder:text-brand-body/40"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select 
              value={depotFilter}
              onChange={(e) => setDepotFilter(e.target.value)}
              options={['All Terminals', 'Dar es Salaam', 'Morogoro', 'Dodoma']}
              className="min-w-[160px]"
            />
          </div>
        </div>
      </div>

      {/* Premium KPI Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
        <StatCard 
          label="Fueling Activity" 
          value={FUELING_SESSIONS.length} 
          icon={HistoryIcon} 
          variant="neutral" 
          compact 
          unit="SESSIONS"
        />
        <StatCard 
          label="Total Dispensed" 
          value={totalVolume.toLocaleString()} 
          icon={Droplet} 
          variant="info" 
          compact 
          unit="LITERS"
        />
        <StatCard 
          label="Audit Clear Rate" 
          value={FUELING_SESSIONS.filter(s => s.status === 'matched' || s.status === 'likely_match').length} 
          icon={CheckCircle2} 
          variant="success" 
          compact 
          unit="VERIFIED"
        />
        <StatCard 
          label="Match Quality" 
          value={`${avgConfidence}%`} 
          icon={TrendingUp} 
          variant="warning" 
          compact 
          unit="ACCURACY"
        />
      </div>

      {/* Tabs & Additional Filters Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 flex-shrink-0">
        {/* Internal Tabs (pill style aligned with User Access Management) */}
        <div className="flex gap-1 bg-black/5 p-1 rounded-[12px] border border-brand-border w-fit overflow-x-auto">
          {[
            { id: 'All Sessions', label: 'All Sessions', icon: ListIcon },
            { id: 'Verified', label: 'Verified', icon: CheckCircle2 },
            { id: 'Discrepancies', label: 'Discrepancies', icon: AlertCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-[10px] text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeFilter === tab.id 
                  ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                  : 'text-brand-body hover:bg-white/50'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Workspace */}
      <div className="flex-1 overflow-hidden flex flex-col border border-brand-border rounded-[15px] bg-brand-card/50 backdrop-blur-sm relative z-10 mt-2">
        {/* Premium Interactive Table */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-black/5 sticky top-0 z-10">
              <tr>
                {['Session ID', 'Fuel Flow', 'Fueling Time', 'Fuel Volume', 'Accuracy', 'Audit Status', ''].map((header, index) => (
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
              {paginatedSessions.map((session) => {
                const isVerified = session.status === 'matched' || session.status === 'likely_match';
                const flowStyle = getFuelFlowStyle(session.fuelFlow);
                return (
                  <tr 
                    key={session.id} 
                    className={`cursor-pointer hover:bg-black/5 transition-all group ${selectedSession?.id === session.id ? 'bg-brand-blue/5' : ''}`}
                    onClick={() => setSelectedSession(session)}
                  >
                    {/* Session ID */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`h-11 w-11 flex items-center justify-center rounded-[12px] transition-all border border-brand-border shadow-sm bg-brand-surface text-brand-blue group-hover:bg-brand-blue group-hover:text-white`}>
                           <Fuel size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-brand-heading uppercase tracking-tight leading-none mb-1">{session.id}</span>
                          <span className="text-[10px] font-bold text-brand-body tracking-wider opacity-60 uppercase">{session.site}</span>
                        </div>
                      </div>
                    </td>

                    {/* Fuel Flow */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border w-fit ${flowStyle.badgeBg} ${flowStyle.bg.split(' ')[2]}`}>
                          {flowStyle.label}
                        </span>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">{session.sourceTankId}</span>
                          <ArrowRight size={12} className={`shrink-0 ${flowStyle.iconColor}`} />
                          <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">{session.targetTrainId}</span>
                        </div>
                      </div>
                    </td>

                    {/* Fueling Time */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs font-black text-brand-heading">
                          <Clock size={14} className="text-brand-blue" />
                          {session.startedAt ? new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-brand-blue" />
                          <span className="text-[9px] text-brand-body font-bold uppercase">{getDuration(session.startedAt, session.endedAt)} DURATION</span>
                        </div>
                      </div>
                    </td>

                    {/* Fuel Volume */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-brand-body font-black uppercase tracking-tighter">Dispensed</span>
                          <span className="text-sm font-black text-brand-heading tabular-nums">{session.meteredLiters?.toLocaleString()} L</span>
                        </div>
                        {session.locomotiveGainLiters > 0 && (
                          <>
                            <div className="h-4 w-px bg-brand-border" />
                            <div className="flex flex-col">
                              <span className="text-[9px] text-brand-body font-black uppercase tracking-tighter">Received</span>
                              <span className={`text-sm font-black tabular-nums ${Math.abs((session.meteredLiters || 0) - (session.locomotiveGainLiters || 0)) > 5 ? 'text-brand-amber' : 'text-brand-green'}`}>
                                {session.locomotiveGainLiters?.toLocaleString()} L
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Accuracy */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                         <div className="flex-1 min-w-[60px] h-1.5 bg-brand-surface rounded-full overflow-hidden border border-brand-border">
                            <div 
                              className={`h-full transition-all duration-1000 ${
                                (session.confidenceScore || 0) >= 95 ? 'bg-brand-green shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-brand-blue'
                              }`} 
                              style={{ width: `${session.confidenceScore}%` }} 
                            />
                         </div>
                         <span className="text-[11px] font-black text-brand-heading tabular-nums">{session.confidenceScore}%</span>
                      </div>
                    </td>

                    {/* Audit Status */}
                    <td className="px-6 py-5">
                       <Badge 
                        label={getFriendlyStatus(session.status)} 
                        variant={
                          (session.status === 'matched' || session.status === 'likely_match') ? 'success' : 
                          session.status === 'suspicious' ? 'warning' : 'danger'
                        } 
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-2 text-brand-body hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-all">
                           <ChevronRight size={18} />
                         </button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Premium Pagination Footer */}
        <div className="px-6 py-4 border-t border-brand-border bg-black/5 flex items-center justify-between flex-shrink-0">
          <div className="text-[11px] font-black text-brand-body uppercase tracking-wider">
            Showing <span className="text-brand-navy font-bold">{startIndex}</span> to{' '}
            <span className="text-brand-navy font-bold">{endIndex}</span> of{' '}
            <span className="text-brand-navy font-bold">{totalSessions}</span> sessions
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 px-3 rounded-[8px] border border-brand-border text-brand-body bg-white hover:bg-black/5 transition-all flex items-center justify-center gap-1 active:scale-95 disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100 shadow-sm"
            >
              <ChevronLeft size={14} className="text-brand-navy" />
              <span className="text-[10px] font-black uppercase tracking-wider">Prev</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-8 w-8 rounded-[8px] text-[11px] font-black flex items-center justify-center transition-all active:scale-95 ${
                  currentPage === page
                    ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20 border border-brand-blue'
                    : 'border border-brand-border text-brand-body bg-white hover:bg-black/5'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 px-3 rounded-[8px] border border-brand-border text-brand-body bg-white hover:bg-black/5 transition-all flex items-center justify-center gap-1 active:scale-95 disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100 shadow-sm"
            >
              <span className="text-[10px] font-black uppercase tracking-wider">Next</span>
              <ChevronRight size={14} className="text-brand-navy" />
            </button>
          </div>
        </div>
      </div>

      {/* Session Detail Panel */}
      {selectedSession && createPortal(
        <div className="fixed inset-0 z-[999] flex justify-end">
          <div 
            className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm animate-fade-in transition-all" 
            onClick={() => setSelectedSession(null)} 
          />
          
          <div className="relative w-full max-w-[500px] bg-white h-full shadow-2xl flex flex-col animate-slide-in-right overflow-hidden border-l border-slate-200">
            {/* Session Header */}
            <div className={`p-8 pb-12 text-white relative overflow-hidden transition-colors duration-500 ${selectedSession.status === 'suspicious' ? 'bg-red-600' : 'bg-brand-navy'}`}>
               <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse" />
               <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
               
               <div className="relative z-10 flex flex-col gap-8">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-5">
                      <div className="h-16 w-16 bg-white/10 rounded-[18px] flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl group overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Fuel size={28} className="relative z-10 group-hover:scale-110 transition-all duration-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Session ID</span>
                          <div className="h-1 w-1 rounded-full bg-white/30" />
                          <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">{selectedSession.site?.split(' ')[0]} Depot</span>
                        </div>
                        <h3 className="text-3xl font-black uppercase tracking-tight leading-none">{selectedSession.id}</h3>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedSession(null)} 
                      className="h-10 w-10 bg-white/5 hover:bg-white/10 flex items-center justify-center rounded-full border border-white/10 transition-all text-white/60 hover:text-white backdrop-blur-md"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-8">
                     <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Fueling Location</span>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                           <MapPin size={12} className="text-brand-blue" />
                           <span className="text-[10px] font-black uppercase tracking-wider">{selectedSession.site}</span>
                        </div>
                     </div>
                     <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Started At</span>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                           <Clock size={12} className="text-brand-blue" />
                           <span className="text-[10px] font-black uppercase tracking-wider">{new Date(selectedSession.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-white px-4 flex-shrink-0 overflow-x-auto no-scrollbar">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'checklist', label: 'Validation Checklist', icon: CheckCircle2 },
                { id: 'notes', label: 'Officer Notes', icon: History }
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveDetailTab(tab.id)}
                  className={`py-4 px-3 text-[10px] font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap flex-1 justify-center ${activeDetailTab === tab.id ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Session Detail Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-slate-50 relative">
               <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />

               {activeDetailTab === 'overview' && (
                 <>
                   <section className="space-y-5 relative z-10">
                     <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-brand-navy uppercase tracking-[0.4em]">Fuel Volume Summary</h4>
                        <Badge label={getFriendlyStatus(selectedSession.status)} variant={(selectedSession.status === 'matched' || selectedSession.status === 'likely_match') ? 'success' : selectedSession.status === 'suspicious' ? 'warning' : 'danger'} />
                     </div>
                     
                     <div className="bg-white p-6 rounded-[22px] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                           <Activity size={80} className="text-brand-blue" />
                        </div>

                        <div className="grid grid-cols-2 gap-10 relative">
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                              <div className="h-10 w-10 bg-brand-surface rounded-full flex items-center justify-center border border-brand-border shadow-inner">
                                 <TrendingUp size={18} className="text-brand-blue animate-pulse" />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <p className="text-[9px] font-black text-brand-body uppercase tracking-[0.2em] leading-none">Fuel Dispensed</p>
                              <div className="flex items-baseline gap-1">
                                 <p className="text-3xl font-black text-brand-heading tabular-nums tracking-tighter">{selectedSession.meteredLiters?.toLocaleString()}</p>
                                 <span className="text-xs font-black text-brand-body opacity-40 uppercase">Ltrs</span>
                              </div>
                           </div>
                           <div className="space-y-2 text-right">
                              <p className="text-[9px] font-black text-brand-body uppercase tracking-[0.2em] leading-none">Received by Locomotive</p>
                              <div className="flex items-baseline justify-end gap-1">
                                 <p className="text-3xl font-black text-brand-blue tabular-nums tracking-tighter">{selectedSession.locomotiveGainLiters?.toLocaleString()}</p>
                                 <span className="text-xs font-black text-brand-blue/40 uppercase">Ltrs</span>
                              </div>
                           </div>
                        </div>
                        
                        <div className="pt-6 border-t border-brand-border">
                           <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] font-black text-brand-heading uppercase tracking-widest">Audit Match Score</span>
                              <span className={`text-xs font-black ${(selectedSession.confidenceScore || 0) >= 95 ? 'text-brand-green' : 'text-brand-blue'}`}>
                                 {selectedSession.confidenceScore}% Match
                              </span>
                           </div>
                           <div className="h-2.5 w-full bg-brand-surface rounded-full overflow-hidden border border-brand-border p-0.5">
                              <div 
                                className={`h-full rounded-full transition-all duration-[2000ms] ease-out ${(selectedSession.confidenceScore || 0) >= 95 ? 'bg-brand-green shadow-[0_0_12px_rgba(34,197,94,0.4)]' : 'bg-brand-blue shadow-[0_0_12px_rgba(37,99,235,0.4)]'}`} 
                                style={{ width: `${selectedSession.confidenceScore}%` }} 
                              />
                           </div>
                        </div>
                     </div>
                   </section>

                   <section className="space-y-5">
                      <h4 className="text-[10px] font-black text-brand-heading uppercase tracking-[0.4em]">Fueling Route</h4>
                      <div className="bg-brand-navy rounded-[22px] p-8 text-white space-y-10 relative overflow-hidden shadow-2xl">
                         <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                         </div>
                         <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 blur-[60px] rounded-full" />
                         
                         {(() => {
                            const cfg = getDetailFlowConfig(selectedSession);
                            const LeftIcon = cfg.leftIcon;
                            const RightIcon = cfg.rightIcon;
                            return (
                              <div className="relative z-10 flex items-center justify-between px-2">
                                 <div className="flex flex-col items-center gap-3 group">
                                    <div className="h-14 w-14 bg-white/5 rounded-[18px] border border-white/10 flex items-center justify-center text-brand-blue backdrop-blur-xl group-hover:border-brand-blue/50 transition-all duration-500 shadow-inner">
                                       <LeftIcon size={24} className="group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="text-center">
                                       <span className="text-[10px] font-black uppercase text-white tracking-[0.1em]">{cfg.leftVal}</span>
                                       <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-0.5">{cfg.leftLabel}</p>
                                    </div>
                                 </div>

                                 <div className="flex-1 flex flex-col items-center gap-2 mx-4">
                                    <div className="w-full relative py-2">
                                       <div className="absolute inset-0 flex items-center">
                                          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-brand-blue/50 to-transparent" />
                                       </div>
                                       <div className="relative flex justify-center">
                                          <div className="h-8 w-8 bg-brand-navy border border-brand-blue/30 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                                             <Zap size={14} className="text-brand-blue" />
                                          </div>
                                       </div>
                                    </div>
                                    <span className="text-[9px] font-black text-brand-blue uppercase tracking-[0.2em]">{selectedSession.flowMeterId || 'FM-MGR'} · Flow Meter</span>
                                 </div>

                                 <div className="flex flex-col items-center gap-3 group">
                                    <div className="h-14 w-14 bg-white/5 rounded-[18px] border border-white/10 flex items-center justify-center text-brand-blue backdrop-blur-xl group-hover:border-brand-blue/50 transition-all duration-500 shadow-inner">
                                       <RightIcon size={24} className="group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="text-center">
                                       <span className="text-[10px] font-black uppercase text-white tracking-[0.1em]">{cfg.rightVal}</span>
                                       <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-0.5">{cfg.rightLabel}</p>
                                    </div>
                                 </div>
                              </div>
                            );
                         })()}

                         <div className="relative z-10 p-5 bg-white/[0.03] rounded-[18px] border border-white/5 backdrop-blur-md space-y-5">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                  <Activity size={12} className="text-brand-blue" />
                                  <span className="text-[9px] font-black uppercase text-white/60 tracking-widest">Flow Rate Activity</span>
                               </div>
                               <span className="text-[10px] font-black text-brand-blue tracking-tighter">Live Signal</span>
                            </div>
                            <div className="flex items-end gap-1.5 h-10 px-1">
                               {[30, 55, 40, 80, 50, 95, 60, 85, 55, 70, 45, 60, 35, 50, 75].map((h, i) => (
                                 <div 
                                   key={i} 
                                   className="flex-1 bg-gradient-to-t from-brand-blue/40 to-brand-blue rounded-t-[3px] transition-all duration-700 hover:brightness-125 cursor-pointer" 
                                   style={{ 
                                     height: `${h}%`, 
                                     animation: `wave 2s ease-in-out infinite ${i * 150}ms`
                                   }} 
                                 />
                               ))}
                            </div>
                         </div>
                      </div>
                   </section>
                 </>
               )}

               {activeDetailTab === 'checklist' && selectedSession.signals && (
                 <section className="space-y-5">
                   <h4 className="text-[10px] font-black text-brand-heading uppercase tracking-[0.4em]">Audit Signals Checklist</h4>
                   <div className="bg-white p-6 rounded-[22px] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-4">
                     {[
                       { key: 'flowMeterPresent', label: 'Flow Meter Signal Synchronized' },
                       { key: 'tankDropPresent', label: 'Storage Tank Level Telemetry Aligned' },
                       { key: 'locomotiveGainPresent', label: 'Locomotive Intake Match Recorded' },
                       { key: 'inRefuelingGeofence', label: 'Refueling Geofence Verified' },
                       { key: 'timeWindowAligned', label: 'Time Windows Aligned' }
                     ].map((sig) => {
                       const isOk = selectedSession.signals[sig.key];
                       return (
                         <div key={sig.key} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                           <span className="text-xs font-bold text-brand-body">{sig.label}</span>
                           <div className="flex items-center gap-3">
                             <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                               isOk ? 'bg-emerald-50 text-brand-green border-brand-green/20' : 'bg-slate-50 text-slate-400 border-slate-200'
                             }`}>
                               {isOk ? 'Active' : 'Offline'}
                             </span>
                             {isOk ? (
                               <CheckCircle2 size={16} className="text-brand-green shrink-0" />
                             ) : (
                               <AlertCircle size={16} className="text-slate-300 shrink-0" />
                             )}
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 </section>
               )}

               {activeDetailTab === 'notes' && (
                 <section className="space-y-5">
                   <h4 className="text-[10px] font-black text-brand-heading uppercase tracking-[0.4em]">Audit & Review Notes</h4>
                   <div className="bg-white p-6 rounded-[22px] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-5">
                     <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-brand-heading uppercase tracking-widest">Review Status</span>
                       <div className="flex items-center gap-2">
                         <User size={14} className="text-slate-400" />
                         <span className="text-xs font-bold text-slate-600">
                           {selectedSession.reviewedBy ? `Reviewed by ${selectedSession.reviewedBy}` : 'Verification Pending'}
                         </span>
                       </div>
                     </div>

                     <div className={`p-4 rounded-[14px] border ${
                       selectedSession.status === 'suspicious' 
                         ? 'bg-red-50 text-brand-red border-brand-red/20' 
                         : (selectedSession.status === 'matched' || selectedSession.status === 'likely_match')
                         ? 'bg-emerald-50 text-brand-green border-brand-green/20'
                         : 'bg-blue-50 text-brand-blue border-blue-200/50'
                     }`}>
                       <p className="text-xs font-medium leading-relaxed">
                         {selectedSession.investigationNotes || 'No anomalies detected. All telemetry matches expectations. Session verified automatically by smart auditing flow.'}
                       </p>
                     </div>
                   </div>
                 </section>
               )}
            </div>
            
            <div className="p-8 bg-white border-t border-slate-100 flex items-center gap-4 mt-auto shadow-[0_-20px_30px_rgba(0,0,0,0.02)] relative z-20">
               <button className="flex-1 py-4 bg-slate-50 border border-slate-200 text-brand-navy rounded-[14px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 hover:border-brand-blue/30 transition-all shadow-sm flex items-center justify-center gap-3 group active:scale-95">
                 <Share2 size={16} className="text-slate-400 group-hover:scale-110 group-hover:text-brand-blue transition-all" /> 
                 Share Report
               </button>
               <button className="flex-1 py-4 bg-brand-blue text-white rounded-[14px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand-hover transition-all shadow-xl shadow-brand-blue/30 active:scale-95 flex items-center justify-center gap-3 group border border-brand-hover">
                 <History size={16} className="group-hover:rotate-12 transition-transform" /> 
                 View Audit Trail
               </button>
            </div>
          </div>
        </div>
      , document.body)}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(1); opacity: 0.5; }
          50% { transform: scaleY(1.3); opacity: 1; }
        }
        .animate-wave {
          animation: wave 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default FuelingSessionsPage
