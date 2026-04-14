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
      className="theme-surface group flex h-full w-full max-w-full min-w-0 flex-col overflow-hidden rounded-2xl border text-left shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-(--primary)/50"
      type="button"
    >
      <div className="theme-surface-muted relative h-28 w-full overflow-hidden sm:h-40 lg:h-52">
        {resolvedImageUrl ? (
          <img
            src={resolvedImageUrl}
            alt={produto.nome_produto}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="theme-text-muted flex h-full items-center justify-center text-xs uppercase tracking-[0.3em]">
            Imagem indisponivel
          </div>
        )}
        <span className="theme-bg-accent-soft theme-text-accent absolute right-2 top-2 rounded-full px-2 py-1 text-[9px] font-semibold sm:right-3 sm:top-3 sm:px-3 sm:text-xs">
          Ativo
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-3 sm:gap-4 sm:p-5">
        <div>
          <h3 className="theme-text-primary line-clamp-2 wrap-break-word text-sm font-semibold sm:text-lg">
            {produto.nome_produto}
          </h3>
          <p className="theme-text-muted mt-1 line-clamp-2 wrap-break-word text-[11px] sm:text-sm">{produto.categoria_produto}</p>
          <p className="theme-text-accent mt-2 text-xs font-semibold sm:mt-3 sm:text-base">
            {formattedPrice}
          </p>
        </div>
        <div className="theme-text-primary space-y-1.5 text-[11px] sm:space-y-2 sm:text-sm">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <span className="theme-text-muted text-[10px] uppercase tracking-[0.2em] sm:text-xs sm:tracking-[0.3em]">Vendedor</span>
            <span className="max-w-24 truncate text-right sm:max-w-44">{produto.nome_vendedor}</span>
          </div>
          <div className="flex min-w-0 items-center justify-between gap-3">
            <span className="theme-text-muted text-[10px] uppercase tracking-[0.2em] sm:text-xs sm:tracking-[0.3em]">Avaliacao</span>
            <span>{formatRating(produto.avaliacao_media)}</span>
          </div>
        </div>
        <span className="theme-text-muted mt-auto text-[10px] uppercase tracking-[0.2em] sm:text-xs sm:tracking-[0.3em]">
          Abrir detalhes
        </span>
      </div>
    </button>
  )
}
