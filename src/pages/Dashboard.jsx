import { useEffect, useState } from "react";
import { useClientesStore } from "../store/clientesStore";
import { useDashboardStore } from "../store/dashboardStore";
import { usePagosStore } from "../store/pagosStore";
import { useVentasStore } from "../store/ventasStore";
import { useAsistenciasStore } from "../store/asistenciasStore";
import { format, subDays, subMonths, differenceInDays, getDaysInMonth } from "date-fns";
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
  const { dashboard, fetchDashboard } = useDashboardStore();
  const { pagos, fetchPagos, getTotalPagosDelMes } = usePagosStore();
  const { ventas, fetchVentas } = useVentasStore();
  const { asistencias, getAsistencias } = useAsistenciasStore();

  const [loading, setLoading] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);

  const fechaHoy = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const hoyFormato = format(new Date(), "yyyy-MM-dd");
        await Promise.all([
          fetchDashboard(hoyFormato),
          fetchPagos(),
          fetchVentas(),
          getAsistencias(),
          fetchClientes(),
        ]);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [fetchDashboard, fetchPagos, fetchVentas, getAsistencias, fetchClientes]);

  const hoy = new Date();
  const mesActual = hoy.getMonth();
  const añoActual = hoy.getFullYear();

  const ingresosVentas = ventas
    .filter((v) => {
      if (!v.fecha) return false;

      const [year, month, day] = v.fecha.split("-").map(Number);
      const fecha = new Date(year, month - 1, day);

      return (
        fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual
      );
    })
    .reduce((acc, v) => acc + Number(v.total || 0), 0);

  const ingresosPagos = getTotalPagosDelMes();
  const ingresosMes = ingresosPagos + ingresosVentas;

  const totalClientes = clientes.length;

  const asistenciasHoy = asistencias
    .filter((a) => a.hora_ingreso?.startsWith(fechaHoy))
    .length;
  const ventasHoy = dashboard?.ventas_hoy || 0;
  const ingresosHoy = dashboard?.ingresos_hoy || 0;
  const concurrenciaActual = asistencias
    .filter((a) => a.hora_ingreso?.startsWith(fechaHoy) && !a.hora_salida)
    .length;

  const pagosHoy = pagos
    .filter((p) => p.pagado && p.fecha_pago?.startsWith(fechaHoy))
    .length;

  const clientesActivos = dashboard?.clientes_activos || 0;

  const diasEnMes = getDaysInMonth(new Date(añoActual, mesActual));
  const ingresosPorDia = Array.from({ length: diasEnMes }, (_, i) => {
    const dia = i + 1;
    const fecha = format(new Date(añoActual, mesActual, dia), "yyyy-MM-dd");
    const ventasDelDia = ventas
      .filter((v) => v.fecha === fecha)
      .reduce((acc, v) => acc + v.total, 0);
    const pagosDelDia = pagos
      .filter((p) => p.pagado && p.fecha_pago?.startsWith(fecha))
      .reduce((acc, p) => acc + p.monto, 0);
    return {
      fecha: format(new Date(añoActual, mesActual, dia), "dd/MM", { locale: es }),
      ingresos: ventasDelDia + pagosDelDia,
    };
  });

  const asistenciasPorDiaMes = Array.from({ length: diasEnMes }, (_, i) => {
    const dia = i + 1;
    const fecha = format(new Date(añoActual, mesActual, dia), "yyyy-MM-dd");
    const count = asistencias.filter((a) => {
      const fechaAsistencia = a.hora_ingreso?.substring(0, 10);
      return fechaAsistencia === fecha;
    }).length;
    return {
      fecha: format(new Date(añoActual, mesActual, dia), "dd/MM", { locale: es }),
      asistencias: count,
    };
  });

  const nuevosClientesData =
    dashboard?.nuevos_clientes_mes?.map((item) => ({
      mes: format(new Date(item.mes + "-01"), "MMM", { locale: es }),
      clientes: item.nuevos,
    })) || [];

  // Calculo: nuevos clientes últimos 12 meses (fallback a dashboard/clientes)
  const mesesUltimos12 = Array.from({ length: 12 }, (_, i) => subMonths(new Date(), 11 - i));
  const mesesKeys = mesesUltimos12.map((d) => format(d, "yyyy-MM"));

  // Uso datos de dashboard si existen
  let nuevosClientes12 = mesesKeys.map((m, idx) => ({ mes: format(mesesUltimos12[idx], "MMM", { locale: es }), clientes: 0 }));

  if (dashboard?.nuevos_clientes_mes && dashboard.nuevos_clientes_mes.length > 0) {
    const map = {};
    dashboard.nuevos_clientes_mes.forEach((it) => {
      // Formato esperado: 'YYYY-MM' o 'YYYY-MM-01'
      const key = String(it.mes).slice(0, 7);
      map[key] = (map[key] || 0) + (it.nuevos || 0);
    });
    nuevosClientes12 = mesesKeys.map((m, idx) => ({ mes: format(mesesUltimos12[idx], "MMM", { locale: es }), clientes: map[m] || 0 }));
  } else {
    // Fallback: contar por fecha de alta en `clientes` si no hay datos en dashboard
    const posibleCampos = ["created_at", "createdAt", "fecha_registro", "fecha_creacion", "fechaAlta"];
    const map = {};
    clientes.forEach((c) => {
      const fechaStr = posibleCampos.reduce((acc, f) => acc || c[f] || c[f?.toLowerCase()], null);
      if (!fechaStr) return;
      const d = new Date(fechaStr);
      if (isNaN(d)) return;
      const key = format(d, "yyyy-MM");
      map[key] = (map[key] || 0) + 1;
    });
    nuevosClientes12 = mesesKeys.map((m, idx) => ({ mes: format(mesesUltimos12[idx], "MMM", { locale: es }), clientes: map[m] || 0 }));
  }

  const productosTopData = (() => {
    
    const agruparPorProducto = (listaVentas) => {
      const map = {};
      listaVentas.forEach((venta) => {
        if (venta.producto) {
          const nombre = venta.producto;
          if (!map[nombre]) map[nombre] = { nombre, total: 0, cantidad: 0 };
          map[nombre].total += Number(venta.total || 0);
          map[nombre].cantidad += 1;
          return;
        }
        if (Array.isArray(venta.items)) {
          venta.items.forEach((it) => {
            const nombre = it.nombre || it.producto || "Desconocido";
            const monto = Number(it.total || it.precio || 0);
            if (!map[nombre]) map[nombre] = { nombre, total: 0, cantidad: 0 };
            map[nombre].total += monto;
            map[nombre].cantidad += Number(it.cantidad || 1);
          });
          return;
        }
        const nombre = venta.descripcion || "Desconocido";
        if (!map[nombre]) map[nombre] = { nombre, total: 0, cantidad: 0 };
        map[nombre].total += Number(venta.total || 0);
        map[nombre].cantidad += 1;
      });
      return Object.values(map).sort((a, b) => b.cantidad - a.cantidad || b.total - a.total);
    };

    
    const ventasMes = ventas.filter((v) => {
      if (!v.fecha) return false;
      const [y, m] = v.fecha.split("-").map(Number);
      return y === añoActual && m - 1 === mesActual;
    });

    let productos = agruparPorProducto(ventasMes);

    
    if (productos.length === 0) {
      productos = agruparPorProducto(ventas);
    }

    if (productos.length === 0 && dashboard?.producto_top) {
      return [
        { name: dashboard.producto_top.nombre, value: dashboard.producto_top.total },
      ];
    }

    if (productos.length === 0) return [];

    const top = productos[0];
    const totalBase = (ventasMes.length > 0 ? ventasMes : ventas).reduce((acc, v) => acc + Number(v.total || 0), 0);
    const otros = Math.max(0, totalBase - top.total);

    return [
      { name: top.nombre, value: top.total },
      { name: "Otros", value: otros },
    ];
  })();

  const clientesSinPago = [
    ...new Set(
      asistencias
        .filter(
          (a) => !pagos.some((p) => p.cliente_id === a.cliente_id && p.pagado),
        )
        .map((a) => a.cliente_id),
    ),
  ];

  const vencidos = [
    ...new Set(
      pagos
        .filter((p) => {
          const vencimiento = new Date(p.fecha_pago);
          vencimiento.setMonth(
            vencimiento.getMonth() + (p.tipo === "Mensual" ? 1 : 12),
          );
          return p.pagado && vencimiento < new Date();
        })
        .map((p) => p.cliente_id),
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
        (a) => a.cliente_id === cliente.id,
      );
      if (asistenciasCliente.length === 0) return null;

      const ultima = asistenciasCliente.reduce((max, a) =>
        new Date(a.hora_ingreso) > new Date(max.hora_ingreso || 0) ? a : max,
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
    .filter(Boolean); // elimino nulls

  console.log("✅ Clientes con asistencias:", clientesConAsistencias);

  const itemsPorPagina = 3;
  const totalPaginas = Math.ceil(clientesConAsistencias.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const clientesPaginados = clientesConAsistencias.slice(indiceInicio, indiceFin);
  const porcentajeActivos =
    totalClientes > 0 ? ((clientesActivos / totalClientes) * 100).toFixed(1) : "0";

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
          title="Total de Clientes"
          value={totalClientes}
          icon={<Users />}
          color="blue"
        />
        <Card
          title="Pagos de Hoy"
          value={pagosHoy}
          icon={<DollarSign />}
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
          titulo="Ingresos del mes"
          data={ingresosPorDia}
          dataKey="ingresos"
          color="#10b981"
        />
        <GraficoBar
          titulo="Asistencias por día del mes"
          data={asistenciasPorDiaMes}
          dataKey="asistencias"
          color="#06b6d4"
        />
        <div className="bg-card border border-border rounded-xl p-6 animate-slide-up">
          <GraficoLinea
            titulo="Nuevos clientes por mes"
            data={nuevosClientesData}
            dataKey="clientes"
            color="#3b82f6"
          />
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-muted border border-border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clientes Activos (%)</p>
                <p className="text-2xl font-bold text-foreground">{porcentajeActivos}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Activos</p>
                <p className="text-lg font-semibold text-primary-500">{clientesActivos}</p>
              </div>
            </div>
            <div className="bg-muted border border-border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clientes Inactivos (+30d)</p>
                <p className="text-2xl font-bold text-foreground">{clientesInactivos.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-lg font-semibold text-foreground">{totalClientes}</p>
              </div>
            </div>
          </div>
        </div>
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
              {clientesPaginados.map((c) => (
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
        {clientesConAsistencias.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Mostrando {indiceInicio + 1}-{Math.min(indiceFin, clientesConAsistencias.length)} de {clientesConAsistencias.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                disabled={paginaActual === 1}
                className="px-3 py-2 bg-muted border border-border rounded-lg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed text-foreground transition-smooth"
              >
                ← Anterior
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setPaginaActual(num)}
                    className={`w-8 h-8 rounded-lg transition-smooth ${
                      paginaActual === num
                        ? "bg-primary-500 text-white"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                disabled={paginaActual === totalPaginas}
                className="px-3 py-2 bg-muted border border-border rounded-lg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed text-foreground transition-smooth"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
