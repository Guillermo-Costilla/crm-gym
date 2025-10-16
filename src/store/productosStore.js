import { create } from "zustand"
import api from "../config/api"

export const useProductosStore = create((set, get) => ({
  productos: [],
  loading: false,
  error: null,

  fetchProductos: async () => {
    set({ loading: true, error: null })
    try {
      const response = await api.get("/productos")
      set({ productos: response.data, loading: false })
    } catch (error) {
      set({ error: error.response?.data?.error || "Error al cargar productos", loading: false })
    }
  },

  getProductoById: async (id) => {
    try {
      const response = await api.get(`/productos/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  createProducto: async (data) => {
    try {
      const response = await api.post("/productos", data)
      await get().fetchProductos()
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "Error al crear producto" }
    }
  },

  updateProducto: async (id, data) => {
    try {
      const response = await api.put(`/productos/${id}`, data)
      await get().fetchProductos()
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "Error al actualizar producto" }
    }
  },

  deleteProducto: async (id) => {
    try {
      await api.delete(`/productos/${id}`)
      await get().fetchProductos()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "Error al eliminar producto" }
    }
  },
}))
