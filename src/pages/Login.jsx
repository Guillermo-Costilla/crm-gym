"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { LogIn, Dumbbell, Mail, Lock, AlertCircle } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, loading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    const result = await login(email, password)
    if (result.success) {
      navigate("/")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden text-white">
      {/* Imagen de fondo con overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url(https://image2url.com/r2/default/images/1770847991937-bb8cfe80-7d77-49f9-8cfb-e3f86785ae0d.blob)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-primary-900/60" />
      </div>

      {/* Contenido del login */}
      <div className="relative z-10 w-full max-w-md px-6 animate-fade-in">
        <div className="bg-card/90 backdrop-blur-md rounded-2xl shadow-2xl border border-border p-8">
          {/* Logo y título */}
          <div className="text-center mb-8 text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mb-4 animate-slide-up">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">GYM CRM</h1>
            <p className="text-muted-foreground">Sistema de Gestión de Gimnasio</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6 text-white">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3 animate-slide-up">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-slate-500 pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-foreground placeholder-muted-foreground transition-smooth"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-slate-500 pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-foreground placeholder-muted-foreground transition-smooth"
                  placeholder="••••••••"
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
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {/* Link de registro */}
          <div className="mt-6 text-center">
            <p>Usuario de prueba: admin@test.com <br />
              Pass: admin1234
            </p>
            <p className="text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="text-primary-500 hover:text-primary-400 font-semibold transition-smooth">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-sm mt-6">
          © 2025 GYM CRM. Sistema profesional de gestión.
        </p>
      </div>
    </div>
  )
}
