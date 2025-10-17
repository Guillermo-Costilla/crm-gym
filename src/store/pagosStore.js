import { create } from "zustand"
import api from "../config/api"
import { sanitizePagoData } from "../utils/sanitizeData"


export const usePagosStore = create((set, get) => ({
  pagos: [],
  loading: false,
  error: null,

  fetchPagos: async () => {
    set({ loading: true, error: null })
    try {
      const response = await api.get("/pagos")
      set({ pagos: response.data, loading: false })
    } catch (error) {
      set({ error: error.response?.data?.error || "Error al cargar pagos", loading: false })
    }
  },

  getPagoById: async (id) => {
    try {
      const response = await api.get(`/pagos/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  getPagosPendientes: async () => {
    try {
      const response = await api.get("/pagos/pendientes")
      return response.data
    } catch (error) {
      throw error
    }
  },

  getPagosPorCliente: async (clienteId) => {
    try {
      const response = await api.get(`/pagos/por-cliente/${clienteId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  createPago: async (data) => {
  try {
    const payload = sanitizePagoData(data)
    const response = await api.post("/pagos", payload)
    await get().fetchPagos()
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Error al registrar pago"
    }
  }
}
,

  exportarPagos: async (mes) => {
    try {
      const response = await api.get(`/exportaciones/pagos?mes=${mes}`, {
        responseType: "blob",
      })
      // Crear un enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `pagos-${mes}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "Error al exportar pagos" }
    }
  },
}))
