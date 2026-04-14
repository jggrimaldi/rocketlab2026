import { useEffect, useState } from "react"
import { NavLink } from "react-router-dom"
import {
  ChartColumn,
  LayoutGrid,
  Menu,
  Palette,
  Plus,
  X,
} from "lucide-react"

const navItems = [
  { label: "Dashboard", icon: ChartColumn, path: "/dashboard" },
  { label: "Catalogo", icon: LayoutGrid, path: "/" },
  { label: "Produtos", icon: Plus, path: "/produtos" },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  const closeMenu = () => setIsOpen(false)

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("rocketlab-theme") as "dark" | "light" | null
    const nextTheme = savedTheme ?? "dark"
    setTheme(nextTheme)
    document.documentElement.dataset.theme = nextTheme
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark"
    setTheme(nextTheme)
    document.documentElement.dataset.theme = nextTheme
    window.localStorage.setItem("rocketlab-theme", nextTheme)
  }

  return (
    <>
      <header className="theme-surface fixed left-0 top-0 z-40 flex h-14 w-full items-center justify-between border-b px-4 lg:hidden">
        <div className="w-9" />
        <div className="theme-text-primary flex items-center gap-2 text-sm font-semibold">
          <div className="theme-bg-accent-soft theme-text-accent grid h-8 w-8 place-items-center rounded-xl">
            RL
          </div>
          Rocketlab Admin
        </div>
        <button
          className="theme-button-secondary rounded-full border p-2"
          onClick={() => setIsOpen(true)}
          type="button"
          aria-label="Abrir menu"
        >
          <Menu size={18} />
        </button>
      </header>

      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMenu}
          role="button"
          tabIndex={0}
          aria-label="Fechar menu"
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") closeMenu()
          }}
        />
      ) : null}

      <aside
        className={`theme-surface fixed left-0 top-0 z-50 flex h-full w-60 flex-col gap-6 border-r px-5 py-6 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="theme-bg-accent-soft theme-text-accent grid h-10 w-10 place-items-center rounded-2xl font-semibold ring-1 ring-black/5">
              RL
            </div>
            <div>
              <p className="theme-text-accent text-xs uppercase tracking-[0.35em] opacity-80">
                Rocketlab
              </p>
              <p className="theme-text-primary text-lg font-semibold">Admin</p>
            </div>
          </div>
          <button
            className="theme-button-secondary rounded-full border p-2 lg:hidden"
            onClick={closeMenu}
            type="button"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "theme-nav-active"
                      : "theme-nav-idle"
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <button
          className="theme-button-secondary flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-xs"
          onClick={toggleTheme}
          type="button"
        >
          <span className="flex items-center gap-3">
            <Palette size={16} />
            <span className="theme-text-primary">Tema</span>
          </span>
          <span className="theme-text-accent rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.3em]">
            {theme === "dark" ? "Claro" : "Escuro"}
          </span>
        </button>

        <div className="theme-surface-muted flex items-center justify-between rounded-2xl border px-4 py-3 text-xs">
          <span>Gerente</span>
          <span className="theme-bg-accent-soft theme-text-accent rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.3em]">
            Admin
          </span>
        </div>
      </aside>
    </>
  )
}
