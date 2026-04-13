import { useEffect, useMemo, useState } from "react"

import { PageHeader } from "../components/products-admin/PageHeader"
import { ProductTable } from "../components/products-admin/ProductTable"
import { SearchBar } from "../components/products-admin/SearchBar"
import { api } from "../services/api"
import type { AvaliacoesProdutoResponse } from "../types/avaliacao"
import type { Produto } from "../types/produto"
import type { VendasProdutoResponse } from "../types/vendas"
import type { Product } from "../types/product-admin"

export function ProdutosAdmin() {
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setError(undefined)

    api
      .get<Produto[]>("/produtos")
      .then(async (produtosResponse) => {
        const precos = await api.get<Record<string, number>>("/produtos/precos")

        const detalhes = await Promise.all(
          produtosResponse.map(async (produto) => {
            const [vendas, avaliacoes] = await Promise.all([
              api.get<VendasProdutoResponse>(`/produtos/${produto.id_produto}/vendas`),
              api.get<AvaliacoesProdutoResponse>(
                `/produtos/${produto.id_produto}/avaliacoes`
              ),
            ])

            return {
              id: produto.id_produto,
              nome: produto.nome_produto,
              categoria: produto.categoria_produto,
              preco: precos[produto.id_produto] ?? 0,
              vendedor: "—",
              avaliacao_media: avaliacoes.media,
              estoque: vendas.total_vendas,
            }
          })
        )

        if (isMounted) {
          setProducts(detalhes)
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          setError(err.message || "Erro ao carregar produtos")
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
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return products
    return products.filter((product) =>
      product.nome.toLowerCase().includes(term)
    )
  }, [products, search])

  return (
    <section className="mx-auto w-full max-w-6xl space-y-8 px-4 pb-16 sm:px-6">
      <PageHeader title="Produtos" onAdd={() => undefined} />
      <SearchBar value={search} onChange={setSearch} />
      {error ? (
        <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-8 text-red-200">
          {error}
        </div>
      ) : (
        <ProductTable
          products={filtered}
          isLoading={isLoading}
          onEdit={() => undefined}
          onDelete={() => undefined}
          onView={() => undefined}
        />
      )}
    </section>
  )
}
