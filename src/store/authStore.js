import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(persist(
  (set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLocked: false,
    login: (user, token) => set({ user, token, isAuthenticated: true, isLocked: false }),
    logout: () => set({ user: null, token: null, isAuthenticated: false, isLocked: false }),
    updateUser: (userData) => set((state) => ({ 
      user: state.user ? { ...state.user, ...userData } : null 
    })),
    lock: () => set({ isLocked: true }),
    unlock: () => set({ isLocked: false }),
  }),
  { name: 'techtonics-mafuta-auth' }
))
