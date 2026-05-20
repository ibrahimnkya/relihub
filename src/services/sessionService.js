import { api, USE_MOCK } from './api'
import { FUELING_SESSIONS } from '../mock/fuelingSessions.mock'

export const sessionService = {
  getSessions: async () => {
    if (USE_MOCK) return { data: FUELING_SESSIONS }
    return api.get('/fueling-sessions')
  },
  
  getSessionById: async (id) => {
    if (USE_MOCK) return { data: FUELING_SESSIONS.find(s => s.id === id) }
    return api.get(`/fueling-sessions/${id}`)
  },
  
  overrideSession: async (id, status, notes) => {
    if (USE_MOCK) {
      console.log(`[MOCK] Session ${id} overridden to ${status} with notes: ${notes}`)
      return { data: { success: true } }
    }
    return api.post(`/fueling-sessions/${id}/override`, { status, notes })
  }
}
