import type { Produto } from "../types/produto"
import { ProductCard } from "./ProductCard"

type ProductGridProps = {
  produtos: Produto[]
  isLoading: boolean
  error?: string
  categoryImages: Record<string, string>
  pricesByProduct: Record<string, number>
}

export function ProductGrid({
  produtos,
  isLoading,
  error,
  categoryImages,
  pricesByProduct,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="mt-8 rounded-3xl border border-slate-800/70 bg-slate-900/40 p-8 text-slate-200">
        Carregando produtos...
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-8 rounded-3xl border border-red-500/40 bg-red-500/10 p-8 text-red-200">
        {error}
      </div>
    )
  }

  if (produtos.length === 0) {
    return (
      <div className="mt-8 rounded-3xl border border-slate-800/70 bg-slate-900/40 p-8 text-slate-200">
        Nenhum produto encontrado.
      </div>
    )
  }

  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {produtos.map((produto) => (
        <ProductCard
          key={produto.id_produto}
          produto={produto}
          imageUrl={categoryImages[produto.categoria_produto]}
          price={pricesByProduct[produto.id_produto]}
        />
      ))}
    </div>
  )
}
