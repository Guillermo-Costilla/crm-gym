import { create } from "zustand"
import api from "../config/api"

export const useVentasStore = create((set, get) => ({
  ventas: [],
  loading: false,
  error: null,

  fetchVentas: async () => {
    set({ loading: true, error: null })
    try {
      const response = await api.get("/ventas")
      set({ ventas: response.data, loading: false })
    } catch (error) {
      set({ error: error.response?.data?.error || "Error al cargar ventas", loading: false })
    }
  },

  getVentaById: async (id) => {
    try {
      const response = await api.get(`/ventas/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  getVentasPorCliente: async (clienteId) => {
    try {
      const response = await api.get(`/ventas/por-cliente/${clienteId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  getVentasPorDia: async (fecha) => {
    try {
      const response = await api.get(`/ventas/por-dia?fecha=${fecha}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  getIngresosPorDia: async (fecha) => {
    try {
      const response = await api.get(`/ventas/ingresos?fecha=${fecha}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  getIngresosPorMes: async (mes) => {
    try {
      const response = await api.get(`/ventas/ingresos?mes=${mes}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  getResumenVentas: async (periodo = "mensual") => {
    try {
      const response = await api.get(`/ventas/resumen?periodo=${periodo}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  createVenta: async (data) => {
    try {
      const response = await api.post("/ventas", data)
      await get().fetchVentas()
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "Error al crear venta" }
    }
  },

  exportarVentas: async (mes) => {
    try {
      const response = await api.get(`/exportaciones/ventas?mes=${mes}`, {
        responseType: "blob",
      })
      // Crear un enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `ventas-${mes}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "Error al exportar ventas" }
    }
  },
}))
