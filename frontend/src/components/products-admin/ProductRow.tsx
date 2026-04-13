import { Eye, Pencil, Trash2 } from "lucide-react"

import type { Product } from "../../types/product-admin"

type ProductRowProps = {
  produto: Product
  onEdit: (produto: Product) => void
  onDelete: (produto: Product) => void
  onView?: (produto: Product) => void
}

function renderStars(value: number) {
  const rounded = Math.max(0, Math.min(5, value))
  return `★ ${rounded.toFixed(1)}`
}

export function ProductRow({ produto, onEdit, onDelete, onView }: ProductRowProps) {
  const estoque = produto.estoque ?? 0

  return (
    <tr className="border-b border-[#1f1f24] text-sm text-slate-200 hover:bg-[#141417]">
      <td className="px-4 py-4 font-semibold text-slate-50">{produto.nome}</td>
      <td className="px-4 py-4 text-slate-400">{produto.categoria}</td>
      <td className="px-4 py-4 text-[#e8c547]">
        {produto.preco.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </td>
      <td className="px-4 py-4 text-slate-300">{estoque}</td>
      <td className="px-4 py-4 text-slate-300">{produto.vendedor}</td>
      <td className="px-4 py-4 text-[#e8c547]">
        {renderStars(produto.avaliacao_media)}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          {onView ? (
            <button
              className="rounded-full border border-[#1f1f24] bg-[#0d0d0f] p-2 text-slate-200 transition hover:border-[#e8c547]/60 hover:text-[#e8c547]"
              onClick={() => onView(produto)}
              type="button"
            >
              <Eye size={16} />
            </button>
          ) : null}
          <button
            className="rounded-full border border-[#1f1f24] bg-[#0d0d0f] p-2 text-slate-200 transition hover:border-[#e8c547]/60 hover:text-[#e8c547]"
            onClick={() => onEdit(produto)}
            type="button"
          >
            <Pencil size={16} />
          </button>
          <button
            className="rounded-full border border-red-400/40 bg-red-500/10 p-2 text-red-300 transition hover:border-red-400/70"
            onClick={() => {
              const confirmed = window.confirm(
                `Remover o produto "${produto.nome}"?`
              )
              if (confirmed) onDelete(produto)
            }}
            type="button"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  )
}
