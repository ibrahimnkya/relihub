import { api, USE_MOCK } from './api'
import { TANKS } from '../mock/tanks.mock'

export const tankService = {
  getTanks: async () => {
    if (USE_MOCK) return { data: TANKS }
    const response = await api.get('/devices')
    return response
  },

  getTankById: async (id) => {
    if (USE_MOCK) return { data: TANKS.find(t => t.id === id) }
    const response = await api.get(`/devices/${id}/details-with-sensors`)
    return { data: response.data?.returnData?.item }
  }
}
