import { useEffect, useRef, useState } from "react";
import { Filter } from "lucide-react";

import { Pagination } from "../components/Pagination";
import ProductDetail from "../components/ProductDetail";
import { ProductGrid } from "../components/ProductGrid";
import { ProductsToolbar } from "../components/ProductsToolbar";
import { api } from "../services/api";
import type { AvaliacoesProdutoResponse } from "../types/avaliacao";
import type { PaginatedResponse, ProdutoListItem } from "../types/produto";
import type { Produto } from "../types/produto";
import type { VendasProdutoResponse } from "../types/vendas";

type SortOption = {
  value: string;
  label: string;
  field: string;
  direction: "asc" | "desc";
};

const SORT_OPTIONS: SortOption[] = [
  {
    value: "nome_produto_asc",
    label: "Nome (A-Z)",
    field: "nome_produto",
    direction: "asc",
  },
  {
    value: "nome_produto_desc",
    label: "Nome (Z-A)",
    field: "nome_produto",
    direction: "desc",
  },
  {
    value: "preco_desc",
    label: "Preço (Maior)",
    field: "preco",
    direction: "desc",
  },
  {
    value: "preco_asc",
    label: "Preço (Menor)",
    field: "preco",
    direction: "asc",
  },
  {
    value: "avaliacao_media_desc",
    label: "Mais Bem Avaliado",
    field: "avaliacao_media",
    direction: "desc",
  },
];

const CATEGORIES = [
  "Todos",
  "Moda e Acessórios",
  "Eletrônicos",
  "Eletrodomésticos",
  "Casa e Decoração",
  "Beleza e Saúde",
  "Esporte e Lazer",
  "Alimentos e Bebidas",
  "Livros",
  "Ferramentas e Construção",
  "Automotivo",
  "Bebês",
  "Pets",
  "Papelaria e Escritório",
  "Música e Instrumentos",
  "Artes e Artesanato",
  "Festas e Decoração",
  "Relógios e Presentes",
  "Serviços",
  "Indústria e Comércio",
  "Outros",
];

const EMPTY_RESPONSE: PaginatedResponse<ProdutoListItem> = {
  items: [],
  total: 0,
  skip: 0,
  limit: 20,
  pages: 0,
  current_page: 1,
  has_next: false,
  has_previous: false,
};

type ProdutoDetalhesState = {
  produto: Produto | null;
  avaliacoes: AvaliacoesProdutoResponse | null;
  vendas: VendasProdutoResponse | null;
};

type ProdutoFormState = {
  nome_produto: string;
  categoria_produto: string;
  preco: string;
  peso_produto_gramas: string;
  comprimento_centimetros: string;
  altura_centimetros: string;
  largura_centimetros: string;
};

function formatNumberInput(value: number | null) {
  return value === null || value === undefined ? "" : String(value);
}

