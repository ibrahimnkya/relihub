import { useMemo, useState, useEffect } from 'react'
import { useIncidents } from './useIncidents'
import { jobService } from '../services/jobService'

export const useJobs = () => {
  const { incidents, loading: incidentsLoading, error: incidentsError } = useIncidents()
  const [apiJobs, setApiJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const res = await jobService.getJobs()
        setApiJobs(res.data || [])
      } catch (err) {
        console.error('Failed to fetch real jobs:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const mergedJobs = useMemo(() => {
    // 1. Start with real API jobs
    const items = [...apiJobs]
    
    // 2. Add derived jobs from active incidents if not already covered
    incidents.forEach(inc => {
      const jobId = inc.id.replace('INC', 'JOB').replace('LIVE', 'JOB-LIVE')
      if (!items.find(j => j.id === jobId || j.incidentId === inc.id)) {
        items.push({
          id: jobId,
          title: inc.type.includes('volume') ? `Reorder & Inspection: ${inc.assetName}` : `Hardware Repair: ${inc.message}`,
          asset: inc.assetId,
          site: inc.assetName,
          assignedTo: inc.status === 'under_investigation' ? 'Field Engineer 01' : 'Unassigned',
          status: inc.status === 'under_investigation' ? 'In Progress' : 'Pending',
          priority: inc.severity.charAt(0).toUpperCase() + inc.severity.slice(1),
          dueDate: inc.createdAt,
          incidentId: inc.id,
          isLiveSignal: inc.isLiveSignal
        })
      }
    })

    return items
  }, [apiJobs, incidents])

  return { 
    jobs: mergedJobs, 
    loading: loading || incidentsLoading, 
    error: error || incidentsError 
  }
}
