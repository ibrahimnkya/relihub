import { USE_MOCK } from './api'
import { fetchWithFallback } from './fetchWithFallback'
import { JOBS } from '../mock/jobs.mock'

export const jobService = {
  getJobs: async () => {
    if (USE_MOCK) return { data: JOBS }
    return fetchWithFallback('get', '/jobs')
  },
  
  updateJobStatus: async (id, status) => {
    if (USE_MOCK) {
      console.log(`[MOCK] Job ${id} status updated to ${status}`)
      return { data: { success: true } }
    }
    return api.patch(`/jobs/${id}`, { status })
  }
}
