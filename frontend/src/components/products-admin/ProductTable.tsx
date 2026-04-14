import type { Product } from "../../types/product-admin"
import { ProductRow } from "./ProductRow"

type ProductTableProps = {
  products: Product[]
  isLoading: boolean
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onView?: (product: Product) => void
}

export function ProductTable({
  products,
  isLoading,
  onEdit,
  onDelete,
  onView,
}: ProductTableProps) {
  if (isLoading) {
    return (
        <div className="theme-surface rounded-3xl border p-8">
          Carregando produtos...
        </div>
    )
  }

  if (products.length === 0) {
    return (
        <div className="theme-surface rounded-3xl border p-8 theme-text-muted">
          Nenhum produto encontrado
        </div>
    )
  }

  return (
    <div className="space-y-3">
        <div className="theme-text-muted px-1 text-xs uppercase tracking-[0.2em] sm:hidden">
          Arraste a tabela para o lado para ver mais colunas e acoes.
        </div>
      <div className="theme-surface overflow-x-auto rounded-3xl border [-webkit-overflow-scrolling:touch]">
        <table className="min-w-[760px] border-collapse text-left sm:min-w-full">
        <thead className="theme-surface-muted theme-text-muted text-xs uppercase tracking-[0.3em]">
          <tr>
            <th className="px-4 py-4">Nome do produto</th>
            <th className="px-4 py-4">Categoria</th>
            <th className="px-4 py-4">Preco</th>
            <th className="px-4 py-4">Estoque</th>
            <th className="px-4 py-4">Vendedor</th>
            <th className="px-4 py-4">Avaliacao</th>
            <th className="px-4 py-4">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <ProductRow
              key={product.id}
              produto={product}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </tbody>
        </table>
      </div>
    </div>
  )
}
