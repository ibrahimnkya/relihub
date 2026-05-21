import { create } from 'zustand'
import { systemService } from '../services/systemService'

export const useAppStore = create((set, get) => ({
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  platformModules: [],
  
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
  
  setPlatformModules: (modules) => set({ platformModules: modules }),
  
  fetchPlatformSettings: async () => {
    try {
      const res = await systemService.getPlatformConfigs()
      const matrix = res.data?.find(cfg => cfg.key === 'module_matrix')
      if (matrix && matrix.value) {
        const parsed = typeof matrix.value === 'string' ? JSON.parse(matrix.value) : matrix.value
        set({ platformModules: parsed })
      }
    } catch (err) {
      console.error('Failed to fetch platform settings:', err)
    }
  },

  isModuleGloballyEnabled: (moduleId) => {
    const modules = get().platformModules
    if (!modules || modules.length === 0) return true // Default to true if not loaded
    const mod = modules.find(m => m.id.toLowerCase() === moduleId.toLowerCase())
    return mod ? mod.status === 'Operational' : true
  }
}))
