import { api, USE_MOCK } from './api'
import { MOCK_USERS } from '../mock/auth.mock'
import { fetchWithFallback } from './fetchWithFallback'

export const authService = {
  login: async (email, password) => {
    if (USE_MOCK) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800))
      const user = MOCK_USERS.find(u => u.email === email && u.password === password)
      if (user) {
        const { password: _, ...userWithoutPassword } = user
        return { data: { user: userWithoutPassword, token: `mock-token-${Date.now()}` } }
      }
      throw new Error('Invalid credentials')
    }
    return fetchWithFallback('post', '/auth/login', { email, password })
  },
  
  logout: async () => {
    if (USE_MOCK) return { data: { success: true } }
    return api.post('/auth/logout')
  }
}
