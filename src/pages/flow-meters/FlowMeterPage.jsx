import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { 
  Gauge, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Zap, 
  Settings,
  Search,
  Filter,
  ChevronRight,
  X,
  Download,
  History,
  Info,
  RefreshCw,
  Cpu,
  Server,
  CheckCircle2,
  XCircle,
  ExternalLink
} from 'lucide-react'
import ProgressBar from '../../components/ui/ProgressBar'
import TableBase from '../../components/ui/TableBase'
import StatusDot from '../../components/ui/StatusDot'
import Alert from '../../components/ui/Alert'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'
import FlowMeterCard from '../../components/shared/FlowMeterCard'
import MeterVisualizer from '../../components/ui/MeterVisualizer'
import { useDeviceData, formatApiDate } from '../../hooks/useDeviceData'
import LayoutToggle from '../../components/ui/LayoutToggle'
import { useToast } from '../../store/toastStore'
import { useAuthStore } from '../../store/authStore'
import { checkHasModule } from '../../utils/modules'
import AccessRestricted from '../../components/shared/AccessRestricted'
import AssetDetailModal from '../../components/shared/AssetDetailModal'
const FlowMeterPage = () => {
  const { addToast } = useToast()
  const { flowMeters: rawFlowMeters, loading, error } = useDeviceData()
  const FLOW_METERS = rawFlowMeters || []
  
  const { user } = useAuthStore()
  const hasAccess = checkHasModule(user, 'meters')

  const [selectedMeter, setSelectedMeter] = useState(null)
  const [activeTab, setActiveTab] = useState('stats') // 'stats', 'logs', 'info'
  const [searchTerm, setSearchTerm] = useState('')
  const [layout, setLayout] = useState('grid')
  const [newMeterSite, setNewMeterSite] = useState('Dar es Salaam Main Terminal')

  if (!hasAccess) {
    return <AccessRestricted moduleName="Flow Meter Management" moduleCode="METERS_MGMT" />
  }

  const filteredMeters = useMemo(() => {
    return FLOW_METERS.filter(m => 
      m.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.linkedSite.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, FLOW_METERS])

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setSelectedMeter(null)
      addToast({
        title: "Hardware Config Pushed",
        message: "Configuration Successfully Pushed to Hardware Node",
        type: 'success'
      })
    }, 1500)
  }



  const handleDownloadReport = () => {
    addToast({
      title: "Generating Analytics",
      message: `Generating Metric Report for ${selectedMeter?.id}...`,
      type: 'info'
    })
  }

  const totalDispensedToday = useMemo(() => {
    return FLOW_METERS.reduce((acc, m) => acc + (m.dailyTotal || 0), 0)
  }, [FLOW_METERS])

  if (loading) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center p-6">
        <div className="bg-brand-card border border-brand-border p-8 rounded-[20px] max-w-md text-center space-y-4 shadow-sm">
          <div className="h-16 w-16 bg-brand-red/10 text-brand-red rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-black text-brand-heading uppercase">Telemetry Connection Failed</h3>
          <p className="text-sm text-brand-body font-medium">We couldn't establish a link with the hardware node. Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-brand-blue text-white rounded-[10px] font-black text-xs uppercase tracking-widest hover:bg-brand-hover transition-all shadow-lg border border-brand-hover"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in relative h-[calc(100vh-140px)] flex flex-col overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black text-brand-heading tracking-tight uppercase">Flow Hardware HUD</h1>
          <p className="text-sm text-brand-body font-medium">Real-time monitoring of fuel dispensing and metering hardware</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-body group-focus-within:text-brand-blue transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search meters, sites..."
              className="bg-brand-card border border-brand-border rounded-[10px] py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue w-64 text-brand-heading transition-all placeholder:text-brand-body/40"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <LayoutToggle layout={layout} onChange={setLayout} />
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0 animate-fade-in-up">
        <StatCard 
            label="Active Meters" 
            value={FLOW_METERS.filter(m => m.status === 'active').length} 
            icon={Gauge} 
            variant="success" 
            compact 
            unit="HARDWARE"
        />
        <StatCard 
            label="Fault Warnings" 
            value={FLOW_METERS.filter(m => m.status === 'fault').length} 
            icon={AlertTriangle} 
            variant="danger" 
            compact 
            unit="REPAIRS"
        />
        <StatCard 
            label="Service Pending" 
            value={FLOW_METERS.filter(m => m.status === 'calib_due').length} 
            icon={Settings} 
            variant="warning" 
            compact 
            unit="CALIBRATE"
        />
        <div className="bg-brand-card p-4 rounded-[10px] border border-brand-border shadow-sm flex items-center gap-4 group hover:border-brand-blue/30 transition-all">
          <div className="h-10 w-10 bg-brand-surface text-brand-heading rounded-[10px] flex items-center justify-center transition-transform group-hover:rotate-12 border border-brand-border">
            <Zap size={20} className="text-brand-blue" />
          </div>
          <div>
            <p className="text-[9px] font-black text-brand-body uppercase tracking-widest leading-tight">Dispensed Today</p>
            <div className="flex items-baseline gap-1">
              <p className="text-xl font-black text-brand-heading tracking-tighter">{totalDispensedToday.toLocaleString()}</p>
              <span className="text-[10px] font-black text-brand-body">L</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1">
          {layout === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
              {filteredMeters.map((meter) => (
                <FlowMeterCard 
                  key={meter.id} 
                  meter={meter} 
                  onSelect={(m) => { setSelectedMeter(m); setActiveTab('stats'); }}
                />
              ))}
            </div>
          ) : (
            <div className="bg-brand-card rounded-[10px] border border-brand-border shadow-sm overflow-hidden flex flex-col mb-6">
              <TableBase headers={['Hardware ID', 'Linked Node', 'Current Flow', 'Accumulation', 'Health', 'Actions']}>
                {filteredMeters.map((meter) => (
                  <tr 
                    key={meter.id} 
                    className={`hover:bg-black/5 transition-colors cursor-pointer group ${selectedMeter?.id === meter.id ? 'bg-brand-blue/5' : ''}`}
                    onClick={() => { setSelectedMeter(meter); setActiveTab('stats'); }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-brand-surface rounded-[10px] flex items-center justify-center text-brand-body group-hover:bg-brand-blue group-hover:text-white transition-all border border-brand-border">
                          <Gauge size={18} />
                        </div>
                        <span className="text-xs font-black text-brand-heading uppercase">{meter.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-brand-body uppercase">{meter.linkedSite}</td>
                    <td className="px-6 py-4 text-xs font-black text-brand-heading">{meter.currentFlowRate} L/M</td>
                    <td className="px-6 py-4 text-xs font-black text-brand-heading">{meter.dailyTotal?.toLocaleString() ?? '0'} L</td>
                    <td className="px-6 py-4 text-xs font-black text-brand-heading">
                      <Badge 
                        label={(meter.status || 'unknown').replace('_', ' ')} 
                        variant={meter.status === 'active' ? 'success' : meter.status === 'fault' ? 'danger' : 'warning'} 
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 text-brand-body hover:text-brand-blue hover:bg-black/5 rounded-[10px] transition-colors">
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </TableBase>
            </div>
          )}

        </div>
      </div>

      <AssetDetailModal 
        asset={selectedMeter} 
        type="meter" 
        onClose={() => setSelectedMeter(null)} 
      />
    </div>
  )
}

export default FlowMeterPage
