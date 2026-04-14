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
    <tr className="theme-border theme-text-primary border-b text-sm hover:bg-[color:var(--panel-muted)]">
      <td className="px-4 py-4 font-semibold">{produto.nome}</td>
      <td className="theme-text-muted px-4 py-4">{produto.categoria}</td>
      <td className="theme-text-accent px-4 py-4">
        {produto.preco.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </td>
      <td className="px-4 py-4">{estoque}</td>
      <td className="px-4 py-4">{produto.vendedor}</td>
      <td className="theme-text-accent px-4 py-4">
        {renderStars(produto.avaliacao_media)}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          {onView ? (
            <button
              className="theme-button-secondary rounded-full border p-2 transition hover:border-[color:var(--primary)]/60 hover:text-[color:var(--primary)]"
              onClick={() => onView(produto)}
              type="button"
            >
              <Eye size={16} />
            </button>
          ) : null}
          <button
            className="theme-button-secondary rounded-full border p-2 transition hover:border-[color:var(--primary)]/60 hover:text-[color:var(--primary)]"
            onClick={() => onEdit(produto)}
            type="button"
          >
            <Pencil size={16} />
          </button>
          <button
            className="rounded-full border border-red-400/40 bg-red-500/10 p-2 text-red-300 transition hover:border-red-400/70"
            onClick={() => onDelete(produto)}
            type="button"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  )
}
