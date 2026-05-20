import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Gauge,
  Cylinder,
  AlertCircle,
  RefreshCcw,
  AlertTriangle,
  Zap,
  Globe,
  Radio,
  Target,
  RefreshCw,
  Activity
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import StatusDot from '../../components/ui/StatusDot'
import TableBase from '../../components/ui/TableBase'
import AlertRow from '../../components/ui/AlertRow'
import AssetDetailModal from '../../components/shared/AssetDetailModal'
import EscalationMatrixModal from '../../components/shared/EscalationMatrixModal'
import AggregateDetailModal from '../../components/shared/AggregateDetailModal'

import { useDeviceData, formatApiDate } from '../../hooks/useDeviceData'
import TankVisualizer from '../../components/ui/TankVisualizer'
import MeterVisualizer from '../../components/ui/MeterVisualizer'
import { useToast } from '../../store/toastStore'
import { useAuthStore } from '../../store/authStore'
import { syncService } from '../../services/syncService'
import { checkHasModule } from '../../utils/modules'

const Sparkline = ({ data = [], color = '#A41720' }) => {
  const points = data.length > 0 ? data.map(p => p.volume || p.value || 0) : [30, 10, 25, 15, 30, 10, 20];
  const max = Math.max(...points) || 1;
  const min = Math.min(...points);
  const range = max - min || 1;
  
  const width = 100;
  const height = 40;
  
  const svgPoints = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 10) - 5;
    return `${x},${y}`;
  });

  const pathData = `M ${svgPoints.join(' L ')}`;

  return (
    <svg className="w-16 h-8 opacity-50" viewBox={`0 0 ${width} ${height}`}>
      <path
        d={data.length > 0 ? pathData : "M0 30 Q 10 10 20 25 T 40 15 T 60 30 T 80 10 T 100 20"}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const CommandCentrePage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { addToast } = useToast()
  const [isSyncing, setIsSyncing] = useState(false)

  const handleResync = async () => {
    setIsSyncing(true)
    addToast({ title: 'Syncing', message: 'Initializing hardware resynchronization...', type: 'info' })
    try {
      const res = await syncService.syncDevicesAndSensors({
        form_method: "save",
        name: user?.name || user?.full_name || "Super Administrator",
        email: user?.email || "admin@admin.com",
        phone: user?.phone || "0715333300",
        password: "Admin@2025"
      })
      if (res.data?.status === 'ERROR') {
        throw new Error(res.data?.errorMessage || 'Synchronization protocol failed.')
      }
      
      const output = res.data?.returnData?.output || 'Telemetry sync complete.'
      addToast({ title: 'Sync Successful', message: output, type: 'success' })
      refetch()
    } catch (error) {
      console.error('Sync Error:', error)
      addToast({ 
        title: 'Sync Failed', 
        message: error.message || 'Heartbeat failure with hardware gateway.', 
        type: 'danger' 
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const { tanks, flowMeters, device, loading, refetch } = useDeviceData()
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [assetType, setAssetType] = useState('tank') // 'tank' or 'meter'
  const [escalatingAlert, setEscalatingAlert] = useState(null)
  const [showTankAggModal, setShowTankAggModal] = useState(false)
  const [showMeterAggModal, setShowMeterAggModal] = useState(false)

  // Derive real incident signals from hardware state
  const offlineNodes = [
    ...tanks.filter(t => t.isStale).map(t => ({ id: t.id, name: t.name, type: 'TANK', reason: 'Device Offline' })),
    ...flowMeters.filter(m => m.status !== 'active').map(m => ({ id: m.id, name: m.serial, type: 'METER', reason: 'Meter Inactive' })),
  ]
  const criticalTanks = tanks.filter(t => t.fillPct <= t.criticalThreshold)
  const warningTanks = tanks.filter(t => t.fillPct <= t.warningThreshold && t.fillPct > t.criticalThreshold)

  const generatedAlerts = [
    ...offlineNodes.map(node => ({
      id: `ALT-${node.id}`,
      severity: 'critical',
      message: `${node.type} ${node.reason}: ${node.name}`,
      asset: node.id,
      timestamp: device?.lastSyncedAt,
    })),
    ...criticalTanks.map(tank => ({
      id: `ALT-VOL-${tank.id}`,
      severity: 'critical',
      message: `Critical Volume: ${tank.name} at ${tank.fillPct}%`,
      asset: tank.id,
      timestamp: tank.lastReadingAt,
    })),
    ...warningTanks.map(tank => ({
      id: `ALT-WRN-${tank.id}`,
      severity: 'warning',
      message: `Low Volume Warning: ${tank.name} at ${tank.fillPct}%`,
      asset: tank.id,
      timestamp: tank.lastReadingAt,
    })),
  ]

  const hasTanks = checkHasModule(user, 'tanks')
  const hasMeters = checkHasModule(user, 'meters')
  const hasIncidents = checkHasModule(user, 'incidents')

  // Filter raw data based on module access
  const activeTanks = hasTanks ? tanks : []
  const activeMeters = hasMeters ? flowMeters : []
  const activeDevices = [...activeTanks, ...activeMeters]

  const onlineTanks = activeTanks.filter(t => !t.isStale).length
  const onlineMeters = activeMeters.filter(m => m.status === 'active').length
  const avgFillPct = activeTanks.length > 0
    ? Math.round(activeTanks.reduce((acc, t) => acc + t.fillPct, 0) / activeTanks.length)
    : 0


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="relative">
          <div className="h-16 w-16 border-4 border-black/5 rounded-full"></div>
          <div className="absolute top-0 h-16 w-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col space-y-4 animate-fade-in-up relative">
      {/* HUD Header */}
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-brand-blue rounded-[12px] flex items-center justify-center text-white shadow-lg border border-brand-hover relative overflow-hidden group flex-shrink-0">
            <Radio size={20} className="animate-pulse relative z-10" />
            <div className="absolute inset-0 bg-white opacity-10 group-hover:opacity-20 transition-opacity"></div>
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-brand-heading tracking-tight uppercase">Control Dashboard</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse"></span>
              <p className="text-[9px] font-black text-brand-body uppercase tracking-[0.2em] opacity-60">
                Live Fleet & Storage Status • Real-time Updates
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {device?.lastSyncedAt && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-brand-card border border-brand-border rounded-[10px] shadow-sm">
              <RefreshCw size={12} className="text-brand-green" />
              <span className="text-[9px] font-black text-brand-body uppercase">Synced: {formatApiDate(device.lastSyncedAt)}</span>
            </div>
          )}
          <button 
            onClick={handleResync}
            disabled={isSyncing}
            className="bg-brand-blue text-white hover:bg-brand-hover px-4 sm:px-6 py-2.5 sm:py-3 rounded-[12px] font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-2 transition-all shadow-xl active:scale-95 border border-brand-hover disabled:opacity-50"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Updating...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {hasTanks && (
          <StatCard 
            label="Online Tanks" 
            value={onlineTanks} 
            icon={Cylinder} 
            variant={onlineTanks < tanks.length ? 'warning' : 'success'} 
            compact 
            unit={`/ ${activeTanks.length} UNITS`}
          />
        )}
        {hasMeters && (
          <StatCard 
            label="Online Flowmeters" 
            value={onlineMeters} 
            icon={Gauge} 
            variant={onlineMeters < flowMeters.length ? 'warning' : 'success'} 
            compact 
            unit={`/ ${activeMeters.length} UNITS`}
          />
        )}
        {hasIncidents && (
          <StatCard 
            label="Active Alarms" 
            value={generatedAlerts.length} 
            icon={AlertCircle} 
            variant={generatedAlerts.length > 0 ? 'danger' : 'success'} 
            compact 
            unit="ALERTS"
          />
        )}
        {hasTanks && (
          <div className="bg-brand-blue p-4 rounded-[12px] border border-brand-hover shadow-xl relative overflow-hidden group cursor-pointer hover:bg-brand-hover transition-all">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity translate-x-2 -translate-y-2">
              <Globe size={48} className="animate-spin-slow text-white" />
            </div>
            <div className="relative z-10">
              <p className="text-[8px] font-black text-white/60 uppercase tracking-[0.2em] mb-1">Avg Fill Level</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{avgFillPct}</span>
                <span className="text-[10px] font-bold text-white/50 uppercase">%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid — stacks on mobile, side-by-side on large */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">

        {/* Left: Telemetry (8/12) */}
        <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-5">

          {/* Tank + Meter Visualizers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

            {/* Dynamic Telemetry — Tanks */}
            {hasTanks && (
              <div className="bg-brand-card rounded-[15px] shadow-sm border border-brand-border p-5 relative overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[10px] font-black text-brand-heading uppercase tracking-widest flex items-center gap-2">
                    <Cylinder size={14} className="text-brand-blue animate-pulse" />
                    Fuel Tank State
                  </h3>
                  <Badge 
                    label={`${onlineTanks}/${activeTanks.length} ONLINE`} 
                    variant={onlineTanks < tanks.length ? 'warning' : 'success'} 
                  />
                </div>
                  <div className="flex-1 flex flex-col justify-center space-y-6">
                  <div 
                    className="cursor-pointer group/agg"
                    onClick={() => setShowTankAggModal(true)}
                  >
                    <div className="text-center py-4 group-hover/agg:scale-[1.02] transition-transform">
                      <p className="text-[10px] font-black text-brand-body uppercase tracking-widest mb-2">Average Storage Level</p>
                      <TankVisualizer percentage={avgFillPct} active={avgFillPct > 0} label="AGGREGATE" />
                      <p className="text-2xl font-black text-brand-heading mt-4">{avgFillPct}%</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setShowTankAggModal(true)}
                    className="w-full py-3 bg-brand-surface border border-brand-border rounded-[10px] text-[10px] font-black text-brand-blue uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all text-center"
                  >
                    View Detailed Tank Analytics
                  </button>
                </div>
                <div className="absolute bottom-0 right-0 p-4 opacity-[0.03] scale-150 rotate-12 pointer-events-none">
                  <Cylinder size={120} />
                </div>
              </div>
            )}

            {/* Dynamic Telemetry — Meters */}
            {hasMeters && (
              <div className="bg-brand-card rounded-[15px] shadow-sm border border-brand-border p-5 relative overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[10px] font-black text-brand-heading uppercase tracking-widest flex items-center gap-2">
                    <Gauge size={14} className="text-brand-amber animate-pulse" />
                    Flow Performance
                  </h3>
                  <Badge 
                    label={`${onlineMeters}/${activeMeters.length} ONLINE`} 
                    variant={onlineMeters < flowMeters.length ? 'warning' : 'success'} 
                  />
                </div>
                <div className="flex-1 flex flex-col justify-center space-y-6">
                  <div 
                    className="cursor-pointer group/agg"
                    onClick={() => setShowMeterAggModal(true)}
                  >
                    <div className="text-center py-4 group-hover/agg:scale-[1.02] transition-transform">
                      <p className="text-[10px] font-black text-brand-body uppercase tracking-widest mb-2">Network Flow Distribution</p>
                      <MeterVisualizer 
                        rate={flowMeters.reduce((acc, m) => acc + (m.currentFlowRate || 0), 0) / (flowMeters.length || 1)} 
                        status={onlineMeters > 0 ? 'active' : 'inactive'} 
                      />
                      <p className="text-2xl font-black text-brand-heading mt-4">
                        {activeMeters.reduce((acc, m) => acc + (m.dailyTotal || 0), 0).toLocaleString()} L
                      </p>
                      <p className="text-[9px] font-bold text-brand-body uppercase">Total Dispensed Today</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowMeterAggModal(true)}
                    className="w-full py-3 bg-brand-surface border border-brand-border rounded-[10px] text-[10px] font-black text-brand-amber uppercase tracking-widest hover:bg-brand-amber hover:text-white transition-all text-center"
                  >
                    View Detailed Meter Metrics
                  </button>
                </div>
                <div className="absolute bottom-0 right-0 p-4 opacity-[0.03] scale-150 rotate-12 pointer-events-none">
                  <Radio size={120} />
                </div>
              </div>
            )}

          </div>

          {/* Node Status Table */}
          <div className="bg-brand-card rounded-[15px] shadow-sm border border-brand-border overflow-hidden">
            <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between bg-brand-surface">
              <h3 className="text-[10px] font-black text-brand-heading uppercase tracking-widest flex items-center gap-2">
                <Target size={14} className="text-brand-blue" />
                Active Devices
              </h3>
              <Badge label={`Total: ${activeDevices.length}`} variant="neutral" />
            </div>
            <div className="overflow-x-auto">
              <TableBase headers={['Node ID', 'Type', 'Name', 'Status']} className="whitespace-nowrap">
                {activeDevices.slice(0, 2).map((node) => {
                  const type = node.currentVolume !== undefined ? 'tank' : 'meter'
                  return (
                    <tr 
                      key={node.id} 
                      className="hover:bg-black/5 transition-all border-b border-brand-border last:border-0 group cursor-pointer"
                      onClick={() => { setSelectedAsset(node); setAssetType(type); }}
                    >
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-black text-brand-heading uppercase font-mono group-hover:text-brand-blue transition-colors">{node.id}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[10px] font-bold text-brand-body uppercase">{type.toUpperCase()}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[10px] font-bold text-brand-heading">{node.name || node.serial || '—'}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[10px] font-bold text-brand-body">{formatApiDate(node.lastSyncedAt)}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusDot status={node.status === 'offline' || node.isStale ? 'offline' : 'active'} size="sm" />
                      </td>
                    </tr>
                  )
                })}
              </TableBase>
            </div>
            <div className="p-4 bg-brand-surface border-t border-brand-border">
               <button 
                 onClick={() => addToast({ title: "Opening Registry", message: "Redirecting to full hardware node registry...", type: "info" })}
                 className="w-full py-2.5 text-[10px] font-black text-brand-body uppercase tracking-widest hover:text-brand-blue transition-colors"
               >
                 View All Telemetry Nodes
               </button>
            </div>
          </div>
        </div>

        {/* Right: Incident Desk (4/12) */}
        <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-5">
          {/* Live Signal Stream */}
          {hasIncidents && (
            <div className="bg-brand-card rounded-[15px] shadow-sm border border-brand-red/20 flex flex-col overflow-hidden relative" style={{ minHeight: '280px' }}>
              <div className="absolute top-0 left-0 w-full h-[1px] bg-brand-red opacity-20"></div>
              <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between bg-brand-surface flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-brand-red rounded-[8px] flex items-center justify-center text-white shadow-lg shadow-brand-red/10">
                    <AlertTriangle size={16} className="animate-pulse" />
                  </div>
                  <h3 className="text-[10px] font-black text-brand-red uppercase tracking-widest">Active Alerts</h3>
                </div>
                <Badge label={`${generatedAlerts.length} ALARMS`} variant="danger" pulse={generatedAlerts.length > 0} />
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-brand-border bg-brand-card">
                {generatedAlerts.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="h-10 w-10 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Activity size={20} className="text-brand-green" />
                    </div>
                    <p className="text-xs font-black text-brand-heading">All nodes operational</p>
                    <p className="text-[10px] text-brand-body font-bold mt-1 uppercase tracking-widest opacity-60">No active alarms</p>
                  </div>
                ) : (
                  generatedAlerts.slice(0, 2).map((alert) => (
                    <AlertRow 
                      key={alert.id} 
                      alert={alert} 
                      onEscalate={(a) => setEscalatingAlert(a)}
                    />
                  ))
                )}
              </div>
              {generatedAlerts.length > 2 && (
                <div className="p-4 bg-brand-surface border-t border-brand-border">
                  <button 
                    onClick={() => navigate('/incidents')}
                    className="w-full py-2.5 text-[10px] font-black text-brand-red uppercase tracking-widest hover:bg-brand-red hover:text-white rounded-[8px] transition-all"
                  >
                    Manage All {generatedAlerts.length} Incidents
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Connection Pulse */}
          <div className="bg-brand-blue rounded-[15px] shadow-xl p-5 border border-brand-hover relative overflow-hidden flex-1" style={{ minHeight: '200px' }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
            <div className="relative z-10 flex flex-col h-full gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Connection Pulse</span>
                <Activity className="text-brand-green animate-pulse" size={14} />
              </div>

              <div className="flex-1 space-y-3">
                {activeDevices.slice(0, 2).map(node => (
                  <div key={node.id} className="flex items-center justify-between bg-white/10 p-2.5 rounded-[8px] border border-white/10">
                    <div>
                      <p className="text-[10px] font-black text-white uppercase">{node.name || node.serial}</p>
                      <p className="text-[8px] font-bold text-white/40">{formatApiDate(node.lastSyncedAt)}</p>
                    </div>
                    <Badge 
                      label={node.isStale || node.status === 'offline' || node.status === 'inactive' ? 'OFFLINE' : 'LIVE'} 
                      variant={node.isStale || node.status === 'offline' || node.status === 'inactive' ? 'danger' : 'success'} 
                    />
                  </div>
                ))}
                <button 
                   onClick={() => addToast({ title: "Network Status", message: "Opening network integrity report...", type: "info" })}
                   className="w-full py-2 mt-2 text-[8px] font-black text-white/40 uppercase tracking-[0.2em] border border-white/5 rounded-[8px] hover:bg-white/5 transition-all"
                >
                  View Full Network Status ({activeDevices.length} Nodes)
                </button>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-white/20">
                <Sparkline color="#10b981" />
                <div>
                  <p className="text-xs font-black text-white">UPTIME: 99.9%</p>
                  <p className="text-[10px] text-brand-blue font-bold">API: Connected</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <AssetDetailModal 
        asset={selectedAsset} 
        type={assetType} 
        onClose={() => setSelectedAsset(null)} 
      />

      <EscalationMatrixModal 
        alert={escalatingAlert} 
        onClose={() => setEscalatingAlert(null)} 
      />

      <AggregateDetailModal 
        isOpen={showTankAggModal}
        onClose={() => setShowTankAggModal(false)}
        type="tank"
        data={tanks}
      />

      <AggregateDetailModal 
        isOpen={showMeterAggModal}
        onClose={() => setShowMeterAggModal(false)}
        type="meter"
        data={flowMeters}
      />
    </div>
  )
}

export default CommandCentrePage
