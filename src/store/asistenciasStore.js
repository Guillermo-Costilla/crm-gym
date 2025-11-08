import { create } from "zustand"
import api from "../config/api"

export const useAsistenciasStore = create((set) => ({
  asistencias: [],
  loading: false,
  error: null,

  registrarAsistencia: async (asistencia) => {
    try {
      const response = await api.post("/asistencias/registro", asistencia )
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "Error al registrar asistencia" }
    }
  },

  getAsistenciasPorDia: async (fecha) => {
    set({ loading: true, error: null })
    try {
      const response = await api.get(`/asistencias/por-dia?fecha=${fecha}`)
      set({ asistencias: response.data, loading: false })
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.error || "Error al cargar asistencias", loading: false })
      throw error
    }
  },

  getAsistenciasPorCliente: async (clienteId) => {
    try {
      const response = await api.get(`/asistencias/por-cliente/${clienteId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  getAsistenciasPorRango: async (desde, hasta) => {
    try {
      const response = await api.get(`/asistencias/por-rango?desde=${desde}&hasta=${hasta}`)
      return response.data
    } catch (error) {
      throw error
    }
  },
}))
