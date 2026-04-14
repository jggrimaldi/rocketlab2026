import type { ProdutoListItem } from "../types/produto"
import { ProductCard } from "./ProductCard"

type ProductGridProps = {
  produtos: ProdutoListItem[]
  isLoading: boolean
  error?: string
  categoryImages: Record<string, string>
  onSelectProduct: (produto: ProdutoListItem) => void
}

export function ProductGrid({
  produtos,
  isLoading,
  error,
  categoryImages,
  onSelectProduct,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="mt-8 space-y-4">
        <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-4 text-sm text-slate-300">
          Carregando produtos...
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/40 animate-pulse"
            >
              <div className="h-32 w-full bg-slate-800/60 sm:h-40 lg:h-52" />
              <div className="space-y-3 p-4 sm:p-5">
                <div className="h-3 w-24 rounded bg-slate-800/60" />
                <div className="h-5 w-3/4 rounded bg-slate-700/60" />
                <div className="h-4 w-1/2 rounded bg-slate-800/60" />
                <div className="h-4 w-2/5 rounded bg-slate-800/60" />
                <div className="h-4 w-3/5 rounded bg-slate-800/60" />
              </div>
            </div>
          ))}
        </div>
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
        Carregando produtos...
      </div>
    )
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {produtos.map((produto) => (
        <ProductCard
          key={produto.id_produto}
          produto={produto}
          imageUrl={categoryImages[produto.categoria_produto]}
          onSelect={onSelectProduct}
        />
      ))}
    </div>
  )
}
