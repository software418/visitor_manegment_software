import { create } from 'zustand'

const getInitialTheme = () => {
  const stored = localStorage.getItem('wearweb_theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const useUIStore = create((set, get) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    localStorage.setItem('wearweb_theme', theme)
    set({ theme })
  },
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('wearweb_theme', next)
    set({ theme: next })
  },
}))
export default useUIStore