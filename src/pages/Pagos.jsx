import { useEffect, useState } from "react"
import { usePagosStore } from "../store/pagosStore"
import { useClientesStore } from "../store/clientesStore"
import { format } from "date-fns"
import {
  CreditCard,
  Search,
  Plus,
  X,
  User,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Filter,
  Download,
} from "lucide-react"

export default function Pagos() {
  const { pagos, loading, fetchPagos, createPago, exportarPagos } = usePagosStore()
  const { clientes, fetchClientes } = useClientesStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("todos")
  const [showModal, setShowModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [exportMes, setExportMes] = useState(format(new Date(), "yyyy-MM"))

  const [formData, setFormData] = useState({
    cliente_id: "",
    monto: "",
    tipo: "mensual",
    fecha_pago: format(new Date(), "yyyy-MM-dd"),
    pagado: 1,
  })

  useEffect(() => {
    fetchPagos()
    fetchClientes()
  }, [])

  const handleOpenModal = () => {
    setFormData({
      cliente_id: "",
      monto: "",
      tipo: "mensual",
      fecha_pago: format(new Date(), "yyyy-MM-dd"),
      pagado: 1,
    })
    setShowModal(true)
    setError(null)
    setSuccess(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setFormData({
      cliente_id: "",
      monto: "",
      tipo: "mensual",
      fecha_pago: format(new Date(), "yyyy-MM-dd"),
      pagado: 1,
    })
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const result = await createPago(formData)
    if (result.success) {
      setSuccess("Pago registrado exitosamente")
      setTimeout(() => {
        handleCloseModal()
        setSuccess(null)
      }, 1500)
    } else {
      setError(result.error)
    }
  }

  const handleExportar = async () => {
    setError(null)
    setSuccess(null)
    const result = await exportarPagos(exportMes)
    if (result.success) {
      setSuccess("Pagos exportados exitosamente")
      setTimeout(() => {
        setShowExportModal(false)
        setSuccess(null)
      }, 1500)
    } else {
      setError(result.error)
    }
  }

  const getClienteNombre = (clienteId) => {
    const cliente = clientes.find((c) => c.id === clienteId)
    return cliente?.nombre || "Desconocido"
  }

  const filteredPagos = pagos.filter((pago) => {
    const clienteNombre = getClienteNombre(pago.cliente_id).toLowerCase()
    const matchesSearch = clienteNombre.includes(searchTerm.toLowerCase())
    const matchesFilter =
      filterStatus === "todos" ||
      (filterStatus === "pagado" && pago.pagado) ||
      (filterStatus === "pendiente" && !pago.pagado)
    return matchesSearch && matchesFilter
  })

  const totalPagos = pagos.filter((p) => p.pagado).reduce((sum, pago) => sum + Number.parseFloat(pago.monto || 0), 0)
  const pagosPendientes = pagos.filter((p) => !p.pagado).length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-green-500" />
            Pagos
          </h1>
          <p className="text-muted-foreground">Gestiona los pagos y membresías del gimnasio</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-purple-600 transition-smooth shadow-lg shadow-purple-500/30"
          >
            <Download className="w-5 h-5" />
            Exportar
          </button>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-smooth shadow-lg shadow-green-500/30"
          >
            <Plus className="w-5 h-5" />
            Nuevo Pago
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
              <p className="text-sm text-muted-foreground mb-1">Total Pagos</p>
              <p className="text-3xl font-bold text-foreground">{pagos.length}</p>
            </div>
            <CreditCard className="w-10 h-10 text-green-500" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ingresos Totales</p>
              <p className="text-3xl font-bold text-green-500">${totalPagos.toLocaleString()}</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-500" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-500">{pagosPendientes}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-foreground placeholder-muted-foreground transition-smooth"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-foreground transition-smooth appearance-none min-w-[150px]"
            >
              <option value="todos">Todos</option>
              <option value="pagado">Pagados</option>
              <option value="pendiente">Pendientes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de pagos */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
          </div>
        ) : filteredPagos.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? "No se encontraron pagos" : "No hay pagos registrados"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Cliente</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Tipo</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-foreground">Monto</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Fecha</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredPagos.map((pago, index) => (
                  <tr
                    key={pago.id}
                    className="border-t border-border hover:bg-muted/50 transition-smooth animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary-500" />
                        <span className="text-foreground">{getClienteNombre(pago.cliente_id)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-sm font-semibold capitalize">
                        {pago.tipo}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-lg font-bold text-green-500">
                        ${Number.parseFloat(pago.monto).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(pago.fecha_pago), "dd/MM/yyyy")}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {pago.pagado ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          Pagado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-sm font-semibold">
                          <Clock className="w-4 h-4" />
                          Pendiente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de nuevo pago */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Nuevo Pago</h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-muted rounded-lg transition-smooth">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}
              {success && (
                <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-500">{success}</p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="cliente_id" className="block text-sm font-medium text-foreground">
                  Cliente *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    id="cliente_id"
                    value={formData.cliente_id}
                    onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-foreground transition-smooth appearance-none"
                    required
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="monto" className="block text-sm font-medium text-foreground">
                  Monto *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="monto"
                    type="number"
                    step="0.01"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-foreground placeholder-muted-foreground transition-smooth"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="tipo" className="block text-sm font-medium text-foreground">
                  Tipo de Pago *
                </label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-foreground transition-smooth appearance-none"
                  required
                >
                  <option value="mensual">Mensual</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="semestral">Semestral</option>
                  <option value="anual">Anual</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="fecha_pago" className="block text-sm font-medium text-foreground">
                  Fecha de Pago *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="fecha_pago"
                    type="date"
                    value={formData.fecha_pago}
                    onChange={(e) => setFormData({ ...formData, fecha_pago: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-foreground transition-smooth"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <input
                  id="pagado"
                  type="checkbox"
                  checked={formData.pagado}
                  onChange={(e) => setFormData({ ...formData, pagado: e.target.checked })}
                  className="w-5 h-5 rounded border-border text-green-500 focus:ring-2 focus:ring-green-500"
                />
                <label htmlFor="pagado" className="text-sm font-medium text-foreground cursor-pointer">
                  Marcar como pagado
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-smooth font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-smooth font-medium shadow-lg shadow-green-500/30"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de exportación */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowExportModal(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Exportar Pagos</h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-smooth"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}
              {success && (
                <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-500">{success}</p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="exportMes" className="block text-sm font-medium text-foreground">
                  Seleccionar Mes
                </label>
                <input
                  id="exportMes"
                  type="month"
                  value={exportMes}
                  onChange={(e) => setExportMes(e.target.value)}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-foreground transition-smooth"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-smooth font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExportar}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-purple-600 transition-smooth font-medium shadow-lg shadow-purple-500/30"
                >
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
