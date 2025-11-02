import { useEffect, useState } from "react";
import { useVentasStore } from "../store/ventasStore";
import { useClientesStore } from "../store/clientesStore";
import { useProductosStore } from "../store/productosStore";
import { format } from "date-fns";
import {
  ShoppingCart,
  Search,
  Plus,
  X,
  User,
  Package,
  Hash,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Download,
} from "lucide-react";

export default function Ventas() {
  const { ventas, loading, fetchVentas, createVenta, exportarVentas } =
    useVentasStore();
  const { clientes, fetchClientes } = useClientesStore();
  const { productos, fetchProductos } = useProductosStore();
  console.log(productos);
  console.log(clientes);
  

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [exportMes, setExportMes] = useState(format(new Date(), "yyyy-MM"));

  const fechaHoy = new Date().toISOString().slice(0, 10);

  const [formData, setFormData] = useState({
    cliente_id: "",
    producto_id: "",
    cantidad: "1",
    fecha_venta: fechaHoy,
    total: "",
  });
  console.log(formData);
  
  useEffect(() => {
    fetchVentas();
    fetchClientes();
    fetchProductos();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      cliente_id: "",
      producto_id: "",
      cantidad: "1",
      fecha_venta: fechaHoy,
      total: "", // lo calculás antes de enviar
    });
    setShowModal(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseModal = () => {
    setFormData({
      cliente_id: "",
      producto_id: "",
      cantidad: "1",
      fecha_venta: fechaHoy,
      total: "",
    });
    setShowModal(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const producto = productos.find(
      (p) => p.id === parseInt(formData.producto_id)
    );
    const precioUnitario = producto?.precio || 0;
    const cantidad = parseInt(formData.cantidad);
    const total = precioUnitario * cantidad;

    const ventaCompleta = {
      ...formData,
      total,
    };

    try {
      await axios.post("/ventas", ventaCompleta);
      setSuccess("Venta registrada con éxito");
      fetchVentas();
      handleCloseModal();
    } catch (err) {
      setError("Error al registrar la venta");
      console.error(err);
    }
  };

  const handleExportar = async () => {
    setError(null);
    setSuccess(null);
    const result = await exportarVentas(exportMes);
    if (result.success) {
      setSuccess("Ventas exportadas exitosamente");
      setTimeout(() => {
        setShowExportModal(false);
        setSuccess(null);
      }, 1500);
    } else {
      setError(result.error);
    }
  };

  const getClienteNombre = (clienteId) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente?.nombre || "Desconocido";
  };

  const getProductoNombre = (productoId) => {
    const producto = productos.find((p) => p.id === productoId);
    return producto?.nombre || "Desconocido";
  };

  const filteredVentas = ventas.filter((venta) => {
    const clienteNombre = getClienteNombre(venta.cliente_id).toLowerCase();
    const productoNombre = getProductoNombre(venta.producto_id).toLowerCase();
    const search = searchTerm.toLowerCase();
    return clienteNombre.includes(search) || productoNombre.includes(search);
  });

  const totalVentas = ventas.reduce(
    (sum, venta) => sum + Number.parseFloat(venta.total || 0),
    0
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-cyan-500" />
            Ventas
          </h1>
          <p className="text-muted-foreground">
            Registra y gestiona las ventas del gimnasio
          </p>
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
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg hover:from-cyan-700 hover:to-cyan-600 transition-smooth shadow-lg shadow-cyan-500/30"
          >
            <Plus className="w-5 h-5" />
            Nueva Venta
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
              <p className="text-sm text-muted-foreground mb-1">Total Ventas</p>
              <p className="text-3xl font-bold text-foreground">
                {ventas.length}
              </p>
            </div>
            <ShoppingCart className="w-10 h-10 text-cyan-500" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Ingresos Totales
              </p>
              <p className="text-3xl font-bold text-green-500">
                ${totalVentas.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-green-500" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Promedio</p>
              <p className="text-3xl font-bold text-foreground">
                $
                {ventas.length > 0
                  ? (totalVentas / ventas.length).toFixed(0)
                  : 0}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-primary-500" />
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por cliente o producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-foreground placeholder-muted-foreground transition-smooth"
          />
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          </div>
        ) : filteredVentas.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm
                ? "No se encontraron ventas"
                : "No hay ventas registradas"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">
                    Cliente
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">
                    Producto
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-foreground">
                    Cantidad
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-foreground">
                    Total
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredVentas.map((venta, index) => (
                  <tr
                    key={venta.id}
                    className="border-t border-border hover:bg-muted/50 transition-smooth animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary-500" />
                        <span className="text-foreground">
                          {getClienteNombre(venta.cliente_id)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-purple-500" />
                        <span className="text-foreground">
                          {getProductoNombre(venta.producto_id)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center px-3 py-1 bg-cyan-500/10 text-cyan-500 rounded-full text-sm font-semibold">
                        {venta.cantidad}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-lg font-bold text-green-500">
                        ${Number.parseFloat(venta.total).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(venta.fecha_venta), "dd/MM/yyyy")}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de nueva venta */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Nueva Venta</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-muted rounded-lg transition-smooth"
              >
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
                <label
                  htmlFor="cliente_id"
                  className="block text-sm font-medium text-foreground"
                >
                  Cliente *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    id="cliente_id"
                    value={formData.cliente_id}
                    onChange={(e) =>
                      setFormData({ ...formData, cliente_id: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-foreground transition-smooth appearance-none"
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
                <label
                  htmlFor="producto_id"
                  className="block text-sm font-medium text-foreground"
                >
                  Producto *
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    id="producto_id"
                    value={formData.producto_id}
                    onChange={(e) =>
                      setFormData({ ...formData, producto_id: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-foreground transition-smooth appearance-none"
                    required
                  >
                    <option value="">Seleccionar producto</option>
                    {productos.map((producto) => (
                      <option key={producto.id} value={producto.id}>
                        {producto.nombre} - ${producto.precio}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="cantidad"
                  className="block text-sm font-medium text-foreground"
                >
                  Cantidad *
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="cantidad"
                    type="number"
                    min="1"
                    value={formData.cantidad}
                    onChange={(e) =>
                      setFormData({ ...formData, cantidad: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-foreground placeholder-muted-foreground transition-smooth"
                    placeholder="1"
                    required
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg hover:from-cyan-700 hover:to-cyan-600 transition-smooth font-medium shadow-lg shadow-cyan-500/30"
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
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowExportModal(false)}
          />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">
                Exportar Ventas
              </h2>
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
                <label
                  htmlFor="exportMes"
                  className="block text-sm font-medium text-foreground"
                >
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
  );
}
