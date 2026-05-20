import { USE_MOCK } from './api'
import { fetchWithFallback } from './fetchWithFallback'
import { INCIDENTS, ALERTS } from '../mock/incidents.mock'

export const incidentService = {
  getIncidents: async () => {
    if (USE_MOCK) return { data: INCIDENTS }
    return fetchWithFallback('get', '/incidents')
  },
  
  getAlerts: async () => {
    if (USE_MOCK) return { data: ALERTS }
    return fetchWithFallback('get', '/alerts')
  },
  
  acknowledgeAlert: async (id) => {
    if (USE_MOCK) {
      console.log(`[MOCK] Alert ${id} acknowledged`)
      return { data: { success: true } }
    }
    return api.post(`/alerts/${id}/acknowledge`)
  },
  
  assignIncident: async (id, userId) => {
    if (USE_MOCK) {
      console.log(`[MOCK] Incident ${id} assigned to ${userId}`)
      return { data: { success: true } }
    }
    return api.post(`/incidents/${id}/assign`, { userId })
  }
}
