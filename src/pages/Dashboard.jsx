import { useEffect, useState } from "react";
import { useClientesStore } from "../store/clientesStore";
import { useDashboardStore } from "../store/dashboardStore";
import { usePagosStore } from "../store/pagosStore";
import { useVentasStore } from "../store/ventasStore";
import { useAsistenciasStore } from "../store/asistenciasStore";
import { format, subDays, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import Card from "../components/Card";
import GraficoBar from "../components/GraficoBar";
import GraficoLinea from "../components/GraficoLinea";
import GraficoPie from "../components/GraficoPie";
import {
  DollarSign,
  Users,
  RefreshCw,
  TrendingUp,
  Activity,
} from "lucide-react";

export default function Dashboard() {
  const { clientes, fetchClientes } = useClientesStore();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        await Promise.all([
          fetchDashboard(fechaHoy),
          fetchPagos(),
          fetchVentas(),
          getAsistenciasPorDia(fechaHoy),
          fetchClientes(), // 👈 nuevo
        ]);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const fechaHoy = format(new Date(), "yyyy-MM-dd");

  const { dashboard, fetchDashboard } = useDashboardStore();
  const { pagos, fetchPagos, getTotalPagosDelMes } = usePagosStore();
  const { ventas, fetchVentas } = useVentasStore();
  const { asistencias, getAsistenciasPorDia } = useAsistenciasStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        await Promise.all([
          fetchDashboard(fechaHoy),
          fetchPagos(),
          fetchVentas(),
          getAsistenciasPorDia(fechaHoy),
          fetchClientes(),
        ]);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const ingresosPagos = getTotalPagosDelMes();
  const ingresosVentas = ventas.reduce((acc, v) => acc + (v.total || 0), 0);
  const ingresosMes = ingresosPagos + ingresosVentas;

  const nuevosClientes =
    dashboard?.nuevos_clientes_mes?.reduce(
      (acc, item) => acc + item.nuevos,
      0
    ) || 0;

  const asistenciasHoy = dashboard?.asistencias_hoy?.length || 0;
  const ventasHoy = dashboard?.ventas_hoy || 0;
  const ingresosHoy = dashboard?.ingresos_hoy || 0;
  const concurrenciaActual = dashboard?.concurrencia_actual || 0;

  const clientesConPago = pagos
    .filter((p) => p.pagado)
    .map((p) => p.cliente_id);
  const clientesConAsistencia = asistencias.map((a) => a.cliente_id);
  const retencion = clientesConPago.filter((id) =>
    clientesConAsistencia.includes(id)
  ).length;
  const retencionPorcentaje =
    clientesConPago.length > 0
      ? ((retencion / clientesConPago.length) * 100).toFixed(1)
      : "0";

  const clientesActivos = dashboard?.clientes_activos || 0;

  const dias = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
  const ingresosPorDia = dias.map((dia) => {
    const fecha = format(dia, "yyyy-MM-dd");
    const ventasDelDia = ventas
      .filter((v) => v.fecha === fecha)
      .reduce((acc, v) => acc + v.total, 0);
    const pagosDelDia = pagos
      .filter((p) => p.pagado && p.fecha_pago?.startsWith(fecha))
      .reduce((acc, p) => acc + p.monto, 0);
    return {
      fecha: format(dia, "dd/MM", { locale: es }),
      ingresos: ventasDelDia + pagosDelDia,
    };
  });

  const asistenciasPorHora = Array.from({ length: 12 }, (_, i) => {
    const hora = i + 8;
    const count = asistencias.filter((a) => {
      const h = new Date(a.hora_ingreso).getHours();
      return h === hora;
    }).length;
    return {
      hora: `${hora}:00`,
      asistencias: count,
    };
  });

  const nuevosClientesData =
    dashboard?.nuevos_clientes_mes?.map((item) => ({
      mes: format(new Date(item.mes + "-01"), "MMM", { locale: es }),
      clientes: item.nuevos,
    })) || [];

  const productosTopData = dashboard?.producto_top
    ? [
        {
          name: dashboard.producto_top.nombre,
          value: dashboard.producto_top.total,
        },
        {
          name: "Otros",
          value: Math.max(
            0,
            dashboard.ventas_hoy - dashboard.producto_top.total
          ),
        },
      ]
    : [];

  const clientesSinPago = [
    ...new Set(
      asistencias
        .filter(
          (a) => !pagos.some((p) => p.cliente_id === a.cliente_id && p.pagado)
        )
        .map((a) => a.cliente_id)
    ),
  ];

  const vencidos = [
    ...new Set(
      pagos
        .filter((p) => {
          const vencimiento = new Date(p.fecha_pago);
          vencimiento.setMonth(
            vencimiento.getMonth() + (p.tipo === "Mensual" ? 1 : 12)
          );
          return p.pagado && vencimiento < new Date();
        })
        .map((p) => p.cliente_id)
    ),
  ];

  const inactivos = asistencias.reduce((acc, a) => {
    const clienteId = a.cliente_id;
    const fecha = new Date(a.hora_ingreso);
    if (!acc[clienteId] || fecha > acc[clienteId]) acc[clienteId] = fecha;
    return acc;
  }, {});
  const clientesInactivos = Object.entries(inactivos)
    .filter(([_, fecha]) => differenceInDays(new Date(), fecha) > 30)
    .map(([id]) => parseInt(id));

  const asistenciasPorCliente = asistencias.reduce((acc, a) => {
    const id = a.cliente_id;
    if (!acc[id]) acc[id] = [];
    acc[id].push(a);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  console.log("📦 Clientes cargados:", clientes);
  console.log("📦 Asistencias cargadas:", asistencias);

  const clientesConAsistencias = clientes
    .map((cliente) => {
      const asistenciasCliente = asistencias.filter(
        (a) => a.cliente_id === cliente.id
      );
      if (asistenciasCliente.length === 0) return null;

      const ultima = asistenciasCliente.reduce((max, a) =>
        new Date(a.hora_ingreso) > new Date(max.hora_ingreso || 0) ? a : max
      );
      const fechaValida =
        ultima?.hora_ingreso && !isNaN(new Date(ultima.hora_ingreso));
      const fechaFormateada = fechaValida
        ? format(new Date(ultima.hora_ingreso), "dd/MM/yyyy HH:mm")
        : "-";

      console.log("🧩 Cliente:", cliente.nombre, "| ID:", cliente.id);
      console.log("📊 Asistencias:", asistenciasCliente.length);
      console.log("📆 Última asistencia:", fechaFormateada);

      return {
        id: cliente.id,
        nombre: cliente.nombre,
        asistencias: asistenciasCliente.length,
        ultima: fechaFormateada,
      };
    })
    .filter(Boolean); // elimina los null

  console.log("✅ Clientes con asistencias:", clientesConAsistencias);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      <p className="text-muted-foreground mb-4">
        Resumen estratégico del gimnasio
      </p>

      {/* 🔷 Resumen mensual */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Ingresos del Mes"
          value={`$${ingresosMes.toLocaleString()}`}
          icon={<DollarSign />}
          color="green"
        />
        <Card
          title="Nuevos Clientes"
          value={nuevosClientes}
          icon={<Users />}
          color="blue"
        />
        <Card
          title="Retención"
          value={`${retencionPorcentaje}%`}
          icon={<RefreshCw />}
          color="yellow"
        />
        <Card
          title="Clientes Activos"
          value={clientesActivos}
          icon={<Users />}
          color="purple"
        />
      </div>

      {/* 🔷 Actividad del día */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Asistencias Hoy"
          value={asistenciasHoy}
          icon={<Activity />}
          color="cyan"
        />
        <Card
          title="Ventas Hoy"
          value={ventasHoy}
          icon={<TrendingUp />}
          color="purple"
        />
        <Card
          title="Ingresos Hoy"
          value={`$${ingresosHoy.toLocaleString()}`}
          icon={<DollarSign />}
          color="green"
        />
        <Card
          title="Concurrencia Actual"
          value={concurrenciaActual}
          icon={<Users />}
          color="red"
        />
      </div>

      {/* 📊 Gráficos clave */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GraficoBar
          titulo="Ingresos últimos 7 días"
          data={ingresosPorDia}
          dataKey="ingresos"
          color="#10b981"
        />
        <GraficoBar
          titulo="Asistencias por hora (hoy)"
          data={asistenciasPorHora}
          dataKey="asistencias"
          color="#06b6d4"
        />
        <GraficoLinea
          titulo="Nuevos clientes por mes"
          data={nuevosClientesData}
          dataKey="clientes"
          color="#3b82f6"
        />
        {productosTopData.length > 0 && (
          <GraficoPie titulo="Producto más vendido" data={productosTopData} />
        )}
      </div>

      {/* ⚠️ Alertas operativas */}
      <div className="bg-card border border-border rounded-xl p-6 animate-slide-up">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Alertas Operativas
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
          <li>
            <span className="text-red-500 font-semibold">🔴</span> Clientes con
            asistencia pero sin pago:{" "}
            <span className="font-bold text-foreground">
              {clientesSinPago.length}
            </span>
          </li>
          <li>
            <span className="text-yellow-500 font-semibold">🟠</span> Clientes
            con abono vencido:{" "}
            <span className="font-bold text-foreground">{vencidos.length}</span>
          </li>
          <li>
            <span className="text-gray-400 font-semibold">⚪</span> Clientes
            inactivos (+30 días):{" "}
            <span className="font-bold text-foreground">
              {clientesInactivos.length}
            </span>
          </li>
        </ul>
      </div>
      {/* 📋 Clientes frecuentes */}
      <div className="bg-card border border-border rounded-xl p-6 animate-slide-up">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Clientes Frecuentes
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                  Cliente
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                  Asistencias
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                  Última
                </th>
              </tr>
            </thead>
            <tbody>
              {clientesConAsistencias.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border hover:bg-muted transition-smooth"
                >
                  <td className="py-3 px-4 text-foreground">{c.nombre}</td>
                  <td className="py-3 px-4 text-center">{c.asistencias}</td>
                  <td className="py-3 px-4 text-center">{c.ultima}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
