type HeaderProps = {
  onNewProduct?: () => void
}

export function Header({ onNewProduct }: HeaderProps) {
  return (
    <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-400/40 font-semibold">
          RL
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/70">
            Rocketlab
          </p>
          <p className="text-lg font-semibold text-slate-50">Painel do gerente</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="rounded-full border border-slate-700/60 bg-slate-900/60 px-4 py-2 text-sm text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200">
          Exportar relatorio
        </button>
        <button
          className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5"
          onClick={onNewProduct}
          type="button"
        >
          Novo produto
        </button>
      </div>
    </header>
  )
}
