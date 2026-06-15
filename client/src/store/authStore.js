import { create } from 'zustand'

const TOKEN_KEY = 'nico_token'

const useAuthStore = create((set) => ({
  token: localStorage.getItem(TOKEN_KEY) || null,
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
  adminName: null,

  login: (token, name) => {
    localStorage.setItem(TOKEN_KEY, token)
    set({ token, isAuthenticated: true, adminName: name })
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ token: null, isAuthenticated: false, adminName: null })
  },
}))

export default useAuthStore
