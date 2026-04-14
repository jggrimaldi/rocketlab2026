import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"

import Sidebar from "./components/Sidebar"
import { Dashboard } from "./pages/Dashboard"
import { ProdutoDetalhes } from "./pages/ProdutoDetalhes"
import { Produtos } from "./pages/Produtos"
import { ProdutosAdmin } from "./pages/ProdutosAdmin"

const pageConfig = {
  "/": { eyebrow: "Catalogo", title: "Produtos" },
  "/dashboard": { eyebrow: "Administracao", title: "Dashboard" },
  "/produtos": { eyebrow: "Administracao", title: "Produtos" },
}

function AppContent() {
  const location = useLocation()
  const isProductDetails = location.pathname.startsWith("/produtos/")
  const header = isProductDetails
    ? { eyebrow: "Catalogo", title: "Detalhes do Produto" }
    : pageConfig[location.pathname as keyof typeof pageConfig] ?? { eyebrow: "Rocketlab", title: "Painel" }

  return (
    <div className="flex min-h-screen bg-[#0d0d0f] text-slate-100">
      <Sidebar />
      <main className="min-w-0 flex-1 pt-14 lg:pt-0">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(232,197,71,0.18),_transparent_55%),radial-gradient(circle_at_30%_80%,_rgba(232,197,71,0.12),_transparent_45%),linear-gradient(120deg,_rgba(13,13,15,0.98),_rgba(9,9,11,0.95))]" />
          <section className="relative mx-auto w-full max-w-6xl px-4 pb-6 pt-10 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#e8c547]/70">
                  {header.eyebrow}
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-slate-50">
                  {header.title}
                </h1>
              </div>
            </div>
          </section>
        </div>

        <Routes>
          <Route path="/" element={<Produtos />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/produtos" element={<ProdutosAdmin />} />
          <Route path="/produtos/:id" element={<ProdutoDetalhes />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
