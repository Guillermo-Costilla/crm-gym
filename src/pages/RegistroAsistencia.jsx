import { useAsistenciasStore } from "../store/asistenciasStore";
import gymBackground from "../assets/gym-background.png";
import { useClientesStore } from "../store/clientesStore";
import { usePagosStore } from "../store/pagosStore";
import { useState, useEffect } from "react";
import { LogIn, CheckCircle, AlertCircle, Contact2 } from "lucide-react";

const RegistroAsistencia = () => {
  const { registrarAsistencia } = useAsistenciasStore();
  const { fetchClientes, clientes } = useClientesStore();
  const [form, setForm] = useState({ dni: "" });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { loading } = usePagosStore();

  useEffect(() => {
    if (!clientes || clientes.length === 0) {
      fetchClientes();
    }
  }, []);

  function formatearFecha(fecha) {
    const pad = (n) => String(n).padStart(2, "0");
    return (
      `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(
        fecha.getDate()
      )} ` +
      `${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:${pad(
        fecha.getSeconds()
      )}`
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cliente = clientes.find((c) => String(c.dni) === String(form.dni));
    if (!cliente) {
      setError("DNI no registrado");
      return;
    }
    const hora_ingreso = formatearFecha(new Date());
    const hora_salida = formatearFecha(new Date(Date.now() + 90 * 60 * 1000));

    const asistencia = {
      cliente_id: Number(cliente.id),
      hora_ingreso: String(hora_ingreso),
      hora_salida: String(hora_salida),
    };

    console.log("🧪 Tipos:", {
      cliente_id: typeof cliente.id,
      hora_ingreso: typeof hora_ingreso,
      hora_salida: typeof hora_salida,
    });

    console.log("🧪 Valores:", {
      cliente_id: cliente.id,
      hora_ingreso,
      hora_salida,
    });

    console.log("Asistencia a registrar:", asistencia);

    const result = await registrarAsistencia(asistencia);
    if (result.success) {
      setSuccess("Asistencia registrada exitosamente");
      setTimeout(() => {
        setSuccess(null);
      }, 1500);
    } else {
      setError(result.error);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${gymBackground})` }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="space-y-2">
          <label
            htmlFor="dni"
            className="block text-sm font-medium text-foreground"
          >
            DNI
          </label>
          <div className="relative">
            <Contact2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="dni"
              type="number"
              value={form.dni}
              onChange={(e) => setForm({ ...form, dni: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-foreground placeholder-muted-foreground transition-smooth"
              placeholder="12345678"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold py-3 rounded-lg transition-smooth flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Registrar Asistencia
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default RegistroAsistencia;
