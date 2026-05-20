import { api, USE_MOCK } from './api'

export const syncService = {
  syncDevicesAndSensors: async (data = {}) => {
    // data: { form_method: 'save', name, email, phone, password }
    return api.post('/sync/devices-sensors', data)
  }
}
