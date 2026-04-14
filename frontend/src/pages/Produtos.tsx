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
  limit: 16,
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
  imagem_url: string;
  preco: string;
  peso_produto_gramas: string;
  comprimento_centimetros: string;
  altura_centimetros: string;
  largura_centimetros: string;
};

type UploadImagemResponse = {
  image_url: string;
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
    imagem_url: produto.imagem_url ?? "",
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
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | undefined>();
  const pageSize = 16;
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

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    setImageUploading(true);
    setImageUploadError(undefined);

    try {
      const response = await api.post<UploadImagemResponse>("/produtos/upload-imagem", formData);
      setEditForm((current) => (current ? { ...current, imagem_url: response.image_url } : current));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao enviar imagem";
      setImageUploadError(message);
    } finally {
      setImageUploading(false);
    }
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
        imagem_url: editForm.imagem_url.trim() || null,
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
                imagem_url: produtoAtualizado.imagem_url,
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
    <section className="mx-auto w-full max-w-full space-y-8 px-4 pb-16 pt-6 sm:max-w-6xl sm:px-6">
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
      <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
          <Filter size={16} className="theme-text-muted" />
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="theme-input w-full min-w-0 max-w-full rounded-lg border px-3 py-2 text-sm focus:outline-none sm:w-auto"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex w-full min-w-0 items-center gap-2">
        <button
          className="theme-button-secondary hidden h-9 w-9 items-center justify-center rounded-full border sm:flex"
          type="button"
          onClick={() => {
            categoriesRef.current?.scrollBy({ left: -220, behavior: "smooth" });
          }}
        >
          <span className="text-lg">‹</span>
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
          <div
            ref={categoriesRef}
            className="flex w-full min-w-0 flex-nowrap gap-2 overflow-x-auto no-scrollbar"
          >
            {CATEGORIES.map((category) => {
              const isActive = category === selectedCategory;
              return (
                <button
                  key={category}
                  className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                    isActive
                      ? "theme-nav-active"
                      : "theme-button-secondary"
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
          className="theme-button-secondary hidden h-9 w-9 items-center justify-center rounded-full border sm:flex"
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
          <div className="theme-surface-muted max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border shadow-2xl">
            <div className="theme-surface-muted theme-border sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4">
              <h2 className="theme-text-primary text-lg font-semibold">Detalhes do produto</h2>
              <button
                className="theme-button-secondary rounded-full border px-4 py-2 text-sm"
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
                  <div className="theme-surface rounded-3xl border p-8">
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
                  imageUrl={detailState.produto.imagem_url ?? categoryImages[detailState.produto.categoria_produto]}
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
          <div className="theme-surface-muted max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border shadow-2xl">
            <div className="theme-surface-muted theme-border sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4">
              <h2 className="theme-text-primary text-lg font-semibold">Editar produto</h2>
              <button
                className="theme-button-secondary rounded-full border px-4 py-2 text-sm"
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
                  <div className="theme-surface rounded-3xl border p-8">
                    Carregando produto...
                  </div>
              ) : editForm ? (
                <form className="space-y-6" onSubmit={handleEditSubmit}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="theme-text-primary space-y-2 text-sm">
                      <span>Nome do produto</span>
                      <input
                        className="theme-input w-full rounded-xl border px-4 py-3"
                        value={editForm.nome_produto}
                        onChange={(event) => handleEditFieldChange("nome_produto", event.target.value)}
                        required
                      />
                    </label>

                    <label className="theme-text-primary space-y-2 text-sm">
                      <span>Categoria</span>
                      <input
                        className="theme-input w-full rounded-xl border px-4 py-3"
                        value={editForm.categoria_produto}
                        onChange={(event) => handleEditFieldChange("categoria_produto", event.target.value)}
                        required
                      />
                    </label>

                    <label className="theme-text-primary space-y-2 text-sm md:col-span-2">
                      <span>Imagem do produto</span>
                      <input
                        className="theme-input w-full rounded-xl border px-4 py-3 file:mr-4 file:rounded-full file:border-0 file:bg-[color:var(--primary)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[color:var(--primary-contrast)]"
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            void handleImageUpload(file);
                          }
                        }}
                      />
                      {editForm.imagem_url ? (
                        <img
                          src={editForm.imagem_url}
                          alt="Preview do produto"
                          className="h-32 w-32 rounded-2xl object-cover"
                        />
                      ) : null}
                    </label>

                    <label className="theme-text-primary space-y-2 text-sm">
                      <span>Preço (BRL)</span>
                      <input
                        className="theme-input w-full rounded-xl border px-4 py-3"
                        value={editForm.preco}
                        onChange={(event) => handleEditFieldChange("preco", event.target.value)}
                        inputMode="decimal"
                      />
                    </label>

                    <label className="theme-text-primary space-y-2 text-sm">
                      <span>Peso (g)</span>
                      <input
                        className="theme-input w-full rounded-xl border px-4 py-3"
                        value={editForm.peso_produto_gramas}
                        onChange={(event) => handleEditFieldChange("peso_produto_gramas", event.target.value)}
                        inputMode="decimal"
                      />
                    </label>

                    <label className="theme-text-primary space-y-2 text-sm">
                      <span>Comprimento (cm)</span>
                      <input
                        className="theme-input w-full rounded-xl border px-4 py-3"
                        value={editForm.comprimento_centimetros}
                        onChange={(event) => handleEditFieldChange("comprimento_centimetros", event.target.value)}
                        inputMode="decimal"
                      />
                    </label>

                    <label className="theme-text-primary space-y-2 text-sm">
                      <span>Altura (cm)</span>
                      <input
                        className="theme-input w-full rounded-xl border px-4 py-3"
                        value={editForm.altura_centimetros}
                        onChange={(event) => handleEditFieldChange("altura_centimetros", event.target.value)}
                        inputMode="decimal"
                      />
                    </label>

                    <label className="theme-text-primary space-y-2 text-sm">
                      <span>Largura (cm)</span>
                      <input
                        className="theme-input w-full rounded-xl border px-4 py-3"
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

                  {imageUploadError ? (
                    <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                      {imageUploadError}
                    </div>
                  ) : null}

                  {imageUploading ? (
                    <div className="theme-surface rounded-2xl border p-4 text-sm theme-text-muted">
                      Enviando imagem...
                    </div>
                  ) : null}

                  <div className="flex justify-end gap-3">
                    <button
                      className="theme-button-secondary rounded-full border px-4 py-2 text-sm font-semibold"
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
                      className="theme-button-primary rounded-full px-5 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
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
