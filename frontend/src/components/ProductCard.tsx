import type { ProdutoListItem } from "../types/produto"

type ProductCardProps = {
  produto: ProdutoListItem
  imageUrl?: string
  onSelect: (produto: ProdutoListItem) => void
}

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

function formatRating(value: number) {
  return value > 0 ? value.toFixed(1) : "Sem avaliacoes"
}

export function ProductCard({ produto, imageUrl, onSelect }: ProductCardProps) {
  const formattedPrice = currency.format(produto.preco)

  return (
    <button
      onClick={() => onSelect(produto)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#1f1f24] bg-[#141417] shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:border-[#e8c547]/50"
      type="button"
    >
      <div className="relative h-48 w-full overflow-hidden bg-[#0d0d0f] sm:h-52">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={produto.nome_produto}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.3em] text-slate-500">
            Imagem indisponivel
          </div>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-[#e8c547]/15 px-3 py-1 text-xs font-semibold text-[#e8c547]">
          Ativo
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-50">
            {produto.nome_produto}
          </h3>
          <p className="mt-1 text-sm text-slate-400">{produto.categoria_produto}</p>
          <p className="mt-3 text-base font-semibold text-[#e8c547]">
            {formattedPrice}
          </p>
        </div>
        <div className="space-y-2 text-sm text-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Vendedor</span>
            <span className="max-w-[11rem] truncate text-right">{produto.nome_vendedor}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Avaliacao</span>
            <span>{formatRating(produto.avaliacao_media)}</span>
          </div>
        </div>
        <span className="mt-auto text-xs uppercase tracking-[0.3em] text-slate-500">
          Abrir detalhes
        </span>
      </div>
    </button>
  )
}
