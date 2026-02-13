import { useEffect, useState } from "react"
import { useAsistenciasStore } from "../store/asistenciasStore"
import { usePagosStore } from "../store/pagosStore"
import { useVentasStore } from "../store/ventasStore"
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import { es } from "date-fns/locale"
import {
  ClipboardCheck,
  Search,
  Calendar,
  Download,
  User,
  TrendingUp,
  Clock,
  BarChart3,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function Asistencias() {
  const { asistencias, loading, getAsistencias } = useAsistenciasStore()
  const { exportarPagos } = usePagosStore()
  const { exportarVentas } = useVentasStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [fechaInicio, setFechaInicio] = useState(format(startOfWeek(new Date(), { locale: es }), "yyyy-MM-dd"))
  const [fechaFin, setFechaFin] = useState(format(endOfWeek(new Date(), { locale: es }), "yyyy-MM-dd"))
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [exportando, setExportando] = useState(false)

  useEffect(() => {
  const fetchData = async () => {
    try {
      await getAsistencias();
    } catch (err) {
      setError("Error al cargar asistencias");
    }
  };
  fetchData();
}, [getAsistencias]);


  const handleExportarPagos = async () => {
    setExportando(true)
    setError(null)
    const mes = format(new Date(), "yyyy-MM")
    const result = await exportarPagos(mes)

    if (result.success) {
      setSuccess("Pagos exportados exitosamente")
      setTimeout(() => setSuccess(null), 3000)
    } else {
      setError(result.error)
      setTimeout(() => setError(null), 3000)
    }
    setExportando(false)
  }

  const handleExportarVentas = async () => {
    setExportando(true)
    setError(null)
    const mes = format(new Date(), "yyyy-MM")
    const result = await exportarVentas(mes)

    if (result.success) {
      setSuccess("Ventas exportadas exitosamente")
      setTimeout(() => setSuccess(null), 3000)
    } else {
      setError(result.error)
      setTimeout(() => setError(null), 3000)
    }
    setExportando(false)
  }

  // Agrupo asistencias por cliente
  const asistenciasPorCliente = asistencias.reduce((acc, asistencia) => {
    const clienteId = asistencia.cliente_id
    if (!acc[clienteId]) {
      acc[clienteId] = {
        cliente_id: clienteId,
        nombre: asistencia.cliente || "Desconocido",
        asistencias: [],
      }
    }
    acc[clienteId].asistencias.push(asistencia)
    return acc
  }, {})

  const clientesConAsistencias = Object.values(asistenciasPorCliente)

  const filteredAsistencias = clientesConAsistencias.filter((cliente) =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Preparo datos para gráfico semanal
  const diasSemana = eachDayOfInterval({ start: new Date(fechaInicio), end: new Date(fechaFin) })
  const asistenciasPorDia = diasSemana.map((dia) => {
    const diaStr = format(dia, "yyyy-MM-dd")
    const count = asistencias.filter((a) => a.hora_ingreso?.startsWith(diaStr)).length
    return {
      dia: format(dia, "EEE", { locale: es }),
      asistencias: count,
    }
  })

  const totalAsistencias = asistencias.length
  const clientesUnicos = new Set(asistencias.map((a) => a.cliente_id)).size
  const promedioAsistencias = clientesUnicos > 0 ? (totalAsistencias / clientesUnicos).toFixed(1) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8 text-cyan-500" />
            Asistencias
          </h1>
          <p className="text-muted-foreground">Monitorea la asistencia de los clientes al gimnasio</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportarPagos}
            disabled={exportando}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-smooth shadow-lg shadow-green-500/30 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            Exportar Pagos
          </button>
          <button
            onClick={handleExportarVentas}
            disabled={exportando}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-purple-600 transition-smooth shadow-lg shadow-purple-500/30 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            Exportar Ventas
          </button>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3 animate-slide-up">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-start gap-3 animate-slide-up">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-500">{success}</p>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Asistencias</p>
              <p className="text-3xl font-bold text-foreground">{totalAsistencias}</p>
            </div>
            <ClipboardCheck className="w-10 h-10 text-cyan-500" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Clientes Únicos</p>
              <p className="text-3xl font-bold text-primary-500">{clientesUnicos}</p>
            </div>
            <User className="w-10 h-10 text-primary-500" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Promedio por Cliente</p>
              <p className="text-3xl font-bold text-green-500">{promedioAsistencias}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-foreground placeholder-muted-foreground transition-smooth"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-foreground transition-smooth"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-foreground transition-smooth"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de asistencias por día */}
      <div className="bg-card border border-border rounded-xl p-6 animate-slide-up">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-500" />
          Asistencias por Día
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={asistenciasPorDia}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="dia" stroke="#a3a3a3" />
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

      {/* Tabla de asistencias por cliente */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-primary-500" />
            Asistencias por Cliente
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          </div>
        ) : filteredAsistencias.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? "No se encontraron asistencias" : "No hay asistencias en este rango de fechas"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Cliente</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-foreground">Total Asistencias</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Última Asistencia</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-foreground">Frecuencia</th>
                </tr>
              </thead>
              <tbody>
                {filteredAsistencias.map((cliente, index) => {
                  const ultimaAsistencia = cliente.asistencias[cliente.asistencias.length - 1]
                  const diasEnRango =
                    (new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / (1000 * 60 * 60 * 24) + 1
                  const frecuencia = ((cliente.asistencias.length / diasEnRango) * 100).toFixed(0)

                  return (
                    <tr
                      key={cliente.cliente_id}
                      className="border-t border-border hover:bg-muted/50 transition-smooth animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary-500/10 rounded-full">
                            <User className="w-5 h-5 text-primary-500" />
                          </div>
                          <span className="font-medium text-foreground">{cliente.nombre}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center px-3 py-1 bg-cyan-500/10 text-cyan-500 rounded-full text-sm font-semibold">
                          {cliente.asistencias.length}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {ultimaAsistencia?.fecha_asistencia
                            ? format(new Date(ultimaAsistencia.hora_ingreso), "dd/MM/yyyy HH:mm")
                            : "-"}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-primary-500 rounded-full transition-all"
                              style={{ width: `${Math.min(frecuencia, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-foreground">{frecuencia}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-primary-500/10 border border-cyan-500/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-cyan-500/20 rounded-lg flex-shrink-0">
            <ClipboardCheck className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Registro de Asistencias</h3>
            <p className="text-muted-foreground mb-4">
              Las asistencias se registran automáticamente cuando los clientes escanean su código QR en la entrada del
              gimnasio. El sistema también permite exportar reportes de pagos y ventas en formato Excel para análisis
              detallado.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-cyan-500/10 text-cyan-500 rounded-full text-sm font-semibold">
                Registro automático
              </span>
              <span className="px-3 py-1 bg-primary-500/10 text-primary-500 rounded-full text-sm font-semibold">
                Exportación Excel
              </span>
              <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-semibold">
                Análisis en tiempo real
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
