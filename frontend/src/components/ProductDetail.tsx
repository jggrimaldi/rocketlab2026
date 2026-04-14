type Produto = {
  id_produto: string
  nome_produto: string
  categoria_produto: string
  preco: number | null
  peso_produto_gramas: number | null
  comprimento_centimetros: number | null
  altura_centimetros: number | null
  largura_centimetros: number | null
}

type Vendas = {
  total_vendas: number
  receita_total: number
  receita_frete: number
}

type Avaliacao = {
  id_avaliacao: string
  avaliacao: number
  titulo_comentario: string | null
  comentario: string | null
  data_comentario: string | null
}

type AvaliacoesSummary = {
  media: number
  total_avaliacoes: number
  avaliacoes: Avaliacao[]
}

type ProductDetailProps = {
  produto: Produto
  vendas: Vendas
  avaliacoes: AvaliacoesSummary
  imageUrl?: string
  onEdit: () => void
  onDelete: () => void
}

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

function renderStars(nota: number) {
  const value = Math.max(0, Math.min(5, Math.round(nota)))
  return "★".repeat(value) + "☆".repeat(5 - value)
}

function formatPeso(peso: number | null) {
  if (peso === null || peso === undefined) return "—"
  if (peso >= 1000) return `${(peso / 1000).toFixed(1)} kg`
  return `${peso.toFixed(0)} g`
}

function formatMedida(valor: number | null) {
  if (valor === null || valor === undefined) return "—"
  return `${valor} cm`
}

export default function ProductDetail({
  produto,
  vendas,
  avaliacoes,
  imageUrl,
  onEdit,
  onDelete,
}: ProductDetailProps) {
  const averagePrice = vendas.total_vendas
    ? vendas.receita_total / vendas.total_vendas
    : (produto.preco ?? 0)
  const categoria = produto.categoria_produto || "—"
  const initials = categoria
    .split("_")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_1.2fr] lg:gap-8">
        <div className="theme-surface flex min-h-55 items-center justify-center overflow-hidden rounded-3xl border sm:min-h-70">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={produto.nome_produto}
              className="h-full min-h-55 w-full object-cover sm:min-h-70"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="theme-surface-muted theme-text-accent flex h-24 w-24 items-center justify-center rounded-full border text-2xl font-semibold uppercase tracking-[0.3em]">
              {initials || "CT"}
            </div>
          )}
        </div>

        <div className="space-y-5 sm:space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="theme-bg-accent-soft theme-text-accent rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]">
              {categoria.replaceAll("_", " ")}
            </span>
            <span className="rounded-full bg-(--positive)/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-(--positive)">
              Em estoque
            </span>
          </div>

          <div>
            <p className="theme-text-muted break-all text-xs uppercase tracking-[0.25em] sm:text-sm sm:tracking-[0.35em]">
              {produto.id_produto}
            </p>
            <h2 className="theme-text-primary mt-3 wrap-break-word text-2xl font-semibold sm:text-3xl">
              {produto.nome_produto || "—"}
            </h2>
            <p className="theme-text-accent mt-2 text-xl font-semibold sm:text-2xl">
              {currency.format(averagePrice)}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="theme-surface rounded-2xl border p-4">
              <p className="theme-text-muted text-xs uppercase tracking-[0.3em]">Vendas</p>
              <p className="theme-text-primary mt-2 text-xl font-semibold">
                {vendas.total_vendas}
              </p>
            </div>
            <div className="theme-surface rounded-2xl border p-4">
              <p className="theme-text-muted text-xs uppercase tracking-[0.3em]">Avaliacao</p>
              <p className="theme-text-primary mt-2 text-xl font-semibold">
                {avaliacoes.media.toFixed(2)}
              </p>
              <p className="theme-text-accent mt-1 text-xs">
                {renderStars(avaliacoes.media)}
              </p>
            </div>
            <div className="theme-surface rounded-2xl border p-4">
              <p className="theme-text-muted text-xs uppercase tracking-[0.3em]">Estoque</p>
              <p className="theme-text-primary mt-2 text-xl font-semibold">0</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="theme-surface rounded-2xl border p-4">
              <p className="theme-text-muted text-xs uppercase tracking-[0.3em]">Peso</p>
              <p className="theme-text-primary mt-2 text-base font-semibold">
                {formatPeso(produto.peso_produto_gramas)}
              </p>
            </div>
            <div className="theme-surface rounded-2xl border p-4">
              <p className="theme-text-muted text-xs uppercase tracking-[0.3em]">Altura</p>
              <p className="theme-text-primary mt-2 text-base font-semibold">
                {formatMedida(produto.altura_centimetros)}
              </p>
            </div>
            <div className="theme-surface rounded-2xl border p-4">
              <p className="theme-text-muted text-xs uppercase tracking-[0.3em]">Largura</p>
              <p className="theme-text-primary mt-2 text-base font-semibold">
                {formatMedida(produto.largura_centimetros)}
              </p>
            </div>
            <div className="theme-surface rounded-2xl border p-4">
              <p className="theme-text-muted text-xs uppercase tracking-[0.3em]">Comprimento</p>
              <p className="theme-text-primary mt-2 text-base font-semibold">
                {formatMedida(produto.comprimento_centimetros)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              className="theme-button-secondary w-full rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition sm:w-auto"
              onClick={onEdit}
              type="button"
            >
              Editar
            </button>
            <button
              className="w-full rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 shadow-sm transition hover:border-red-400/60 sm:w-auto"
              onClick={onDelete}
              type="button"
            >
              Remover
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="theme-text-primary text-lg font-semibold sm:text-xl">Ultimas avaliacoes</h3>
          <span className="theme-surface-muted theme-text-muted w-fit rounded-full border px-3 py-1 text-xs uppercase tracking-[0.3em]">
            {avaliacoes.total_avaliacoes} registros
          </span>
        </div>

        {avaliacoes.avaliacoes.length === 0 ? (
           <div className="theme-surface rounded-2xl border p-6 text-sm theme-text-muted">
             Nenhuma avaliacao ainda
           </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {avaliacoes.avaliacoes.slice(0, 3).map((avaliacao) => (
              <div
                key={avaliacao.id_avaliacao}
                className="theme-surface rounded-2xl border p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="theme-text-primary text-sm font-semibold">Consumidor</p>
                  <span className="theme-text-accent text-xs">
                    {renderStars(avaliacao.avaliacao)}
                  </span>
                </div>
                <p className="theme-text-primary mt-3 text-sm">
                  {avaliacao.comentario || "—"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
