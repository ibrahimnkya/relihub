import { useState, useMemo } from 'react'
import { 
  Cylinder, 
  Search,
  Calendar,
  ChevronRight,
  History,
  Battery,
  AlertTriangle
} from 'lucide-react'
import AccessRestricted from '../../components/shared/AccessRestricted'
import TableBase from '../../components/ui/TableBase'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'
import TankCard from '../../components/shared/TankCard'
import { useDeviceData } from '../../hooks/useDeviceData'
import LayoutToggle from '../../components/ui/LayoutToggle'
import { useToast } from '../../store/toastStore'
import { useAuthStore } from '../../store/authStore'
import { checkHasModule } from '../../utils/modules'
import AssetDetailModal from '../../components/shared/AssetDetailModal'

const TanksDashboardPage = () => {
  const { addToast } = useToast()
  const { tanks: rawTanks, loading, error } = useDeviceData()
  const TANKS = rawTanks || []
  
  const { user } = useAuthStore()
  const hasAccess = checkHasModule(user, 'tanks')

  const [selectedTank, setSelectedTank] = useState(null)
  const [activeTab, setActiveTab] = useState('stats') // 'stats', 'logs', 'info'
  const [searchTerm, setSearchTerm] = useState('')
  const [layout, setLayout] = useState('grid')
  const [newUnitType, setNewUnitType] = useState('Diesel Premium')

  if (!hasAccess) {
    return <AccessRestricted moduleName="Tank Management" moduleCode="TANKS_MGMT" />
  }

  const filteredTanks = useMemo(() => {
    if (!Array.isArray(TANKS)) return []
    return TANKS.filter(t => 
      t && (
        (t.name?.toString().toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
        (t.site?.toString().toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
    )
  }, [searchTerm, TANKS])

  const totalTanks = TANKS.length
  const criticalTanks = TANKS.filter(t => t && t.fillPct <= t.criticalThreshold).length
  const warningTanks = TANKS.filter(t => t && t.fillPct <= t.warningThreshold && t.fillPct > t.criticalThreshold).length

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setSelectedTank(null)
      addToast({
        title: "Calibration Successful",
        message: "Fuel Tank Calibration Completed Successfully",
        type: 'success'
      })
    }, 1500)
  }



  const handleDownloadPDF = () => {
    addToast({
      title: "Generating Report",
      message: `Generating Inventory Report for ${selectedTank?.name}...`,
      type: 'info'
    })
  }

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
          <h1 className="text-2xl font-black text-brand-heading tracking-tight uppercase">Fuel Tank Metrics</h1>
          <p className="text-sm text-brand-body font-medium">Monitoring fuel tank storage levels and hardware logs</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-body group-focus-within:text-brand-blue transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search tanks, sites..."
              className="bg-brand-card border border-brand-border rounded-[10px] py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue w-64 text-brand-heading transition-all placeholder:text-brand-body/40"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <LayoutToggle layout={layout} onChange={setLayout} />
        </div>
      </div>

      {/* Summary KPI Stats Grid - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <StatCard 
          label="Total Fuel Tanks" 
          value={totalTanks} 
          icon={Cylinder} 
          variant="info" 
          compact 
          unit="UNITS"
        />
        <StatCard 
          label="Low Fill (Critical)" 
          value={criticalTanks} 
          icon={AlertTriangle} 
          variant="danger" 
          compact 
          unit="! ACTIONS"
        />
        <StatCard 
          label="Reorder Warnings" 
          value={warningTanks} 
          icon={History} 
          variant="warning" 
          compact 
          unit="PENDING"
        />
        <div className="bg-brand-blue p-4 rounded-[10px] border border-brand-hover shadow-lg relative overflow-hidden group hover:bg-brand-hover transition-all cursor-pointer">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Calendar size={48} className="text-white animate-pulse" />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Next Stock Reorder</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white uppercase">
                {TANKS?.length > 0 ? (
                  (() => {
                    const validTanks = TANKS.filter(t => t && typeof t.daysToEmpty === 'number');
                    if (validTanks.length === 0) return '14 Days';
                    const avg = Math.round(validTanks.reduce((acc, t) => acc + (t.daysToEmpty || 0), 0) / validTanks.length);
                    return `In ${isNaN(avg) ? 14 : avg} Days`;
                  })()
                ) : 'Scheduled'}
              </span>
              <div className="h-1.5 w-1.5 rounded-full bg-white animate-ping"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {layout === 'grid' ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
              {filteredTanks.map((tank) => (
                <TankCard 
                  key={tank.id} 
                  tank={tank} 
                  onSelect={(t) => { setSelectedTank(t); setActiveTab('stats'); }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-brand-card rounded-[10px] border border-brand-border shadow-sm overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto custom-scrollbar">
              <TableBase headers={['Unit Name', 'Site / Location', 'Fuel Level (%)', 'Current Volume', 'Battery', 'Status', 'Actions']}>
                {filteredTanks.map((tank) => (
                  <tr 
                    key={tank.id} 
                    className={`hover:bg-black/5 transition-colors cursor-pointer group ${selectedTank?.id === tank.id ? 'bg-brand-blue/5' : ''}`}
                    onClick={() => { setSelectedTank(tank); setActiveTab('stats'); }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-brand-surface rounded-[10px] flex items-center justify-center text-brand-body group-hover:bg-brand-blue group-hover:text-white transition-all border border-brand-border">
                          <Cylinder size={18} />
                        </div>
                        <span className="text-xs font-black text-brand-heading uppercase">{tank.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-brand-body uppercase">{tank.site}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-20 bg-black/5 h-1.5 rounded-full overflow-hidden border border-brand-border">
                          <div 
                            className={`h-full ${tank.fillPct < tank.criticalThreshold ? 'bg-brand-red' : 'bg-brand-blue'}`} 
                            style={{ width: `${tank.fillPct}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-brand-heading">{tank.fillPct}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-black text-brand-heading">{tank.currentVolume?.toLocaleString()} L</td>
                    <td className="px-6 py-4">
                      {tank.battery ? (
                        <div className="flex items-center gap-1.5 text-xs font-black text-brand-heading">
                          <Battery size={14} className={parseInt(tank.battery.value) < 20 ? 'text-brand-red' : 'text-brand-green'} />
                          {tank.battery.value}%
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        label={tank.fillPct < tank.criticalThreshold ? 'CRITICAL' : tank.fillPct < tank.warningThreshold ? 'WARNING' : 'HEALTHY'} 
                        variant={tank.fillPct < tank.criticalThreshold ? 'danger' : tank.fillPct < tank.warningThreshold ? 'warning' : 'success'} 
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
          </div>
        )}
      </div>

      <AssetDetailModal 
        asset={selectedTank} 
        type="tank" 
        onClose={() => setSelectedTank(null)} 
      />
    </div>
  )
}

const ShieldAlert = ({ size, className }) => (
  <div className={className} style={{ width: size, height: size }}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  </div>
)

export default TanksDashboardPage
