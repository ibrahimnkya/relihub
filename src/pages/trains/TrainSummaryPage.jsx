import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { 
  Train, 
  MapPin, 
  Clock, 
  Activity, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ExternalLink, 
  Settings,
  X,
  Zap,
  TrendingDown,
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
  Droplet,
  Fuel,
  Plus,
  Download,
  Save,
  Trash2,
  FileText,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  TrainFront
} from 'lucide-react'
import { Timer01Icon } from 'hugeicons-react'
import { useTranslation } from 'react-i18next'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'
import TableBase from '../../components/ui/TableBase'
import StatusDot from '../../components/ui/StatusDot'
import ProgressBar from '../../components/ui/ProgressBar'
import { trainService } from '../../services/trainService'

import LayoutToggle from '../../components/ui/LayoutToggle'
import TrainCard from '../../components/shared/TrainCard'
import Alert from '../../components/ui/Alert'
import Select from '../../components/ui/Select'
import { useToast } from '../../store/toastStore'
import { useAuthStore } from '../../store/authStore'
import { checkHasModule } from '../../utils/modules'
import AccessRestricted from '../../components/shared/AccessRestricted'
import TrainVisualizer from '../../components/ui/TrainVisualizer'

const TrainsSummaryPage = () => {
  const { t } = useTranslation()
  const { addToast } = useToast()
  const { user } = useAuthStore()
  const hasAccess = checkHasModule(user, 'locomotive')

  const [loading, setLoading] = useState(true)
  const [trains, setTrains] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedTrain, setSelectedTrain] = useState(null)
  const [activeTab, setActiveTab] = useState('stats') // 'stats', 'settings'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [layout, setLayout] = useState('grid')
  const [newTrainType, setNewTrainType] = useState('Standard Diesel')
  const [selectedTrainStatus, setSelectedTrainStatus] = useState('active')

  if (!hasAccess) {
    return <AccessRestricted moduleName="Locomotive Management" moduleCode="LOCO_MGMT" />
  }

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setSelectedTrain(null)
      addToast({
        title: "Configuration Updated",
        message: "Locomotive Telemetry Configuration Updated Successfully",
        type: 'success'
      })
    }, 1500)
  }

  const handleAdd = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setIsAddModalOpen(false)
      addToast({
        title: "Asset Registered",
        message: "New MGR Asset Successfully Registered in Fleet",
        type: 'success'
      })
    }, 1200)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await trainService.getTrains()
      setTrains(res.data)
      // Set initial layout based on item count
      if (res.data.length > 6) {
        setLayout('list')
      } else {
        setLayout('grid')
      }
    } catch (error) {
      console.error('Error fetching trains:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredTrains = useMemo(() => {
    return trains.filter(tr => {
      const matchesSearch = tr.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           tr.location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || tr.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [trains, searchTerm, statusFilter])

  const handleDownloadPDF = () => {
    addToast({
      title: "Generating Report",
      message: `Generating PDF Report for ${selectedTrain?.id}...`,
      type: 'info'
    })
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="relative">
        <div className="h-12 w-12 border-4 border-black/5 rounded-full"></div>
        <div className="absolute top-0 h-12 w-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in relative h-[calc(100vh-140px)] flex flex-col overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black text-brand-heading tracking-tight uppercase">{t('Trains.title')}</h1>
          <p className="text-sm text-brand-body font-medium">{t('Trains.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-body group-focus-within:text-brand-blue transition-colors" size={16} />
            <input 
              type="text" 
              placeholder={t('Common.search')}
              className="bg-brand-card border border-brand-border rounded-[10px] py-2 pl-10 pr-4 text-sm text-brand-heading focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue w-64 transition-all placeholder:text-brand-body/40"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <LayoutToggle layout={layout} onChange={setLayout} />

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-brand-blue text-white px-4 py-2 rounded-[10px] font-bold text-xs flex items-center gap-2 hover:bg-brand-hover transition-all shadow-lg active:scale-95 border border-brand-hover"
          >
            <Plus size={16} />
            ADD ASSET
          </button>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <StatCard label={t('Trains.stat_total')} value={trains.length} icon={Train} variant="info" compact />
        <StatCard label={t('Trains.stat_active')} value={trains.filter(tr => tr.status === 'active').length} icon={Activity} variant="success" compact />
        <StatCard label={t('Trains.stat_idle')} value={trains.filter(tr => tr.status === 'idle').length} icon={Clock} variant="warning" compact />
        <div className="bg-brand-card p-4 rounded-[10px] border border-brand-border shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Fuel size={48} className="text-brand-blue animate-pulse" />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <p className="text-[9px] font-black text-brand-body uppercase tracking-[0.2em] mb-1">Next Refueling Cycle</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-brand-heading uppercase">
                {trains.length > 0 ? 'In 06 Hours' : 'Scheduled'}
              </span>
              <div className="h-1.5 w-1.5 rounded-full bg-brand-blue animate-ping"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 min-h-0 flex flex-col overflow-hidden">
        {layout === 'grid' ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
              {filteredTrains.map((train) => (
                <TrainCard key={train.id} train={train} onClick={(t) => { setSelectedTrain(t); setActiveTab('stats'); }} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-brand-card rounded-[10px] border border-brand-border shadow-sm overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto custom-scrollbar">
              <TableBase headers={[t('Trains.col_id'), t('Trains.col_location'), t('Trains.col_fuel'), t('Trains.col_speed'), t('Trains.col_status'), t('Trains.col_actions')]}>
                {filteredTrains.map((train) => (
                  <tr 
                    key={train.id} 
                    className={`hover:bg-black/5 transition-colors cursor-pointer group border-b border-brand-border last:border-0 ${selectedTrain?.id === train.id ? 'bg-brand-blue/5' : ''}`}
                    onClick={() => { setSelectedTrain(train); setActiveTab('stats'); }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-brand-surface border border-brand-border rounded-[10px] flex items-center justify-center text-brand-body group-hover:bg-brand-blue group-hover:text-white transition-all">
                          <Train size={18} />
                        </div>
                        <span className="text-xs font-black text-brand-heading uppercase">{train.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-brand-heading">{train.location}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-24">
                        <div className="h-1.5 w-full bg-brand-surface border border-brand-border rounded-full overflow-hidden">
                          <div className={`h-full ${train.fuelPct < 20 ? 'bg-brand-red' : 'bg-brand-blue'}`} style={{ width: `${train.fuelPct}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-black text-brand-heading">{train.speed} KM/H</td>
                    <td className="px-6 py-4"><StatusDot status={train.status} pulse={train.status === 'active'} /></td>
                    <td className="px-6 py-4">
                      <button className="p-2 text-brand-body hover:text-brand-blue rounded-[10px] hover:bg-black/5 transition-colors"><ExternalLink size={16} /></button>
                    </td>
                  </tr>
                ))}
              </TableBase>
            </div>
          </div>
        )}
      </div>

      {/* Detail Sidebar */}
      {selectedTrain && createPortal(
        <div className="fixed inset-0 z-[999] flex justify-end">
          <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedTrain(null)}></div>
          <div className="relative w-full max-w-[500px] bg-brand-card h-full shadow-2xl flex flex-col animate-slide-in-right overflow-hidden border-l border-brand-border">
            {/* Sidebar Header */}
            <div className="p-6 bg-brand-card border-b border-brand-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-brand-surface border border-brand-border rounded-[10px] flex items-center justify-center"><Train size={24} className="text-brand-blue" /></div>
                <div>
                  <h3 className="text-xl font-black text-brand-heading">{selectedTrain.id}</h3>
                  <p className="text-[10px] font-bold text-brand-body uppercase tracking-widest">{selectedTrain.location}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTrain(null)} className="p-2 hover:bg-black/5 rounded-full transition-colors text-brand-body"><X size={24} /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-brand-border bg-brand-surface px-2 flex-shrink-0 overflow-x-auto no-scrollbar">
              {[
                { id: 'stats', label: 'Telemetry', icon: Activity },
                { id: 'hardware', label: 'Hardware', icon: Fuel },
                { id: 'recommendations', label: 'Reli-IQ', icon: Sparkles },
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-4 text-[9px] font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap flex-1 justify-center ${activeTab === tab.id ? 'border-brand-blue text-brand-blue' : 'border-transparent text-brand-body hover:text-brand-heading'}`}
                >
                  <tab.icon size={13} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-brand-surface">
              {activeTab === 'stats' ? (
                <>
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black text-brand-body uppercase tracking-[0.2em]">Live 3D Visualization</h4>
                    <div className="bg-brand-card rounded-[20px] p-12 border border-brand-border flex items-center justify-center min-h-[300px] shadow-sm relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="scale-[4] text-brand-blue/20 group-hover:scale-[4.5] group-hover:text-brand-blue/30 transition-all duration-700">
                         <TrainFront strokeWidth={0.5} />
                      </div>
                    </div>
                  </section>
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black text-brand-body uppercase tracking-[0.2em]">Operational Stats</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-brand-card rounded-[10px] border border-brand-border flex flex-col gap-1 shadow-sm">
                        <span className="text-[9px] font-bold text-brand-body uppercase">Current Velocity</span>
                        <span className="text-2xl font-black text-brand-heading">{selectedTrain.speed} km/h</span>
                      </div>
                      <div className="p-4 bg-brand-card rounded-[10px] border border-brand-border flex flex-col gap-1 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                           <Fuel size={24} className="text-brand-blue" />
                        </div>
                        <span className="text-[9px] font-bold text-brand-body uppercase">Fuel Level</span>
                        <span className="text-2xl font-black text-brand-blue">{selectedTrain.fuelPct}%</span>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black text-brand-body uppercase tracking-[0.2em]">Read-Only Asset Registry</h4>
                    <div className="bg-brand-card rounded-[15px] border border-brand-border overflow-hidden divide-y divide-brand-border shadow-sm">
                      <div className="p-4 flex items-center justify-between group hover:bg-black/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-brand-surface rounded-lg flex items-center justify-center border border-brand-border">
                            <TrendingUp size={16} className="text-brand-blue" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-brand-body uppercase leading-none mb-1">Tank Capacity</p>
                            <p className="text-xs font-black text-brand-heading">{selectedTrain.fuelCapacity?.toLocaleString()} LTRS</p>
                          </div>
                        </div>
                        <Badge label="FIXED" variant="info" />
                      </div>
                      
                      <div className="p-4 flex items-center justify-between group hover:bg-black/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-brand-surface rounded-lg flex items-center justify-center border border-brand-border">
                            <Droplet size={16} className="text-brand-green" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-brand-body uppercase leading-none mb-1">Inflow Meter (Total)</p>
                            <p className="text-xs font-black text-brand-heading">{selectedTrain.inflowTotal?.toLocaleString()} LTRS</p>
                          </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-brand-green tabular-nums">SYNCED</p>
                        </div>
                      </div>

                      <div className="p-4 flex items-center justify-between group hover:bg-black/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-brand-surface rounded-lg flex items-center justify-center border border-brand-border">
                            <TrendingDown size={16} className="text-brand-red" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-brand-body uppercase leading-none mb-1">Outflow Meter (Engine)</p>
                            <p className="text-xs font-black text-brand-heading">{selectedTrain.outflowTotal?.toLocaleString()} LTRS</p>
                          </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-brand-red tabular-nums tracking-tighter">CONSUMPTION</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-[8px] text-brand-body font-bold uppercase tracking-widest text-center px-4 opacity-40">
                      Telemetry data is locked and synced with on-board industrial hardware sensors.
                    </p>
                  </section>
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black text-brand-body uppercase tracking-[0.2em]">Quick Actions</h4>
                    <button 
                      onClick={handleDownloadPDF}
                      className="w-full flex items-center justify-center gap-3 p-4 bg-brand-card border border-brand-border text-brand-heading rounded-[10px] font-black text-[10px] uppercase tracking-widest hover:bg-black/5 transition-all group shadow-sm"
                    >
                      <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                      Download PDF Report
                    </button>
                  </section>
                </>
              ) : activeTab === 'recommendations' ? (
                <div className="space-y-6 animate-fade-in pb-10">
                  {/* Train Hero Intelligence */}
                  <div className="bg-brand-card rounded-[20px] p-6 relative overflow-hidden border border-brand-border shadow-md">
                    <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12">
                      <Sparkles size={140} className="text-brand-blue" />
                    </div>
                    <div className="relative z-10 text-center py-4">
                      <div className="h-14 w-14 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-blue/20">
                        <Sparkles size={28} className="text-brand-blue" />
                      </div>
                      <h4 className="text-xl font-black uppercase tracking-tight text-brand-heading mb-1">Locomotive Intelligence</h4>
                      <p className="text-[10px] font-black text-brand-body uppercase tracking-[0.2em]">Reli-IQ Core Analysis</p>
                    </div>
                  </div>

                  {/* Train Action Cards */}
                  <div className="space-y-4">
                    <div className={`p-5 rounded-[15px] border flex gap-4 transition-all hover:shadow-lg ${
                      selectedTrain.fuelPct < 20 ? 'bg-brand-red/10 border-brand-red/20' : 'bg-brand-green/10 border-brand-green/20'
                    }`}>
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-brand-border ${
                        selectedTrain.fuelPct < 20 ? 'bg-brand-card text-brand-red' : 'bg-brand-card text-brand-green'
                      }`}>
                        {selectedTrain.fuelPct < 20 ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-[11px] font-black uppercase tracking-tight ${
                            selectedTrain.fuelPct < 20 ? 'text-brand-red' : 'text-brand-green'
                          }`}>
                            {selectedTrain.fuelPct < 20 ? 'Energy Depletion' : 'Logistics Optimized'}
                          </h4>
                          <Badge 
                            label={selectedTrain.fuelPct < 20 ? 'CRITICAL' : 'STABLE'} 
                            variant={selectedTrain.fuelPct < 20 ? 'danger' : 'success'} 
                          />
                        </div>
                        <p className="text-xs text-brand-body leading-relaxed font-medium">
                          {selectedTrain.fuelPct < 20 
                            ? `Locomotive fuel levels at ${selectedTrain.fuelPct}% are below safety margins. Coordinate immediate refueling at the next junction.`
                            : "Locomotive operational efficiency is high. Fuel reserves are sufficient for the assigned route duration."}
                        </p>
                      </div>
                    </div>

                    {/* Efficiency Scoring Section */}
                    <div className="p-6 bg-brand-card rounded-[20px] border border-brand-border relative overflow-hidden shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <Activity className="text-brand-blue" size={20} />
                          <h4 className="text-[10px] font-black text-brand-heading uppercase tracking-widest">Performance Matrix</h4>
                        </div>
                        <span className="text-lg font-black text-brand-blue">89.7%</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Velocity Balance</p>
                          <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                             <div className="h-full bg-brand-green w-[85%]" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Fuel Efficiency</p>
                          <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                             <div className="h-full bg-brand-blue w-[91%]" />
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-[10px] text-brand-body italic mt-6 leading-relaxed border-t border-brand-border pt-4">
                        "Real-time analysis suggests optimal cruising velocity for this cargo weight. Maintaining current speed ensures maximum range."
                      </p>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'hardware' ? (
                <div className="space-y-8 animate-fade-in pb-10">
                  {/* Internal Storage Section */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-brand-body uppercase tracking-[0.2em]">Internal Storage Node</h4>
                      <Badge label="SHIELDED" variant="info" />
                    </div>
                    <div className="bg-brand-card rounded-[20px] p-6 border border-brand-border shadow-sm space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue border border-brand-blue/20">
                            <TrendingUp size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-brand-heading uppercase tracking-tight">Main Reservoir T-01</p>
                            <p className="text-[9px] font-bold text-brand-body uppercase opacity-60">Titanium Grade 5 Composite</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-brand-heading leading-none">{selectedTrain.fuelPct}%</p>
                          <p className="text-[9px] font-bold text-brand-body uppercase">Fill State</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase">
                          <span className="text-brand-body">0 L</span>
                          <span className="text-brand-heading">{selectedTrain.fuelCapacity?.toLocaleString()} L</span>
                        </div>
                        <div className="h-3 w-full bg-brand-surface rounded-full border border-brand-border p-0.5 overflow-hidden">
                           <div 
                             className={`h-full rounded-full transition-all duration-1000 ${selectedTrain.fuelPct < 20 ? 'bg-brand-red shadow-[0_0_10px_rgba(162,42,42,0.3)]' : 'bg-brand-blue shadow-[0_0_10px_rgba(37,99,235,0.3)]'}`} 
                             style={{ width: `${selectedTrain.fuelPct}%` }}
                           />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="p-3 bg-brand-surface rounded-[12px] border border-brand-border">
                           <p className="text-[8px] font-black text-brand-body uppercase tracking-widest mb-1">Current Weight</p>
                           <p className="text-sm font-black text-brand-heading">{(selectedTrain.fuelLevel * 0.85).toFixed(0)} KG</p>
                        </div>
                        <div className="p-3 bg-brand-surface rounded-[12px] border border-brand-border">
                           <p className="text-[8px] font-black text-brand-body uppercase tracking-widest mb-1">Temperature</p>
                           <p className="text-sm font-black text-brand-heading">24.5°C</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Flow Control Section */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-brand-body uppercase tracking-[0.2em]">Flow Control Monitoring</h4>
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse"></div>
                        <span className="text-[9px] font-black text-brand-green uppercase">Streaming</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="p-4 bg-brand-card rounded-[15px] border border-brand-border flex items-center justify-between group hover:border-brand-blue/30 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 bg-brand-surface rounded-[12px] border border-brand-border flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
                              <Droplet size={18} />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-brand-heading uppercase tracking-tight">Digital Inflow Meter</p>
                              <p className="text-[9px] font-bold text-brand-body uppercase opacity-60">ID: FM-IN-043</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-black text-brand-heading tabular-nums">{selectedTrain.inflowTotal?.toLocaleString()} L</p>
                           <p className="text-[8px] font-black text-brand-green uppercase tracking-widest">Lifetime Total</p>
                        </div>
                      </div>

                      <div className="p-4 bg-brand-card rounded-[15px] border border-brand-border flex items-center justify-between group hover:border-brand-blue/30 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 bg-brand-surface rounded-[12px] border border-brand-border flex items-center justify-center text-brand-red group-hover:bg-brand-red group-hover:text-white transition-all">
                              <TrendingDown size={18} />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-brand-heading uppercase tracking-tight">Engine Outflow Meter</p>
                              <p className="text-[9px] font-bold text-brand-body uppercase opacity-60">ID: FM-OUT-112</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-black text-brand-heading tabular-nums">{selectedTrain.outflowTotal?.toLocaleString()} L</p>
                           <p className="text-[8px] font-black text-brand-red uppercase tracking-widest">Consumption Meter</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="bg-brand-blue/5 p-5 rounded-[20px] border border-brand-blue/20 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-5">
                        <ShieldCheck size={64} className="text-brand-blue" />
                     </div>
                     <h4 className="text-[10px] font-black text-brand-blue uppercase tracking-[0.2em] mb-2">Hardware Integrity</h4>
                     <p className="text-xs text-brand-body leading-relaxed font-medium">
                        All internal fuel system nodes are reporting nominal status. Calibration sync was last performed 24h ago at the Central Depot.
                     </p>
                  </section>
                </div>
              ) : null}
            </div>
            
            <div className="p-6 border-t border-brand-border bg-brand-card mt-auto">
              <button className="w-full bg-brand-blue text-white px-4 py-4 rounded-[10px] font-black text-[10px] uppercase tracking-widest hover:bg-brand-hover transition-colors shadow-lg flex items-center justify-center gap-2">
                <ExternalLink size={14} />
                ENTER FULL TELEMETRY HUD
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* Add Locomotive Modal */}
      {isAddModalOpen && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative w-full max-w-[500px] bg-brand-card rounded-[15px] shadow-2xl border border-brand-border overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-brand-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-brand-blue text-white rounded-[10px] flex items-center justify-center"><Plus size={20} /></div>
                <div>
                  <h3 className="text-lg font-black text-brand-heading uppercase tracking-tight">Register Asset</h3>
                  <p className="text-[10px] text-brand-body font-bold uppercase tracking-widest leading-none">New MGR Locomotive</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-brand-body hover:text-brand-heading transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6 bg-brand-surface">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-brand-body uppercase">Locomotive ID</label>
                  <input type="text" placeholder="e.g. TR-202" className="w-full p-3 bg-brand-card border border-brand-border rounded-[10px] text-sm font-bold text-brand-heading focus:ring-2 focus:ring-brand-blue/20 outline-none placeholder:text-brand-body/20" />
                </div>
                <div className="space-y-4">
                  <Select 
                    label="Engine Type"
                    value={newTrainType}
                    onChange={(e) => setNewTrainType(e.target.value)}
                    options={[
                      'Standard Diesel',
                      'Electric Hybrid',
                      'Heavy Haul'
                    ]}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-brand-body uppercase">Deployment Sector</label>
                <input type="text" placeholder="e.g. Dar es Salaam Terminal" className="w-full p-3 bg-brand-card border border-brand-border rounded-[10px] text-sm font-bold text-brand-heading focus:ring-2 focus:ring-brand-blue/20 outline-none placeholder:text-brand-body/20" />
              </div>
              <Alert variant="info" title="Telemetry Activation">
                System will automatically initialize telemetry heartbeats once the asset is saved to the registry.
              </Alert>
            </div>
            <div className="p-6 bg-brand-card border-t border-brand-border flex gap-3">
              <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 border border-brand-border text-brand-heading rounded-[10px] font-black text-[10px] uppercase tracking-widest hover:bg-black/5 transition-all">Cancel</button>
              <button 
                onClick={handleAdd}
                disabled={isSaving}
                className="flex-1 py-3 bg-brand-blue text-white rounded-[10px] font-black text-[10px] uppercase tracking-widest hover:bg-brand-hover transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 border border-brand-hover"
              >
                {isSaving && <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {isSaving ? 'REGISTERING...' : 'Save Asset'}
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  )
}

export default TrainsSummaryPage
