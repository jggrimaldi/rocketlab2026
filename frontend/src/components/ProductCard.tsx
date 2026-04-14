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
  const resolvedImageUrl = produto.imagem_url ?? imageUrl

  return (
    <button
      onClick={() => onSelect(produto)}
      className="group flex h-full w-full max-w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#1f1f24] bg-[#141417] text-left shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:border-[#e8c547]/50"
      type="button"
    >
      <div className="relative h-28 w-full overflow-hidden bg-[#0d0d0f] sm:h-40 lg:h-52">
        {resolvedImageUrl ? (
          <img
            src={resolvedImageUrl}
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
        <span className="absolute right-2 top-2 rounded-full bg-[#e8c547]/15 px-2 py-1 text-[9px] font-semibold text-[#e8c547] sm:right-3 sm:top-3 sm:px-3 sm:text-xs">
          Ativo
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-3 sm:gap-4 sm:p-5">
        <div>
          <h3 className="line-clamp-2 break-words text-sm font-semibold text-slate-50 sm:text-lg">
            {produto.nome_produto}
          </h3>
          <p className="mt-1 line-clamp-2 break-words text-[11px] text-slate-400 sm:text-sm">{produto.categoria_produto}</p>
          <p className="mt-2 text-xs font-semibold text-[#e8c547] sm:mt-3 sm:text-base">
            {formattedPrice}
          </p>
        </div>
        <div className="space-y-1.5 text-[11px] text-slate-200 sm:space-y-2 sm:text-sm">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 sm:text-xs sm:tracking-[0.3em]">Vendedor</span>
            <span className="max-w-[6rem] truncate text-right sm:max-w-[11rem]">{produto.nome_vendedor}</span>
          </div>
          <div className="flex min-w-0 items-center justify-between gap-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 sm:text-xs sm:tracking-[0.3em]">Avaliacao</span>
            <span>{formatRating(produto.avaliacao_media)}</span>
          </div>
        </div>
        <span className="mt-auto text-[10px] uppercase tracking-[0.2em] text-slate-500 sm:text-xs sm:tracking-[0.3em]">
          Abrir detalhes
        </span>
      </div>
    </button>
  )
}
