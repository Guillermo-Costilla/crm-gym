import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { useThemeStore } from "../store/themeStore"
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  ClipboardCheck,
  LogOut,
  Menu,
  X,
  Dumbbell,
  User,
  Sun,
  Moon,
} from "lucide-react"

const menuItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/clientes", icon: Users, label: "Clientes" },
  { path: "/productos", icon: Package, label: "Productos" },
  { path: "/ventas", icon: ShoppingCart, label: "Ventas" },
  { path: "/pagos", icon: CreditCard, label: "Pagos" },
  { path: "/asistencias", icon: ClipboardCheck, label: "Asistencias" },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  useEffect(() => {
    document.documentElement.classList.remove("dark", "light")
    document.documentElement.classList.add(theme)
  }, [theme])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-card border-r border-border">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center gap-3 h-16 px-6 border-b border-border">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">GYM CRM</span>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth ${
                    isActive
                      ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-4 py-3 bg-muted rounded-lg mb-2">
              <div className="flex items-center justify-center w-8 h-8 bg-primary-500 rounded-full">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.nombre || "Usuario"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.rol || "staff"}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-smooth"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border animate-slide-in">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between h-16 px-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg">
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-foreground">GYM CRM</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-smooth"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {menuItems.map(({ path, icon: Icon, label }) => {
                  const isActive = location.pathname === path
                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth ${
                        isActive
                          ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{label}</span>
                    </Link>
                  )
                })}
              </nav>
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 px-4 py-3 bg-muted rounded-lg mb-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary-500 rounded-full">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user?.nombre || "Usuario"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.rol || "staff"}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-smooth"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Contenido principal */}
      <div className="lg:pl-64">
        {/* Header móvil */}
        <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 bg-card/80 backdrop-blur-xl border-b border-border lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-muted rounded-lg transition-smooth">
            <Menu className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">GYM CRM</span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-muted rounded-lg transition-smooth"
            aria-label="Cambiar tema"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-foreground" />
            )}
          </button>
        </header>

         {/* Header desktop */}
        <header className="hidden lg:flex sticky top-0 z-40 items-center justify-end h-16 px-8 bg-card/80 backdrop-blur-xl border-b border-border">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-muted rounded-lg transition-smooth"
            aria-label="Cambiar tema"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-foreground" />
            )}
          </button>
        </header>

        {/* Contenido dinámico de las rutas hijas */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
