import { create } from "zustand";
import api from "../config/api";
import { sanitizeClienteData } from "@/utils/sanitizeData"


export const useClientesStore = create((set, get) => ({
  clientes: [],
  loading: false,
  error: null,

  fetchClientes: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/clientes");
      set({ clientes: response.data, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.error || "Error al cargar clientes",
        loading: false,
      });
    }
  },

  getClienteById: async (id) => {
    try {
      const response = await api.get(`/clientes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createCliente: async (data) => {
  try {
    const payload = sanitizeClienteData(data)
    const response = await api.post("/clientes", payload)
    await get().fetchClientes()
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Error al crear cliente"
    }
  }
},
  updateCliente: async (id, data) => {
    try {
      const response = await api.put(`/clientes/${id}`, data);
      await get().fetchClientes();
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Error al actualizar cliente",
      };
    }
  },

  deleteCliente: async (id) => {
    try {
      await api.delete(`/clientes/${id}`);
      await get().fetchClientes();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Error al eliminar cliente",
      };
    }
  },

  getClientesActivos: async () => {
    try {
      const response = await api.get("/clientes/metricas/activos");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getNuevosClientes: async () => {
    try {
      const response = await api.get("/clientes/metricas/nuevos");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getFrecuenciaCliente: async (id) => {
    try {
      const response = await api.get(`/clientes/metricas/frecuencia/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
}));
