import { create } from "zustand"
import api from "../config/api"

export const useDashboardStore = create((set) => ({
  dashboard: null,
  loading: false,
  error: null,

  fetchDashboard: async (fecha) => {
    set({ loading: true, error: null })
    try {
      const response = await api.get(`/dashboard?fecha=${fecha}`)
      set({ dashboard: response.data, loading: false })
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.error || "Error al cargar dashboard", loading: false })
      throw error
    }
  },
}))
