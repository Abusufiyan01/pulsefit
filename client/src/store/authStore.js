// Zustand store for auth state
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          const user = data.data?.user || data.user
          set({ user, isAuthenticated: !!user, isLoading: false })
          return data
        } catch (err) {
          const message = err.response?.data?.message || 'Login failed'
          set({ error: message, isLoading: false })
          throw new Error(message)
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/auth/register', userData)
          const user = data.data?.user || data.user
          set({ user, isAuthenticated: !!user, isLoading: false })
          return data
        } catch (err) {
          const message = err.response?.data?.message || 'Registration failed'
          set({ error: message, isLoading: false })
          throw new Error(message)
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout')
        } catch {}
        set({ user: null, isAuthenticated: false })
      },

      fetchMe: async () => {
        set({ isLoading: true })
        try {
          const { data } = await api.get('/auth/me')
          const user = data.data?.user || data.user
          set({ user, isAuthenticated: !!user, isLoading: false })
          return user
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false })
          return null
        }
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }))
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'pulsefit-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
