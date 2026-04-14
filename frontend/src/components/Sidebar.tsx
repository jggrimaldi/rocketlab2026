import { useState } from "react"
import { NavLink } from "react-router-dom"
import {
  ChartColumn,
  LayoutGrid,
  Menu,
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

  const closeMenu = () => setIsOpen(false)

  return (
    <>
      <header className="fixed left-0 top-0 z-40 flex h-14 w-full items-center justify-between border-b border-[#1f1f24] bg-[#0d0d0f] px-4 lg:hidden">
        <div className="w-9" />
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#e8c547]/15 text-[#e8c547]">
            RL
          </div>
          Rocketlab Admin
        </div>
        <button
          className="rounded-full border border-[#2a2a31] p-2 text-slate-200"
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
        className={`fixed left-0 top-0 z-50 flex h-full w-60 flex-col gap-6 border-r border-[#1f1f24] bg-[#0d0d0f] px-5 py-6 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e8c547]/15 text-[#e8c547] ring-1 ring-[#e8c547]/40 font-semibold">
              RL
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#e8c547]/70">
                Rocketlab
              </p>
              <p className="text-lg font-semibold text-slate-50">Admin</p>
            </div>
          </div>
          <button
            className="rounded-full border border-[#2a2a31] p-2 text-slate-200 lg:hidden"
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
                      ? "bg-[#e8c547]/15 text-[#e8c547]"
                      : "text-slate-300 hover:bg-[#141417]"
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="flex items-center justify-between rounded-2xl border border-[#1f1f24] bg-[#141417] px-4 py-3 text-xs text-slate-300">
          <span>Gerente</span>
          <span className="rounded-full bg-[#e8c547]/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#e8c547]">
            Admin
          </span>
        </div>
      </aside>
    </>
  )
}
