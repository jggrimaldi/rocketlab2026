import { useEffect, useState } from "react"

import { api } from "../services/api"

type DashboardResumo = {
  total_produtos: number
  total_consumidores: number
  total_pedidos: number
  receita_total: number
  avaliacao_media_geral: number
}

type DashboardTopVenda = {
  id_produto: string
  nome_produto: string
  categoria_produto: string
  total_vendas: number
  receita_total: number
  preco_medio: number
}

type DashboardTopAvaliado = {
  id_produto: string
  nome_produto: string
  categoria_produto: string
  avaliacao_media: number
  total_avaliacoes: number
}

type DashboardCategoria = {
  categoria_produto: string
  total_produtos: number
  total_vendas: number
  receita_total: number
}

type DashboardReceitaMensal = {
  mes: string
  total_pedidos: number
  receita_total: number
}

type DashboardState = {
  resumo: DashboardResumo | null
  topVendas: DashboardTopVenda[]
  topAvaliados: DashboardTopAvaliado[]
  categorias: DashboardCategoria[]
  receitaMensal: DashboardReceitaMensal[]
}

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

function MetricCard({
  label,
  value,
  helper,
  className,
}: {
  label: string
  value: string
  helper?: string
  className?: string
}) {
  return (
    <div className={`rounded-3xl border border-[#1f1f24] bg-[#141417] p-5 shadow-lg shadow-black/20 ${className ?? ""}`}>
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
      <p className="mt-3 break-words text-2xl font-semibold text-slate-50 sm:text-3xl">{value}</p>
      {helper ? <p className="mt-2 text-sm text-slate-400">{helper}</p> : null}
    </div>
  )
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-[#1f1f24] bg-[#141417] p-6 shadow-lg shadow-black/20">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  )
}

export function Dashboard() {
  const [state, setState] = useState<DashboardState>({
    resumo: null,
    topVendas: [],
    topAvaliados: [],
    categorias: [],
    receitaMensal: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    const controller = new AbortController()
    setIsLoading(true)
    setError(undefined)

    Promise.all([
      api.get<DashboardResumo>("/dashboard/resumo", { signal: controller.signal }),
      api.get<DashboardTopVenda[]>("/dashboard/top-vendas", { signal: controller.signal }),
      api.get<DashboardTopAvaliado[]>("/dashboard/top-avaliados", { signal: controller.signal }),
      api.get<DashboardCategoria[]>("/dashboard/categorias", { signal: controller.signal }),
      api.get<DashboardReceitaMensal[]>("/dashboard/receita-mensal", { signal: controller.signal }),
    ])
      .then(([resumo, topVendas, topAvaliados, categorias, receitaMensal]) => {
        setState({ resumo, topVendas, topAvaliados, categorias, receitaMensal })
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") {
          setError(err.message || "Erro ao carregar dashboard")
        }
      })
      .finally(() => {
        setIsLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [])

  if (isLoading || (!state.resumo && !error)) {
    return (
      <section className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-16 pt-6 sm:px-6">
        <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-8 text-slate-200">
          Carregando dashboard...
        </div>
      </section>
    )
  }

  if (error || !state.resumo) {
    return (
      <section className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-16 pt-6 sm:px-6">
        <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-8 text-red-200">
          {error || "Erro ao carregar dashboard"}
        </div>
      </section>
    )
  }

  const maxCategoriaProdutos = Math.max(
    ...state.categorias.map((categoria) => categoria.total_produtos),
    1,
  )
  const maxReceitaMensal = Math.max(
    ...state.receitaMensal.map((item) => item.receita_total),
    1,
  )

  return (
    <section className="mx-auto w-full max-w-6xl space-y-8 px-4 pb-16 pt-6 sm:px-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Produtos" value={state.resumo.total_produtos.toLocaleString("pt-BR")} />
        <MetricCard label="Consumidores" value={state.resumo.total_consumidores.toLocaleString("pt-BR")} />
        <MetricCard label="Pedidos" value={state.resumo.total_pedidos.toLocaleString("pt-BR")} />
        <MetricCard
          label="Receita Total"
          value={currency.format(state.resumo.receita_total)}
          className="sm:col-span-2 xl:col-span-1"
        />
        <MetricCard
          label="Avaliacao Media"
          value={state.resumo.avaliacao_media_geral.toFixed(2)}
          helper="Media consolidada das avaliacoes"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Top 10 Mais Vendidos" subtitle="Produtos com maior volume de vendas agregado no backend">
          <div className="space-y-3">
            {state.topVendas.map((item, index) => (
              <div key={item.id_produto} className="rounded-2xl border border-[#1f1f24] bg-[#0f0f12] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#e8c547]">#{index + 1}</p>
                    <h3 className="mt-2 text-base font-semibold text-slate-50">{item.nome_produto}</h3>
                    <p className="mt-1 text-sm text-slate-400">{item.categoria_produto}</p>
                  </div>
                  <div className="text-right text-sm text-slate-300">
                    <p>{item.total_vendas} vendas</p>
                    <p className="mt-1 text-[#e8c547]">{currency.format(item.receita_total)}</p>
                    <p className="mt-1 text-slate-500">Medio {currency.format(item.preco_medio)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Top 10 Mais Bem Avaliados" subtitle="Classificacao por media e volume de avaliacoes">
          <div className="space-y-3">
            {state.topAvaliados.map((item, index) => (
              <div key={item.id_produto} className="rounded-2xl border border-[#1f1f24] bg-[#0f0f12] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#e8c547]">#{index + 1}</p>
                    <h3 className="mt-2 text-base font-semibold text-slate-50">{item.nome_produto}</h3>
                    <p className="mt-1 text-sm text-slate-400">{item.categoria_produto}</p>
                  </div>
                  <div className="text-right text-sm text-slate-300">
                    <p className="text-[#e8c547]">{item.avaliacao_media.toFixed(2)}</p>
                    <p className="mt-1">{item.total_avaliacoes} avaliacoes</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Distribuicao por Categoria" subtitle="Top categorias por quantidade de produtos">
          <div className="space-y-4">
            {state.categorias.map((categoria) => (
              <div key={categoria.categoria_produto} className="space-y-2">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium text-slate-200">{categoria.categoria_produto}</span>
                  <span className="text-slate-400">
                    {categoria.total_produtos} produtos • {categoria.total_vendas} vendas
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[#0f0f12]">
                  <div
                    className="h-full rounded-full bg-[#e8c547]"
                    style={{ width: `${(categoria.total_produtos / maxCategoriaProdutos) * 100}%` }}
                  />
                </div>
                <p className="text-right text-xs uppercase tracking-[0.3em] text-slate-500">
                  {currency.format(categoria.receita_total)}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Receita Mensal" subtitle="Ultimos meses agregados por data de compra">
          <div className="space-y-4">
            {state.receitaMensal.map((item) => (
              <div key={item.mes} className="space-y-2">
                <div className="flex items-center justify-between gap-4 text-sm text-slate-300">
                  <span>{item.mes}</span>
                  <span>{currency.format(item.receita_total)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#0f0f12]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#e8c547] to-amber-300"
                    style={{ width: `${(item.receita_total / maxReceitaMensal) * 100}%` }}
                  />
                </div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {item.total_pedidos} pedidos
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </section>
  )
}
