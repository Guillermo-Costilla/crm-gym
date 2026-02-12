import { create } from "zustand";
import api from "../config/api";
import { sanitizePagoData } from "../utils/sanitizeData";
import { parseISODate } from "../utils/dateUtils";

function parseFechaRegistro(fechaNumeric) {
  if (!fechaNumeric) return null;

  const fechaStr = fechaNumeric.toString();
  if (fechaStr.length !== 8) return null;

  const year = fechaStr.slice(0, 4);
  const month = fechaStr.slice(4, 6);
  const day = fechaStr.slice(6, 8);

  return new Date(`${year}-${month}-${day}`);
}


export const usePagosStore = create((set, get) => ({
  pagos: [],
  loading: false,
  error: null,

  /* =======================
     FETCH
  ======================= */

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
    const response = await api.get(`/pagos/${id}`);
    return response.data;
  },

  /* =======================
     HELPERS CLAVE
  ======================= */

  getUltimoPagoCliente: (clienteId) => {
  const pagos = get().pagos
    .filter(p => p.cliente_id === clienteId && p.pagado)
    .sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago));

  return pagos[0] || null;
},

  calcularVencimiento: (fechaBase, tipo) => {
    const vencimiento = new Date(fechaBase);
    if (isNaN(vencimiento.getTime())) return null;

    vencimiento.setMonth(
      vencimiento.getMonth() + (tipo === "Mensual" ? 1 : 12)
    );

    return vencimiento;
  },

  /* =======================
     ESTADO DE PAGO (CORE)
  ======================= */

  getEstadoPagoCliente: (cliente) => {
  if (!cliente?.fecha_registro) {
    return { estado: "Sin datos", color: "gray", dias: 0 };
  }

  const hoy = new Date();
  const registro = new Date(cliente.fecha_registro);

  const ultimoPago = get().getUltimoPagoCliente(cliente.id);

  if (!ultimoPago) {
    return { estado: "Vencido", color: "red", dias: 0 };
  }

  const vencimiento = new Date(ultimoPago.fecha_pago);
  vencimiento.setMonth(
    vencimiento.getMonth() + (ultimoPago.tipo === "Mensual" ? 1 : 12)
  );

  const dias = Math.ceil(
    (vencimiento - hoy) / (1000 * 60 * 60 * 24)
  );

  if (dias < 0)
    return { estado: "Vencido", color: "red", dias: Math.abs(dias) };

  if (dias <= 7)
    return { estado: "Por vencer", color: "yellow", dias };

  return { estado: "Al día", color: "green", dias };
},

  /* =======================
     ACCIONES
  ======================= */

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

  createPago: async (data) => {
    try {
      const payload = sanitizePagoData(data);
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

  /* =======================
     MÉTRICAS
  ======================= */

  getTotalPagosDelMes: (
    mes = new Date().getMonth(),
    año = new Date().getFullYear()
  ) => {
    return get()
      .pagos
      .filter(p => {
        const fecha = new Date(p.fecha_pago);
        return (
          fecha.getMonth() === mes &&
          fecha.getFullYear() === año &&
          p.pagado === 1
        );
      })
      .reduce((total, p) => total + p.monto, 0);
  },

  /* =======================
     REPORTES (API)
  ======================= */

  getPagosPendientes: async () => {
    const response = await api.get("/pagos/pendientes");
    return response.data;
  },

  getPagosVencidos: async () => {
    const response = await api.get("/pagos/vencidos");
    return response.data;
  },

  getPagosProximos: async (dias = 7) => {
    const response = await api.get(`/pagos/proximos?dias=${dias}`);
    return response.data;
  },

  getPagosPorCliente: async (clienteId) => {
    const response = await api.get(`/pagos/por-cliente/${clienteId}`);
    return response.data;
  },

  /* =======================
     EXPORTACIÓN
  ======================= */

  exportarPagos: async (mes) => {
    try {
      const response = await api.get(
        `/exportaciones/pagos?mes=${mes}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );
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
