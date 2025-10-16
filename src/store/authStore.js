import { create } from "zustand"
import api from "../config/api"

// Restaurar user desde localStorage si existe
const storedUser = (() => {
  try {
    const u = localStorage.getItem("user")
    return u ? JSON.parse(u) : null
  } catch (e) {
    return null
  }
})()

export const useAuthStore = create((set) => ({
  user: storedUser,
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

    // Si ya tenemos el usuario en localStorage, restaurarlo y evitar petición inmediata
    if (storedUser) {
      set({ user: storedUser, isInitialized: true })
      return
    }

    try {
      // Verificar que el token sea válido haciendo una petición al dashboard
      await api.get("/dashboard")
      set({ isInitialized: true })
    } catch (error) {
      // Si falla, limpiar el token y user
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      set({ token: null, user: null, isInitialized: true })
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const response = await api.post("/usuarios/login", { email, password })
      const { token, usuario } = response.data

      localStorage.setItem("token", token)
      try {
        localStorage.setItem("user", JSON.stringify(usuario))
      } catch (e) {
        // si falla el stringify, continuar sin bloquear
      }
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
      try {
        localStorage.setItem("user", JSON.stringify(usuario))
      } catch (e) {}
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
    localStorage.removeItem("user")
    set({ user: null, token: null })
  },

  clearError: () => set({ error: null }),
}))
