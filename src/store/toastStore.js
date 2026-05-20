import { create } from 'zustand'

export const useToast = create((set) => ({
  toasts: [],
  addToast: (toast) => 
    set((state) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      const newToast = { id, type: 'info', duration: 4000, ...toast }
      
      // Auto dismiss
      if (newToast.duration > 0) {
        setTimeout(() => {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id)
          }))
        }, newToast.duration)
      }

      return { toasts: [...state.toasts, newToast] }
    }),
  removeToast: (id) => 
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    })),
}))
