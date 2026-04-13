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
      <div className="rounded-3xl border border-[#1f1f24] bg-[#141417] p-8 text-slate-200">
        Carregando produtos...
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-[#1f1f24] bg-[#141417] p-8 text-slate-400">
        Nenhum produto encontrado
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-[#1f1f24] bg-[#141417]">
      <table className="min-w-full border-collapse text-left">
        <thead className="bg-[#0f0f12] text-xs uppercase tracking-[0.3em] text-slate-500">
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
  )
}
