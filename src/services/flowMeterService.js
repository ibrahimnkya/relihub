import { api, USE_MOCK } from './api'
import { FLOW_METERS } from '../mock/flowMeters.mock'

export const flowMeterService = {
  getFlowMeters: async () => {
    if (USE_MOCK) return { data: FLOW_METERS }
    const response = await api.get('/devices')
    return response
  },
  
  getFlowMeterById: async (id) => {
    if (USE_MOCK) return { data: FLOW_METERS.find(fm => fm.id === id) }
    const response = await api.get(`/devices/${id}/details-with-sensors`)
    return { data: response.data?.returnData?.item }
  }
}
