import { BrowserRouter, Route, Routes } from "react-router-dom"

import Sidebar from "./components/Sidebar"
import { ProdutoDetalhes } from "./pages/ProdutoDetalhes"
import { Produtos } from "./pages/Produtos"
import { ProdutosAdmin } from "./pages/ProdutosAdmin"

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#0d0d0f] text-slate-100">
        <Sidebar />
        <main className="flex-1 pt-14 lg:pt-0">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(232,197,71,0.18),_transparent_55%),radial-gradient(circle_at_30%_80%,_rgba(232,197,71,0.12),_transparent_45%),linear-gradient(120deg,_rgba(13,13,15,0.98),_rgba(9,9,11,0.95))]" />
            <section className="relative mx-auto w-full max-w-6xl px-6 pb-6 pt-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-[#e8c547]/70">
                    Catalogo
                  </p>
                  <h1 className="mt-3 text-3xl font-semibold text-slate-50">
                    Produtos
                  </h1>
                </div>
                <button className="rounded-full bg-[#e8c547] px-4 py-2 text-sm font-semibold text-[#0d0d0f] shadow-lg shadow-[#e8c547]/30 transition hover:-translate-y-0.5">
                  Novo produto
                </button>
              </div>
            </section>
          </div>

          <Routes>
            <Route path="/" element={<Produtos />} />
            <Route path="/produtos" element={<ProdutosAdmin />} />
            <Route path="/produtos/:id" element={<ProdutoDetalhes />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
