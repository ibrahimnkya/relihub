import { api, USE_MOCK } from './api'

export const rbacService = {
  // Roles
  getRoles: async () => {
    return api.get('/rbac/roles')
  },
  
  createRole: async (data) => {
    return api.post('/rbac/roles', data)
  },
  
  updateRole: async (id, data) => {
    return api.put(`/rbac/roles/${id}`, data)
  },
  
  assignRolePermissions: async (roleId, permissionIds) => {
    return api.post(`/rbac/roles/${roleId}/permissions`, { permission_ids: permissionIds })
  },
  
  // Permissions
  getPermissions: async () => {
    return api.get('/rbac/permissions')
  },
  
  createPermission: async (data) => {
    return api.post('/rbac/permissions', data)
  },
  
  updatePermission: async (id, data) => {
    return api.put(`/rbac/permissions/${id}`, data)
  }
}
