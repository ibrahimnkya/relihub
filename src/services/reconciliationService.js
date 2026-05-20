import { api, USE_MOCK } from './api'
import { RECONCILIATION_SUMMARY } from '../mock/reconciliation.mock'

export const reconciliationService = {
  getSummary: async (period = 'today') => {
    if (USE_MOCK) return { data: RECONCILIATION_SUMMARY }
    return api.get(`/reconciliation/summary?period=${period}`)
  },
  
  submitPeriod: async (period = 'today') => {
    if (USE_MOCK) {
      console.log(`[MOCK] Period ${period} submitted for reconciliation`)
      return { data: { success: true } }
    }
    return api.post(`/reconciliation/submit`, { period })
  }
}
