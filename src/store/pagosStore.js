import { create } from "zustand";
import api from "../config/api";
import { sanitizePagoData } from "../utils/sanitizeData";

export const usePagosStore = create((set, get) => ({
  pagos: [],
  loading: false,
  error: null,

  fetchPagos: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/pagos");
      set({ pagos: response.data, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.error || "Error al cargar pagos",
        loading: false,
      });
    }
  },

  getPagoById: async (id) => {
    try {
      const response = await api.get(`/pagos/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  marcarComoPagado: async (id) => {
    try {
      await api.put(`/pagos/${id}`, { pagado: 1 });
      await get().fetchPagos();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Error al marcar como pagado",
      };
    }
  },

  calcularProximoVencimiento: (fechaRegistro, tipo) => {
    const hoy = new Date();
    const base = new Date(fechaRegistro);

    if (isNaN(base.getTime())) return null; // 👈 blindaje

    while (base <= hoy) {
      base.setMonth(base.getMonth() + (tipo === "Mensual" ? 1 : 12));
    }

    return base;
  },
  yaPagoEnPeriodo: (clienteId, tipo, fechaVencimiento) => {
    const pagos = get().pagos;
    const desde = new Date(fechaVencimiento);
    desde.setMonth(desde.getMonth() - (tipo === "Mensual" ? 1 : 12));

    return pagos.some(
      (p) =>
        p.cliente_id === clienteId &&
        p.pagado &&
        new Date(p.fecha_pago) >= desde &&
        new Date(p.fecha_pago) < fechaVencimiento
    );
  },

  getEstadoPagoCliente: (cliente) => {
  const hoy = new Date()
  const registro = new Date(cliente.fecha_registro)
  const vencimiento = new Date(registro)

  vencimiento.setMonth(vencimiento.getMonth() + (cliente.tipo === "Mensual" ? 1 : 12))

  const dias = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24))

  const pagoRealizado = get().pagos.some(
    (p) =>
      p.cliente_id === cliente.id &&
      p.pagado &&
      new Date(p.fecha_pago) >= registro &&
      new Date(p.fecha_pago) < vencimiento
  )

  if (pagoRealizado) return { estado: "Al día", color: "green", dias: 0 }
  if (dias < 0) return { estado: "Vencido", color: "red", dias: Math.abs(dias) }
  return { estado: "Por vencer", color: "yellow", dias }
}
,

  getTotalPagosDelMes: (
    mes = new Date().getMonth(),
    año = new Date().getFullYear()
  ) => {
    const pagos = get().pagos;
    return pagos
      .filter((pago) => {
        const fecha = new Date(pago.fecha_pago);
        return (
          fecha.getMonth() === mes &&
          fecha.getFullYear() === año &&
          pago.pagado === 1
        );
      })
      .reduce((total, pago) => total + pago.monto, 0);
  },
  getPagosPendientes: async () => {
    try {
      const response = await api.get("/pagos/pendientes");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPagosVencidos: async () => {
    try {
      const response = await api.get("/pagos/vencidos");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPagosProximos: async (dias = 7) => {
    try {
      const response = await api.get(`/pagos/proximos?dias=${dias}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPagosPorCliente: async (clienteId) => {
    try {
      const response = await api.get(`/pagos/por-cliente/${clienteId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createPago: async (data) => {
    try {
      const payload = sanitizePagoData(data);
      console.log("🧾 Payload:", payload);
      const response = await api.post("/pagos", payload);
      await get().fetchPagos();
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Error al registrar pago",
      };
    }
  },
  exportarPagos: async (mes) => {
    try {
      const response = await api.get(`/exportaciones/pagos?mes=${mes}`, {
        responseType: "blob",
      });
      // Crear un enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `pagos-${mes}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Error al exportar pagos",
      };
    }
  },
}));
