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
    <div className="theme-app-shell flex min-h-screen">
      <Sidebar />
      <main className="min-w-0 flex-1 pt-14 lg:pt-0">
        <div className="relative overflow-hidden">
          <div className="theme-hero-overlay absolute inset-0" />
          <section className="relative mx-auto w-full max-w-6xl px-4 pb-6 pt-10 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="theme-text-accent text-xs uppercase tracking-[0.35em] opacity-80">
                  {header.eyebrow}
                </p>
                <h1 className="theme-text-primary mt-3 text-3xl font-semibold">
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
