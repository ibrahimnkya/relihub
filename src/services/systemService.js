import { fetchWithFallback } from './fetchWithFallback'

export const systemService = {
  // Audit Logs
  getAuditLogs: async () => {
    return fetchWithFallback('get', '/audit-logs')
  },
  
  // Data Retention
  getDataRetention: async () => {
    return fetchWithFallback('get', '/data-retention')
  },
  updateDataRetention: async (id, data) => {
    return fetchWithFallback('patch', `/data-retention/${id}`, data)
  },

  // Gateway Configs
  getGatewayConfigs: async () => {
    return fetchWithFallback('get', '/gateway-configs')
  },
  updateGatewayConfig: async (id, data) => {
    return fetchWithFallback('patch', `/gateway-configs/${id}`, data)
  },

  // Telemetry Alerts
  getTelemetryAlertConfigs: async () => {
    return fetchWithFallback('get', '/telemetry-alert-configs')
  },
  updateTelemetryAlertConfig: async (id, data) => {
    return fetchWithFallback('patch', `/telemetry-alert-configs/${id}`, data)
  },

  // Platform Configs
  getPlatformConfigs: async () => {
    return fetchWithFallback('get', '/platform-configs')
  },
  updatePlatformConfig: async (id, data) => {
    return fetchWithFallback('patch', `/platform-configs/${id}`, data)
  },

  // System Diagnostics
  getSystemStats: async () => {
    return fetchWithFallback('get', '/system/stats')
  },
  getBackups: async () => {
    return fetchWithFallback('get', '/system/backups')
  }
}
