import { api, USE_MOCK } from './api'

export const userService = {
  getUsers: async (perPage = 20) => {
    return api.get(`/rbac/users?per_page=${perPage}`)
  },
  
  iformAction: async (data) => {
    return api.post('/users/iformAction', data)
  },
  
  createUser: async (data) => {
    return api.post('/users', data)
  },
  
  assignUserRoles: async (userId, roleIds) => {
    return api.post(`/rbac/users/${userId}/roles`, { role_ids: roleIds })
  }
}
