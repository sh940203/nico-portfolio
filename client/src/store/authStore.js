import { create } from 'zustand'

const TOKEN_KEY = 'nico_token'

function safeStorage(fn, fallback = null) {
  try { return fn() } catch { return fallback }
}

const useAuthStore = create((set) => ({
  token: safeStorage(() => localStorage.getItem(TOKEN_KEY)),
  isAuthenticated: !!safeStorage(() => localStorage.getItem(TOKEN_KEY)),
  adminName: null,

  login: (token, name) => {
    safeStorage(() => localStorage.setItem(TOKEN_KEY, token))
    set({ token, isAuthenticated: true, adminName: name })
  },

  logout: () => {
    safeStorage(() => localStorage.removeItem(TOKEN_KEY))
    set({ token: null, isAuthenticated: false, adminName: null })
  },
}))

export default useAuthStore
