import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import ProductDetail from "../components/ProductDetail"
import { api } from "../services/api"
import type { AvaliacoesProdutoResponse } from "../types/avaliacao"
import type { Produto } from "../types/produto"
import type { VendasProdutoResponse } from "../types/vendas"

type ProdutoDetalhesState = {
  produto: Produto | null
  avaliacoes: AvaliacoesProdutoResponse | null
  vendas: VendasProdutoResponse | null
}

export function ProdutoDetalhes() {
  const { id } = useParams()
  const [state, setState] = useState<ProdutoDetalhesState>({
    produto: null,
    avaliacoes: null,
    vendas: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    if (!id) return
    let isMounted = true
    setIsLoading(true)
    setError(undefined)

    Promise.all([
      api.get<Produto>(`/produtos/${id}`),
      api.get<VendasProdutoResponse>(`/produtos/${id}/vendas`),
      api.get<AvaliacoesProdutoResponse>(`/produtos/${id}/avaliacoes`),
    ])
      .then(([produto, vendas, avaliacoes]) => {
        if (isMounted) {
          setState({ produto, vendas, avaliacoes })
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          setError(err.message || "Erro ao carregar detalhes")
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [id])

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-8 text-slate-200">
          Carregando detalhes do produto...
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-8 text-red-200">
          {error}
        </div>
      </section>
    )
  }

  if (!state.produto || !state.avaliacoes || !state.vendas) {
    return null
  }

  const { produto, avaliacoes, vendas } = state

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/"
          className="text-xs uppercase tracking-[0.3em] text-[#e8c547]/80"
        >
          Voltar ao catalogo
        </Link>
        <div className="rounded-2xl border border-[#1f1f24] bg-[#141417] px-4 py-3 text-sm text-slate-200">
          ID {produto.id_produto}
        </div>
      </div>
      <div className="rounded-3xl border border-[#1f1f24] bg-[#0f0f12] p-6">
        <ProductDetail
          produto={produto}
          vendas={vendas}
          avaliacoes={avaliacoes}
          onEdit={() => undefined}
          onDelete={() => undefined}
        />
      </div>
    </section>
  )
}
