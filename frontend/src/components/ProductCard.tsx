import { Link } from "react-router-dom"

import type { Produto } from "../types/produto"

type ProductCardProps = {
  produto: Produto
  imageUrl?: string
  price?: number
}

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

function formatPeso(peso: number | null) {
  if (!peso) return "Peso nao informado"
  if (peso >= 1000) return `${(peso / 1000).toFixed(1)} kg`
  return `${peso.toFixed(0)} g`
}

function formatDimensoes(produto: Produto) {
  const { comprimento_centimetros, altura_centimetros, largura_centimetros } = produto
  if (!comprimento_centimetros || !altura_centimetros || !largura_centimetros) {
    return "Dimensoes nao informadas"
  }
  return `${comprimento_centimetros} x ${largura_centimetros} x ${altura_centimetros} cm`
}

export function ProductCard({ produto, imageUrl, price }: ProductCardProps) {
  const formattedPrice = price !== undefined ? currency.format(price) : "—"

  return (
    <Link
      to={`/produtos/${produto.id_produto}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#1f1f24] bg-[#141417] shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:border-[#e8c547]/50"
    >
      <div className="relative h-48 w-full overflow-hidden bg-[#0d0d0f] sm:h-52">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={produto.categoria_produto}
            className="h-full w-full object-cover"
            loading="lazy"
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
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            {produto.id_produto}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-50">
            {produto.nome_produto}
          </h3>
          <p className="mt-1 text-sm text-slate-400">{produto.categoria_produto}</p>
          <p className="mt-3 text-base font-semibold text-[#e8c547]">
            {formattedPrice}
          </p>
        </div>
        <div className="space-y-2 text-sm text-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Peso</span>
            <span>{formatPeso(produto.peso_produto_gramas)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Dimensoes</span>
            <span>{formatDimensoes(produto)}</span>
          </div>
        </div>
        <span className="mt-auto text-xs uppercase tracking-[0.3em] text-slate-500">
          Abrir detalhes
        </span>
      </div>
    </Link>
  )
}
