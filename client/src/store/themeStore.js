// Zustand store for theme
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark', // 'dark' | 'light'

      initTheme: () => {
        const stored = get().theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const theme = stored || (prefersDark ? 'dark' : 'light')
        set({ theme })
        applyTheme(theme)
      },

      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark'
        set({ theme: newTheme })
        applyTheme(newTheme)
      },

      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },
    }),
    {
      name: 'pulsefit-theme',
    }
  )
)

function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

