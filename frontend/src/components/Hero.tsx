type HeroProps = {
  totalProdutos: number
  produtosSemCategoria: number
}

export function Hero({ totalProdutos, produtosSemCategoria }: HeroProps) {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 pb-16 pt-6">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-emerald-200/60">
            Catalogo em tempo real
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-50 md:text-5xl">
            Controle cada produto com precisao e clareza
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-200/80">
            Visao unica para o gerente: categorias, dimensoes e consistencia dos dados
            para decidir rapido.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 px-5 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Produtos</p>
              <p className="mt-2 text-2xl font-semibold text-slate-50">{totalProdutos}</p>
            </div>
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 px-5 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Sem categoria
              </p>
              <p className="mt-2 text-2xl font-semibold text-amber-200">
                {produtosSemCategoria}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 px-5 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Revisao
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-50">24</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-2xl shadow-black/30">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Filtro rapido</p>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-slate-800/60 bg-slate-950/50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Categoria</p>
              <p className="mt-2 text-sm text-slate-100">Casa, Utilidades, Decoracao</p>
            </div>
            <div className="rounded-2xl border border-slate-800/60 bg-slate-950/50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Dimensoes</p>
              <p className="mt-2 text-sm text-slate-100">Compacto, Medio, Grande</p>
            </div>
            <div className="rounded-2xl border border-slate-800/60 bg-slate-950/50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Peso</p>
              <p className="mt-2 text-sm text-slate-100">Leve, Intermediario, Pesado</p>
            </div>
          </div>
          <button className="mt-6 w-full rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200">
            Aplicar filtros
          </button>
        </div>
      </div>
    </section>
  )
}
