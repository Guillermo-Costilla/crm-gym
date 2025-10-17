import { useEffect, useState } from "react"
import { useClientesStore } from "../store/clientesStore"
import { format } from "date-fns"
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Mail,
  Phone,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  TrendingUp,
} from "lucide-react"

export default function Clientes() {
  const { clientes, loading, fetchClientes, createCliente, updateCliente, deleteCliente } = useClientesStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingCliente, setEditingCliente] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [formData, setFormData] = useState({
    nombre: "",
    dni: "",
    email: "",
    telefono: "",
    fecha_nacimiento: "",
  })

  useEffect(() => {
    fetchClientes()
  }, [fetchClientes])

  const handleOpenModal = (cliente = null) => {
    if (cliente) {
      setEditingCliente(cliente)
      setFormData({
        nombre: cliente.nombre,
        dni: cliente.dni,
        email: cliente.email,
        telefono: cliente.telefono || "",
        fecha_nacimiento: cliente.fecha_nacimiento || "",
      })
    } else {
      setEditingCliente(null)
      setFormData({
        nombre: "",
        dni: "",
        email: "",
        telefono: "",
        fecha_nacimiento: "",
      })
    }
    setShowModal(true)
    setError(null)
    setSuccess(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCliente(null)
    setFormData({
      nombre: "",
      dni: "",
      email: "",
      telefono: "",
      fecha_nacimiento: "",
    })
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const result = editingCliente ? await updateCliente(editingCliente.id, formData) : await createCliente(formData)

    if (result.success) {
      setSuccess(editingCliente ? "Cliente actualizado exitosamente" : "Cliente creado exitosamente")
      setTimeout(() => {
        handleCloseModal()
        setSuccess(null)
      }, 1500)
    } else {
      setError(result.error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este cliente?")) return

    const result = await deleteCliente(id)
    if (result.success) {
      setSuccess("Cliente eliminado exitosamente")
      setTimeout(() => setSuccess(null), 3000)
    } else {
      setError(result.error)
      setTimeout(() => setError(null), 3000)
    }
  }

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cliente.telefono && cliente.dni && cliente.telefono.includes(searchTerm)),
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary-500" />
            Clientes
          </h1>
          <p className="text-muted-foreground">Gestiona la base de datos de clientes del gimnasio</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:from-primary-700 hover:to-primary-600 transition-smooth shadow-lg shadow-primary-500/30"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </button>
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

      {/* Barra de búsqueda */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre, DNI, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-foreground placeholder-muted-foreground transition-smooth"
          />
        </div>
      </div>

      {/* Tabla de clientes */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : filteredClientes.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? "No se encontraron clientes" : "No hay clientes registrados"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Nombre</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">DNI</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Email</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Teléfono</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Fecha Nacimiento</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.map((cliente, index) => (
                  <tr
                    key={cliente.id}
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
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary-500/10 rounded-full">
                          <User className="w-5 h-5 text-primary-500" />
                        </div>
                        <span className="font-medium text-foreground">{cliente.dni}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {cliente.email}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {cliente.telefono || "-"}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {cliente.fecha_nacimiento ? format(new Date(cliente.fecha_nacimiento), "dd/MM/yyyy") : "-"}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(cliente)}
                          className="p-2 text-primary-500 hover:bg-primary-500/10 rounded-lg transition-smooth"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cliente.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-smooth"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Clientes</p>
              <p className="text-3xl font-bold text-foreground">{clientes.length}</p>
            </div>
            <Users className="w-10 h-10 text-primary-500" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Resultados</p>
              <p className="text-3xl font-bold text-foreground">{filteredClientes.length}</p>
            </div>
            <Search className="w-10 h-10 text-cyan-500" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Crecimiento</p>
              <p className="text-3xl font-bold text-green-500">+12%</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500" />
          </div>
        </div>
      </div>

      {/* Modal de crear/editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">
                {editingCliente ? "Editar Cliente" : "Nuevo Cliente"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-muted rounded-lg transition-smooth"
                type="button"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Formulario */}
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
                <label htmlFor="nombre" className="block text-sm font-medium text-foreground">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-foreground placeholder-muted-foreground transition-smooth"
                    placeholder="Juan Pérez"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="dni" className="block text-sm font-medium text-foreground">
                  DNI *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="dni"
                    type="number"
                    value={formData.dni?.toString() || ""}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-foreground placeholder-muted-foreground transition-smooth"
                    placeholder="999999999"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-foreground placeholder-muted-foreground transition-smooth"
                    placeholder="juan@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="telefono" className="block text-sm font-medium text-foreground">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-foreground placeholder-muted-foreground transition-smooth"
                    placeholder="3815551234"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-foreground">
                  Fecha de Nacimiento
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="fecha_nacimiento"
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-foreground placeholder-muted-foreground transition-smooth"
                  />
                </div>
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:from-primary-700 hover:to-primary-600 transition-smooth font-medium shadow-lg shadow-primary-500/30"
                >
                  {editingCliente ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
