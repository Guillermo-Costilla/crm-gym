import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: "dark",
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === "dark" ? "light" : "dark"
          // Aplicar el tema al documento
          if (typeof document !== "undefined") {
            document.documentElement.classList.remove("dark", "light")
            document.documentElement.classList.add(newTheme)
          }
          return { theme: newTheme }
        }),
      setTheme: (theme) =>
        set(() => {
          // Aplicar el tema al documento
          if (typeof document !== "undefined") {
            document.documentElement.classList.remove("dark", "light")
            document.documentElement.classList.add(theme)
          }
          return { theme }
        }),
    }),
    {
      name: "gym-crm-theme",
    },
  ),
)
