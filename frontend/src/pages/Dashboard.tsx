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
    <div className={`theme-surface rounded-3xl border p-5 shadow-lg shadow-black/10 ${className ?? ""}`}>
      <p className="theme-text-muted text-xs uppercase tracking-[0.3em]">{label}</p>
      <p className="theme-text-primary mt-3 wrap-break-word text-2xl font-semibold sm:text-3xl">{value}</p>
      {helper ? <p className="theme-text-muted mt-2 text-sm">{helper}</p> : null}
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
    <section className="theme-surface rounded-3xl border p-6 shadow-lg shadow-black/10">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="theme-text-primary text-lg font-semibold">{title}</h2>
          {subtitle ? <p className="theme-text-muted mt-1 text-sm">{subtitle}</p> : null}
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
        <div className="theme-surface-muted rounded-3xl border p-8">
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
      <div className="theme-surface-muted rounded-3xl border p-4 sm:p-5">
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
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Top 10 Mais Vendidos" subtitle="Produtos com maior volume de vendas agregado no backend">
          <div className="space-y-3">
            {state.topVendas.map((item, index) => (
              <div key={item.id_produto} className="theme-surface-muted rounded-2xl border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="theme-text-accent text-xs uppercase tracking-[0.3em]">#{index + 1}</p>
                    <h3 className="theme-text-primary mt-2 text-base font-semibold">{item.nome_produto}</h3>
                    <p className="theme-text-muted mt-1 text-sm">{item.categoria_produto}</p>
                  </div>
                  <div className="theme-text-primary text-right text-sm">
                    <p>{item.total_vendas} vendas</p>
                    <p className="theme-text-accent mt-1">{currency.format(item.receita_total)}</p>
                    <p className="theme-text-muted mt-1">Medio {currency.format(item.preco_medio)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Top 10 Mais Bem Avaliados" subtitle="Classificacao por media e volume de avaliacoes">
          <div className="space-y-3">
            {state.topAvaliados.map((item, index) => (
              <div key={item.id_produto} className="theme-surface-muted rounded-2xl border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="theme-text-accent text-xs uppercase tracking-[0.3em]">#{index + 1}</p>
                    <h3 className="theme-text-primary mt-2 text-base font-semibold">{item.nome_produto}</h3>
                    <p className="theme-text-muted mt-1 text-sm">{item.categoria_produto}</p>
                  </div>
                  <div className="theme-text-primary text-right text-sm">
                    <p className="theme-text-accent">{item.avaliacao_media.toFixed(2)}</p>
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
                  <span className="theme-text-primary font-medium">{categoria.categoria_produto}</span>
                  <span className="theme-text-muted">
                    {categoria.total_produtos} produtos • {categoria.total_vendas} vendas
                  </span>
                </div>
                <div className="theme-surface-muted h-3 overflow-hidden rounded-full border">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-(--primary) to-(--positive)"
                    style={{ width: `${(categoria.total_produtos / maxCategoriaProdutos) * 100}%` }}
                  />
                </div>
                <p className="theme-text-muted text-right text-xs uppercase tracking-[0.3em]">
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
                <div className="theme-text-primary flex items-center justify-between gap-4 text-sm">
                  <span>{item.mes}</span>
                  <span>{currency.format(item.receita_total)}</span>
                </div>
                <div className="theme-surface-muted h-2 overflow-hidden rounded-full border">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-(--primary) to-(--positive)"
                    style={{ width: `${(item.receita_total / maxReceitaMensal) * 100}%` }}
                  />
                </div>
                <p className="theme-text-muted text-xs uppercase tracking-[0.3em]">
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
