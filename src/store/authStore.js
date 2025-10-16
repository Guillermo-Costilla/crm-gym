import { create } from "zustand"
import api from "../config/api"

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
  isInitialized: false,

  initialize: async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      set({ isInitialized: true })
      return
    }

    try {
      // Verificar que el token sea válido haciendo una petición al dashboard
      const response = await api.get("/dashboard")
      // Si la petición es exitosa, el token es válido
      set({ isInitialized: true })
    } catch (error) {
      // Si falla, limpiar el token
      localStorage.removeItem("token")
      set({ token: null, user: null, isInitialized: true })
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const response = await api.post("/usuarios/login", { email, password })
      const { token, usuario } = response.data

      localStorage.setItem("token", token)
      set({ token, user: usuario, loading: false })
      return { success: true }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Error al iniciar sesión"
      set({ error: errorMsg, loading: false })
      return { success: false, error: errorMsg }
    }
  },

  register: async (nombre, email, password, rol = "staff") => {
    set({ loading: true, error: null })
    try {
      const response = await api.post("/usuarios/registro", { nombre, email, password, rol })
      const { token, usuario } = response.data

      localStorage.setItem("token", token)
      set({ token, user: usuario, loading: false })
      return { success: true }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Error al registrarse"
      set({ error: errorMsg, loading: false })
      return { success: false, error: errorMsg }
    }
  },

  logout: () => {
    localStorage.removeItem("token")
    set({ user: null, token: null })
  },

  clearError: () => set({ error: null }),
}))
