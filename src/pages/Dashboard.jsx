import { useState, useEffect } from "react"
import { useDashboardStore } from "../store/dashboardStore"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Calendar,
  ArrowUp,
  ArrowDown,
  Download,
  RefreshCw,
} from "lucide-react"

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"]

export default function Dashboard() {
  const { dashboard, loading, error: storeError, fetchDashboard } = useDashboardStore()
  const [fecha, setFecha] = useState(format(new Date(), "yyyy-MM-dd"))

  useEffect(() => {
    fetchDashboard(fecha)
  }, [fecha, fetchDashboard])

  const handleRefresh = () => {
    fetchDashboard(fecha)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (storeError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{storeError}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-smooth"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const metricsCards = [
    {
      title: "Clientes Activos",
      value: dashboard?.clientes_activos || 0,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      change: "+12%",
      trend: "up",
    },
    {
      title: "Ingresos Hoy",
      value: `$${(dashboard?.ingresos_hoy || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "from-green-500 to-green-600",
      change: "+8%",
      trend: "up",
    },
    {
      title: "Ventas Hoy",
      value: dashboard?.ventas_hoy || 0,
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      change: "+5%",
      trend: "up",
    },
    {
      title: "Asistencias Hoy",
      value: dashboard?.asistencias_hoy?.length || 0,
      icon: Activity,
      color: "from-cyan-500 to-cyan-600",
      change: "-3%",
      trend: "down",
    },
  ]

  // Preparar datos para gráficos
  const nuevosClientesData =
    dashboard?.nuevos_clientes_mes?.map((item) => ({
      mes: format(new Date(item.mes + "-01"), "MMM", { locale: es }),
      clientes: item.nuevos,
    })) || []

  const asistenciasData =
    dashboard?.asistencias_hoy?.slice(0, 10).map((item) => ({
      nombre: item.nombre.split(" ")[0],
      asistencias: item.asistencias,
    })) || []

  const productosTopData = dashboard?.producto_top
    ? [
        { name: "Top Producto", value: dashboard.producto_top.total },
        { name: "Otros", value: Math.max(0, dashboard.ventas_hoy - dashboard.producto_top.total) },
      ]
    : []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Resumen de métricas y estadísticas del gimnasio</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleRefresh}
            className="p-2 bg-card border border-border rounded-lg hover:bg-muted transition-smooth"
            title="Actualizar"
          >
            <RefreshCw className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsCards.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-primary-500/10 transition-smooth animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${metric.color} rounded-lg shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-semibold ${
                    metric.trend === "up" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {metric.trend === "up" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  {metric.change}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">{metric.value}</h3>
              <p className="text-sm text-muted-foreground">{metric.title}</p>
            </div>
          )
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nuevos clientes por mes */}
        <div className="bg-card border border-border rounded-xl p-6 animate-slide-up">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            Nuevos Clientes por Mes
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={nuevosClientesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="mes" stroke="#a3a3a3" />
              <YAxis stroke="#a3a3a3" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  borderRadius: "8px",
                  color: "#fafafa",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="clientes"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", r: 6 }}
                activeDot={{ r: 8 }}
                name="Clientes"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Asistencias del día */}
        <div className="bg-card border border-border rounded-xl p-6 animate-slide-up">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-500" />
            Top 10 Asistencias Hoy
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={asistenciasData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="nombre" stroke="#a3a3a3" />
              <YAxis stroke="#a3a3a3" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  borderRadius: "8px",
                  color: "#fafafa",
                }}
              />
              <Legend />
              <Bar dataKey="asistencias" fill="#06b6d4" radius={[8, 8, 0, 0]} name="Asistencias" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Producto más vendido */}
        {dashboard?.producto_top && (
          <div className="bg-card border border-border rounded-xl p-6 animate-slide-up">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Producto Más Vendido
            </h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-2xl font-bold text-foreground">{dashboard.producto_top.nombre}</p>
                <p className="text-muted-foreground">{dashboard.producto_top.total} unidades vendidas</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={productosTopData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {productosTopData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: "8px",
                    color: "#fafafa",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Resumen de actividad */}
        <div className="bg-card border border-border rounded-xl p-6 animate-slide-up">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-500" />
            Resumen de Actividad
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Total Clientes Activos</p>
                <p className="text-2xl font-bold text-foreground">{dashboard?.clientes_activos || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Ventas del Día</p>
                <p className="text-2xl font-bold text-foreground">{dashboard?.ventas_hoy || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos del Día</p>
                <p className="text-2xl font-bold text-foreground">${(dashboard?.ingresos_hoy || 0).toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de asistencias recientes */}
      {dashboard?.asistencias_hoy && dashboard.asistencias_hoy.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-500" />
              Asistencias Recientes
            </h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-smooth">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Cliente</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Asistencias</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.asistencias_hoy.slice(0, 5).map((asistencia, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted transition-smooth">
                    <td className="py-3 px-4 text-foreground">{asistencia.nombre}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center px-3 py-1 bg-cyan-500/10 text-cyan-500 rounded-full text-sm font-semibold">
                        {asistencia.asistencias}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
