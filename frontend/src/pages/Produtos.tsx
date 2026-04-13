import { useEffect, useMemo, useRef, useState } from "react"

import { Pagination } from "../components/Pagination"
import { ProductGrid } from "../components/ProductGrid"
import { ProductsToolbar } from "../components/ProductsToolbar"
import { api } from "../services/api"
import type { Produto } from "../types/produto"

export function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | undefined>()
  const [search, setSearch] = useState("")
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({})
  const [pricesByProduct, setPricesByProduct] = useState<Record<string, number>>({})
  const [page, setPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const pageSize = 12
  const categoriesRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setError(undefined)

    Promise.all([
      api.get<Produto[]>("/produtos"),
      api.get<Record<string, string>>("/produtos/categorias/imagens"),
      api.get<Record<string, number>>("/produtos/precos"),
    ])
      .then(([produtosResponse, imagensResponse, precosResponse]) => {
        if (isMounted) {
          setProdutos(produtosResponse)
          setCategoryImages(imagensResponse)
          setPricesByProduct(precosResponse)
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          setError(err.message || "Erro ao carregar produtos")
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filteredProdutos = useMemo(() => {
    const term = search.trim().toLowerCase()
    return produtos.filter((produto) => {
      const matchesSearch = term
        ? produto.nome_produto.toLowerCase().includes(term)
        : true
      const matchesCategory =
        selectedCategory === "Todos"
          ? true
          : produto.categoria_produto === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [produtos, search, selectedCategory])

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(produtos.map((produto) => produto.categoria_produto))
    )
    return ["Todos", ...unique.sort()]
  }, [produtos])

  const totalPages = Math.max(1, Math.ceil(filteredProdutos.length / pageSize))
  const paginatedProdutos = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredProdutos.slice(start, start + pageSize)
  }, [filteredProdutos, page, pageSize])

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <ProductsToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
      />
      <div className="mt-6 flex items-center gap-2">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1f1f24] bg-[#141417] text-slate-300 hover:border-[#e8c547]/40"
          type="button"
          onClick={() => {
            categoriesRef.current?.scrollBy({ left: -220, behavior: "smooth" })
          }}
        >
          <span className="text-lg">‹</span>
        </button>
        <div className="flex flex-1 items-center gap-2 overflow-hidden">
          <div
            ref={categoriesRef}
            className="flex flex-nowrap gap-2 overflow-x-auto no-scrollbar"
          >
            {categories.map((category) => {
              const isActive = category === selectedCategory
              return (
                <button
                  key={category}
                  className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                    isActive
                      ? "border-[#e8c547]/60 bg-[#e8c547]/15 text-[#e8c547]"
                      : "border-[#1f1f24] bg-[#141417] text-slate-300 hover:border-[#e8c547]/40"
                  }`}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category)
                    setPage(1)
                  }}
                >
                  {category.replaceAll("_", " ")}
                </button>
              )
            })}
          </div>
        </div>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1f1f24] bg-[#141417] text-slate-300 hover:border-[#e8c547]/40"
          type="button"
          onClick={() => {
            categoriesRef.current?.scrollBy({ left: 220, behavior: "smooth" })
          }}
        >
          <span className="text-lg">›</span>
        </button>
      </div>
      <ProductGrid
        produtos={paginatedProdutos}
        isLoading={isLoading}
        error={error}
        categoryImages={categoryImages}
        pricesByProduct={pricesByProduct}
      />
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </section>
  )
}
