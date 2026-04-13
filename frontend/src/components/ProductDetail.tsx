type Produto = {
  id_produto: string
  nome_produto: string
  categoria_produto: string
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
  onEdit,
  onDelete,
}: ProductDetailProps) {
  const averagePrice = vendas.total_vendas
    ? vendas.receita_total / vendas.total_vendas
    : 0
  const categoria = produto.categoria_produto || "—"
  const initials = categoria
    .split("_")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_1.2fr]">
        <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-[#1f1f24] bg-[#141417] text-slate-400">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[#2a2a31] bg-[#0d0d0f] text-2xl font-semibold uppercase tracking-[0.3em] text-[#e8c547]">
            {initials || "CT"}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#1a1a1f] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#e8c547]">
              {categoria.replaceAll("_", " ")}
            </span>
            <span className="rounded-full bg-[#e8c547]/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#e8c547]">
              Em estoque
            </span>
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
              {produto.id_produto}
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-50">
              {produto.nome_produto || "—"}
            </h2>
            <p className="mt-2 text-2xl font-semibold text-[#e8c547]">
              {currency.format(averagePrice)}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#1f1f24] bg-[#141417] p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Vendas</p>
              <p className="mt-2 text-xl font-semibold text-slate-50">
                {vendas.total_vendas}
              </p>
            </div>
            <div className="rounded-2xl border border-[#1f1f24] bg-[#141417] p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Avaliacao</p>
              <p className="mt-2 text-xl font-semibold text-slate-50">
                {avaliacoes.media.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-[#e8c547]">
                {renderStars(avaliacoes.media)}
              </p>
            </div>
            <div className="rounded-2xl border border-[#1f1f24] bg-[#141417] p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Estoque</p>
              <p className="mt-2 text-xl font-semibold text-slate-50">0</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#1f1f24] bg-[#141417] p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Peso</p>
              <p className="mt-2 text-base font-semibold text-slate-50">
                {formatPeso(produto.peso_produto_gramas)}
              </p>
            </div>
            <div className="rounded-2xl border border-[#1f1f24] bg-[#141417] p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Altura</p>
              <p className="mt-2 text-base font-semibold text-slate-50">
                {formatMedida(produto.altura_centimetros)}
              </p>
            </div>
            <div className="rounded-2xl border border-[#1f1f24] bg-[#141417] p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Largura</p>
              <p className="mt-2 text-base font-semibold text-slate-50">
                {formatMedida(produto.largura_centimetros)}
              </p>
            </div>
            <div className="rounded-2xl border border-[#1f1f24] bg-[#141417] p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Comprimento</p>
              <p className="mt-2 text-base font-semibold text-slate-50">
                {formatMedida(produto.comprimento_centimetros)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-full border border-[#1f1f24] bg-[#141417] px-4 py-2 text-sm font-semibold text-slate-200 shadow-sm transition hover:border-[#2a2a31]"
              onClick={onEdit}
              type="button"
            >
              Editar
            </button>
            <button
              className="rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 shadow-sm transition hover:border-red-400/60"
              onClick={onDelete}
              type="button"
            >
              Remover
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-50">Ultimas avaliacoes</h3>
          <span className="rounded-full bg-[#141417] px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-500">
            {avaliacoes.total_avaliacoes} registros
          </span>
        </div>

        {avaliacoes.avaliacoes.length === 0 ? (
          <div className="rounded-2xl border border-[#1f1f24] bg-[#141417] p-6 text-sm text-slate-400">
            Nenhuma avaliacao ainda
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {avaliacoes.avaliacoes.slice(0, 3).map((avaliacao) => (
              <div
                key={avaliacao.id_avaliacao}
                className="rounded-2xl border border-[#1f1f24] bg-[#141417] p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-50">Consumidor</p>
                  <span className="text-xs text-[#e8c547]">
                    {renderStars(avaliacao.avaliacao)}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-300">
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
