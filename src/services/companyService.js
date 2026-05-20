import { api } from './api'
import { fetchWithFallback } from './fetchWithFallback'

export const companyService = {
  getCompanies: async () => {
    return fetchWithFallback('get', '/companies')
  },
  
  getCompany: async (id) => {
    return fetchWithFallback('get', `/companies/${id}`)
  },
  
  createCompany: async (data) => {
    return fetchWithFallback('post', '/companies', data)
  },

  provisionOrganization: async (data) => {
    return fetchWithFallback('post', '/provision-organization', data)
  },
  
  updateCompany: async (id, data) => {
    return fetchWithFallback('put', `/companies/${id}`, data)
  },
  
  deleteCompany: async (id) => {
    return fetchWithFallback('delete', `/companies/${id}`)
  },

  getCompanyLogs: async (id) => {
    return api.get(`/companies/${id}/logs`)
  },

  getBranches: async (companyId) => {
    return fetchWithFallback('get', `/companies/${companyId}/branches`)
  },

  createBranch: async (companyId, data) => {
    return fetchWithFallback('post', `/branches`, { ...data, company_id: companyId })
  },

  updateBranch: async (branchId, data) => {
    return fetchWithFallback('patch', `/branches/${branchId}`, data)
  },

  deleteBranch: async (branchId) => {
    return fetchWithFallback('delete', `/branches/${branchId}`)
  },

  assignUserToBranch: async (branchId, userId) => {
    // In a real app this might use a specific endpoint, but for now we patch the user
    return fetchWithFallback('patch', `/users/${userId}`, { branch_id: branchId })
  }
}
