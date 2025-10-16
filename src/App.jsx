import { useEffect, useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "./store/authStore"
import { useThemeStore } from "./store/themeStore"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Clientes from "./pages/Clientes"
import Productos from "./pages/Productos"
import Ventas from "./pages/Ventas"
import Pagos from "./pages/Pagos"
import Asistencias from "./pages/Asistencias"
import Layout from "./components/Layout"

function ProtectedRoute({ children }) {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/login" replace />
}

function App() {
  const { theme } = useThemeStore()
  const { initialize, isInitialized } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.documentElement.classList.remove("dark", "light")
    document.documentElement.classList.add(theme)
  }, [theme])

  useEffect(() => {
    const initAuth = async () => {
      await initialize()
      setLoading(false)
    }
    initAuth()
  }, [initialize])

  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="productos" element={<Productos />} />
          <Route path="ventas" element={<Ventas />} />
          <Route path="pagos" element={<Pagos />} />
          <Route path="asistencias" element={<Asistencias />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App