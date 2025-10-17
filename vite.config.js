import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path" // 👈 necesario para resolver rutas

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  server: {
    port: 3000,
  },
})