function parseOptionalNumber(value: string) {
  const normalized = value.trim();
  if (!normalized) return null;

  const parsed = Number(normalized.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function buildFormState(produto: Produto, preco: number): ProdutoFormState {
  return {
    nome_produto: produto.nome_produto,
    categoria_produto: produto.categoria_produto,
    preco: formatNumberInput(preco),
    peso_produto_gramas: formatNumberInput(produto.peso_produto_gramas),
    comprimento_centimetros: formatNumberInput(produto.comprimento_centimetros),
    altura_centimetros: formatNumberInput(produto.altura_centimetros),
    largura_centimetros: formatNumberInput(produto.largura_centimetros),
  };
}

export function Produtos() {
  const [catalogo, setCatalogo] =
    useState<PaginatedResponse<ProdutoListItem>>(EMPTY_RESPONSE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>(
    {},
  );
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState("nome_produto_asc");
  const [detailProductId, setDetailProductId] = useState<string | null>(null);
  const [detailState, setDetailState] = useState<ProdutoDetalhesState>({
    produto: null,
    avaliacoes: null,
    vendas: null,
  });
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | undefined>();
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ProdutoFormState | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | undefined>();
  const pageSize = 20;
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const cacheRef = useRef(
    new Map<string, PaginatedResponse<ProdutoListItem>>(),
  );

  const selectedSortOption =
    SORT_OPTIONS.find((option) => option.value === sortBy) || SORT_OPTIONS[0];

  useEffect(() => {
    const controller = new AbortController();

    api
      .get<Record<string, string>>("/produtos/categorias/imagens", {
        signal: controller.signal,
      })
      .then((imagensResponse) => {
        setCategoryImages(imagensResponse);
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") {
          console.error("Erro ao carregar imagens:", err);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      skip: ((page - 1) * pageSize).toString(),
      limit: pageSize.toString(),
      order_by: selectedSortOption.field,
      order_dir: selectedSortOption.direction,
    });

    if (selectedCategory !== "Todos") {
      params.append("categoria", selectedCategory);
    }

    if (search.trim()) {
      params.append("search", search.trim());
    }

    const cacheKey = params.toString();
    const cachedResponse = cacheRef.current.get(cacheKey);

    if (cachedResponse) {
      setCatalogo(cachedResponse);
      setError(undefined);
      setIsLoading(false);
      return () => {
        controller.abort();
      };
    }

    setIsLoading(true);
    setError(undefined);

    api
      .get<PaginatedResponse<ProdutoListItem>>(`/produtos?${params}`, {
        signal: controller.signal,
      })
      .then((response) => {
        cacheRef.current.set(cacheKey, response);
        setCatalogo(response);
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") {
          setError(err.message || "Erro ao carregar produtos");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [page, selectedCategory, search, sortBy, selectedSortOption]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  const handleOpenDetails = async (produto: ProdutoListItem) => {
    setDetailProductId(produto.id_produto);
    setDetailLoading(true);
    setDetailError(undefined);
    setDetailState({ produto: null, avaliacoes: null, vendas: null });

    try {
      const [produtoDetalhado, vendas, avaliacoes] = await Promise.all([
        api.get<Produto>(`/produtos/${produto.id_produto}`),
        api.get<VendasProdutoResponse>(`/produtos/${produto.id_produto}/vendas`),
        api.get<AvaliacoesProdutoResponse>(`/produtos/${produto.id_produto}/avaliacoes`),
      ]);

      setDetailState({ produto: produtoDetalhado, vendas, avaliacoes });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar detalhes";
      setDetailError(message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleEditFieldChange = (field: keyof ProdutoFormState, value: string) => {
    setEditForm((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleDetailEdit = async () => {
    if (!detailState.produto) {
      return;
    }

    setEditingProductId(detailState.produto.id_produto);
    setEditLoading(true);
    setEditError(undefined);
    setEditForm(null);

    try {
      const produto = await api.get<Produto>(`/produtos/${detailState.produto.id_produto}`);
      const preco = detailState.vendas?.total_vendas
        ? detailState.vendas.receita_total / detailState.vendas.total_vendas
        : 0;
      setEditForm(buildFormState(produto, preco));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar produto";
      setEditError(message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDetailDelete = async () => {
    if (!detailState.produto) {
      return;
    }

    const firstConfirmation = window.confirm(
      `Deseja remover o produto \"${detailState.produto.nome_produto}\"?`,
    );

    if (!firstConfirmation) {
      return;
    }

    const secondConfirmation = window.confirm(
      "Confirme novamente para excluir este produto permanentemente.",
    );

    if (!secondConfirmation) {
      return;
    }

    try {
      await api.delete(`/produtos/${detailState.produto.id_produto}`);

      setCatalogo((current) => ({
        ...current,
        items: current.items.filter((item) => item.id_produto !== detailState.produto?.id_produto),
        total: Math.max(0, current.total - 1),
      }));
      setDetailProductId(null);
      setDetailState({ produto: null, avaliacoes: null, vendas: null });
      cacheRef.current.clear();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao remover produto";
      setDetailError(message);
    }
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingProductId || !editForm) {
      return;
    }

    setEditSaving(true);
    setEditError(undefined);

    try {
      const produtoAtualizado = await api.patch<Produto>(`/produtos/${editingProductId}`, {
        nome_produto: editForm.nome_produto.trim(),
        categoria_produto: editForm.categoria_produto.trim(),
        preco: parseOptionalNumber(editForm.preco),
        peso_produto_gramas: parseOptionalNumber(editForm.peso_produto_gramas),
        comprimento_centimetros: parseOptionalNumber(editForm.comprimento_centimetros),
        altura_centimetros: parseOptionalNumber(editForm.altura_centimetros),
        largura_centimetros: parseOptionalNumber(editForm.largura_centimetros),
      });

      const precoAtualizado = parseOptionalNumber(editForm.preco) ?? 0;

      setCatalogo((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.id_produto === editingProductId
            ? {
                ...item,
                nome_produto: produtoAtualizado.nome_produto,
                categoria_produto: produtoAtualizado.categoria_produto,
                preco: precoAtualizado,
              }
            : item,
        ),
      }));

      setDetailState((current) => ({
        ...current,
        produto: produtoAtualizado,
        vendas: current.vendas
          ? {
              ...current.vendas,
              receita_total: current.vendas.total_vendas * precoAtualizado,
            }
          : current.vendas,
      }));

      cacheRef.current.clear();
      setEditingProductId(null);
      setEditForm(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao editar produto";
      setEditError(message);
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-8 px-4 pb-16 sm:px-6">
      <ProductsToolbar
        search={searchInput}
        total={catalogo.total}
        isSearching={searchInput.trim() !== search}
        onSearchChange={(value) => {
          setSearchInput(value);
          setPage(1);
        }}
      />

      {/* Barra de filtros */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-slate-500 focus:outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1f1f24] bg-[#141417] text-slate-300 hover:border-[#e8c547]/40"
          type="button"
          onClick={() => {
            categoriesRef.current?.scrollBy({ left: -220, behavior: "smooth" });
          }}
        >
          <span className="text-lg">‹</span>
        </button>
        <div className="flex flex-1 items-center gap-2 overflow-hidden">
          <div
            ref={categoriesRef}
            className="flex flex-nowrap gap-2 overflow-x-auto no-scrollbar"
          >
            {CATEGORIES.map((category) => {
              const isActive = category === selectedCategory;
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
                    setSelectedCategory(category);
                    setPage(1);
                  }}
                >
                  {category.replaceAll("_", " ")}
                </button>
              );
            })}
          </div>
        </div>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1f1f24] bg-[#141417] text-slate-300 hover:border-[#e8c547]/40"
          type="button"
          onClick={() => {
            categoriesRef.current?.scrollBy({ left: 220, behavior: "smooth" });
          }}
        >
          <span className="text-lg">›</span>
        </button>
      </div>
      <ProductGrid
        produtos={catalogo.items}
        isLoading={isLoading}
        error={error}
        categoryImages={categoryImages}
        onSelectProduct={handleOpenDetails}
      />
      <Pagination
        currentPage={page}
        totalPages={catalogo.pages}
        onPageChange={setPage}
      />

      {detailProductId ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 py-10">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-[#1f1f24] bg-[#0f0f12] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#1f1f24] bg-[#0f0f12] px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-50">Detalhes do produto</h2>
              <button
                className="rounded-full border border-[#1f1f24] bg-[#141417] px-4 py-2 text-sm text-slate-200"
                onClick={() => {
                  setDetailProductId(null);
                  setDetailError(undefined);
                }}
                type="button"
              >
                Fechar
              </button>
            </div>
            <div className="p-6">
              {detailLoading ? (
                <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-8 text-slate-200">
                  Carregando detalhes do produto...
                </div>
              ) : detailError ? (
                <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-8 text-red-200">
                  {detailError}
                </div>
              ) : detailState.produto && detailState.vendas && detailState.avaliacoes ? (
                <ProductDetail
                  produto={detailState.produto}
                  vendas={detailState.vendas}
                  avaliacoes={detailState.avaliacoes}
                  imageUrl={categoryImages[detailState.produto.categoria_produto]}
                  onEdit={() => {
                    void handleDetailEdit();
                  }}
                  onDelete={() => {
                    void handleDetailDelete();
                  }}
                />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {editingProductId ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/70 px-4 py-10">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[#1f1f24] bg-[#0f0f12] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#1f1f24] bg-[#0f0f12] px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-50">Editar produto</h2>
              <button
                className="rounded-full border border-[#1f1f24] bg-[#141417] px-4 py-2 text-sm text-slate-200"
                onClick={() => {
                  if (editSaving) {
                    return;
                  }

                  setEditingProductId(null);
                  setEditForm(null);
                  setEditError(undefined);
                }}
                type="button"
              >
                Fechar
              </button>
            </div>
            <div className="p-6">
              {editLoading ? (
                <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-8 text-slate-200">
                  Carregando produto...
                </div>
              ) : editForm ? (
                <form className="space-y-6" onSubmit={handleEditSubmit}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Nome do produto</span>
                      <input
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                        value={editForm.nome_produto}
                        onChange={(event) => handleEditFieldChange("nome_produto", event.target.value)}
                        required
                      />
                    </label>

                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Categoria</span>
                      <input
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                        value={editForm.categoria_produto}
                        onChange={(event) => handleEditFieldChange("categoria_produto", event.target.value)}
                        required
                      />
                    </label>

                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Preço (BRL)</span>
                      <input
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                        value={editForm.preco}
                        onChange={(event) => handleEditFieldChange("preco", event.target.value)}
                        inputMode="decimal"
                      />
                    </label>

                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Peso (g)</span>
                      <input
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                        value={editForm.peso_produto_gramas}
                        onChange={(event) => handleEditFieldChange("peso_produto_gramas", event.target.value)}
                        inputMode="decimal"
                      />
                    </label>

                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Comprimento (cm)</span>
                      <input
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                        value={editForm.comprimento_centimetros}
                        onChange={(event) => handleEditFieldChange("comprimento_centimetros", event.target.value)}
                        inputMode="decimal"
                      />
                    </label>

                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Altura (cm)</span>
                      <input
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                        value={editForm.altura_centimetros}
                        onChange={(event) => handleEditFieldChange("altura_centimetros", event.target.value)}
                        inputMode="decimal"
                      />
                    </label>

                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Largura (cm)</span>
                      <input
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                        value={editForm.largura_centimetros}
                        onChange={(event) => handleEditFieldChange("largura_centimetros", event.target.value)}
                        inputMode="decimal"
                      />
                    </label>
                  </div>

                  {editError ? (
                    <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                      {editError}
                    </div>
                  ) : null}

                  <div className="flex justify-end gap-3">
                    <button
                      className="rounded-full border border-[#1f1f24] bg-[#141417] px-4 py-2 text-sm font-semibold text-slate-200"
                      onClick={() => {
                        setEditingProductId(null);
                        setEditForm(null);
                        setEditError(undefined);
                      }}
                      type="button"
                    >
                      Cancelar
                    </button>
                    <button
                      className="rounded-full bg-[#e8c547] px-5 py-2 text-sm font-semibold text-[#0d0d0f] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={editSaving}
                      type="submit"
                    >
                      {editSaving ? "Salvando..." : "Salvar alterações"}
                    </button>
                  </div>
                </form>
              ) : editError ? (
                <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-8 text-red-200">
                  {editError}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
