import { useMemo, useState, useEffect } from 'react'
import { useDeviceData } from './useDeviceData'
import { incidentService } from '../services/incidentService'

export const useIncidents = () => {
  const { tanks, flowMeters, device, loading: deviceLoading, error: deviceError } = useDeviceData()
  const [apiIncidents, setApiIncidents] = useState([])
  const [apiAlerts, setApiAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true)
        const [incRes, alertRes] = await Promise.all([
          incidentService.getIncidents(),
          incidentService.getAlerts()
        ])
        setApiIncidents(incRes.data || [])
        setApiAlerts(alertRes.data || [])
      } catch (err) {
        console.error('Failed to fetch real incidents:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchIncidents()
  }, [])

  const allIncidents = useMemo(() => {
    // 1. Start with real API incidents
    const items = [...apiIncidents]
    
    // 2. Add live telemetry-derived incidents if not already covered
    if (tanks && flowMeters) {
      // Offline / stale tanks
      tanks.filter(t => t.isStale).forEach(tank => {
        if (!items.find(i => i.assetId === tank.id && i.type === 'hardware_offline')) {
          items.push({
            id: `LIVE-TK-${tank.sensorId}`,
            type: 'hardware_offline',
            assetId: tank.id,
            assetName: tank.name,
            severity: 'critical',
            status: 'open',
            message: `Live Signal: Tank "${tank.name}" hardware is offline`,
            createdAt: tank.lastReadingAt,
            isLiveSignal: true
          })
        }
      })

      // Critical volume tanks
      tanks.filter(t => !t.isStale && t.fillPct <= (t.criticalThreshold || 10)).forEach(tank => {
        if (!items.find(i => i.assetId === tank.id && i.type === 'volume_critical')) {
          items.push({
            id: `LIVE-VOL-CRIT-${tank.sensorId}`,
            type: 'volume_critical',
            assetId: tank.id,
            assetName: tank.name,
            severity: 'critical',
            status: 'under_investigation',
            message: `Live Signal: Tank "${tank.name}" is critically low (${tank.fillPct}%)`,
            createdAt: tank.lastReadingAt,
            isLiveSignal: true
          })
        }
      })

      // Inactive meters
      flowMeters.filter(m => m.status !== 'active').forEach(meter => {
        if (!items.find(i => i.assetId === meter.id)) {
          items.push({
            id: `LIVE-FM-${meter.sensorId}`,
            type: 'meter_inactive',
            assetId: meter.id,
            assetName: meter.serial,
            severity: 'high',
            status: 'open',
            message: `Live Signal: Flow meter "${meter.serial}" is not active`,
            createdAt: meter.lastReadingAt,
            isLiveSignal: true
          })
        }
      })
    }

    return items
  }, [apiIncidents, tanks, flowMeters])

  return { 
    incidents: allIncidents, 
    alerts: apiAlerts,
    loading: loading || deviceLoading, 
    error: error || deviceError 
  }
}
