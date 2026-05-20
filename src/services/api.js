import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// Default to false to use live API, set VITE_USE_MOCK='true' explicitly to enable mocks
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://mafuta.mysafari.co.tz/api',
  timeout: 10000,
})

export const fallbackApi = axios.create({
  baseURL: import.meta.env.VITE_FALLBACK_API_URL || 'http://localhost:3060/api',
  timeout: 5000,
})

const authInterceptor = (config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}

api.interceptors.request.use(authInterceptor)
fallbackApi.interceptors.request.use(authInterceptor)

export { USE_MOCK }
