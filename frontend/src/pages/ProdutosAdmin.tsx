import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";

import ProductDetail from "../components/ProductDetail";
import { PageHeader } from "../components/products-admin/PageHeader";
import { ProductTable } from "../components/products-admin/ProductTable";
import { SearchBar } from "../components/products-admin/SearchBar";
import { api } from "../services/api";
import type { AvaliacoesProdutoResponse } from "../types/avaliacao";
import type { Product } from "../types/product-admin";
import type { Produto } from "../types/produto";
import type { VendasProdutoResponse } from "../types/vendas";

interface ProdutoAdminResponse {
  id_produto: string;
  nome_produto: string;
  categoria_produto: string;
  preco: number;
  nome_vendedor: string;
  avaliacao_media: number;
  total_vendas: number;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
  pages: number;
  current_page: number;
  has_next: boolean;
  has_previous: boolean;
}

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

const ITEMS_PER_PAGE = 6;

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
  {
    value: "total_vendas_desc",
    label: "Mais Vendido",
    field: "total_vendas",
    direction: "desc",
  },
];

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

function buildEmptyFormState(): ProdutoFormState {
  return {
    nome_produto: "",
    categoria_produto: "",
    imagem_url: "",
    preco: "0",
    peso_produto_gramas: "",
    comprimento_centimetros: "",
    altura_centimetros: "",
    largura_centimetros: "",
  };
}

function buildAdminProduct(produto: Produto, vendas: VendasProdutoResponse, avaliacoes: AvaliacoesProdutoResponse): Product {
  return {
    id: produto.id_produto,
    nome: produto.nome_produto,
    categoria: produto.categoria_produto,
    preco: vendas.total_vendas ? vendas.receita_total / vendas.total_vendas : (produto.preco ?? 0),
    vendedor: "—",
    avaliacao_media: avaliacoes.media,
    estoque: vendas.total_vendas,
  };
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 py-10">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-[#1f1f24] bg-[#0f0f12] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#1f1f24] bg-[#0f0f12] px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-50">{title}</h2>
          <button
            className="rounded-full border border-[#1f1f24] bg-[#141417] px-4 py-2 text-sm text-slate-200"
            onClick={onClose}
            type="button"
          >
            Fechar
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function ProdutosAdmin() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState("nome_produto_asc");
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<ProdutoFormState>(buildEmptyFormState());
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState<string | undefined>();
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [imageUploading, setImageUploading] = useState<"create" | "edit" | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | undefined>();
  const [pagination, setPagination] = useState<{
    total: number;
    pages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }>({
    total: 0,
    pages: 0,
    currentPage: 1,
    hasNext: false,
    hasPrevious: false,
  });

  useEffect(() => {
    const controller = new AbortController();

    api
      .get<Record<string, string>>("/produtos/categorias/imagens", {
        signal: controller.signal,
      })
      .then((response) => {
        setCategoryImages(response);
      })
      .catch(() => undefined);

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(undefined);

    const skip = page * ITEMS_PER_PAGE;
    const selectedSort =
      SORT_OPTIONS.find((option) => option.value === sortBy) || SORT_OPTIONS[0];

    api
      .get<PaginatedResponse<ProdutoAdminResponse>>(
        `/produtos/lista-admin?skip=${skip}&limit=${ITEMS_PER_PAGE}&order_by=${selectedSort.field}&order_dir=${selectedSort.direction}`,
      )
      .then((response) => {
        if (!isMounted) return;

        const detalhes: Product[] = response.items.map((produto) => ({
          id: produto.id_produto,
          nome: produto.nome_produto,
          categoria: produto.categoria_produto,
          preco: produto.preco,
          vendedor: produto.nome_vendedor,
          avaliacao_media: produto.avaliacao_media,
          estoque: produto.total_vendas,
        }));

        if (isMounted) {
          setProducts(detalhes);
          setPagination({
            total: response.total,
            pages: response.pages,
            currentPage: Math.floor(response.skip / ITEMS_PER_PAGE) + 1,
            hasNext: response.skip + ITEMS_PER_PAGE < response.total,
            hasPrevious: response.skip > 0,
          });
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          setError(err.message || "Erro ao carregar produtos");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [page, sortBy, refreshKey]);

  useEffect(() => {
    if (!isCreateOpen) {
      setCategorySuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams({
        search: createForm.categoria_produto.trim(),
        limit: "10",
      });

      api
        .get<string[]>(`/produtos/categorias?${params.toString()}`, {
          signal: controller.signal,
        })
        .then((categorias) => {
          setCategorySuggestions(categorias);
        })
        .catch((err: Error) => {
          if (err.name !== "AbortError") {
            setCategorySuggestions([]);
          }
        });
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [createForm.categoria_produto, isCreateOpen]);

  const filtered = products.filter((product) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return product.nome.toLowerCase().includes(term);
  });

  const handlePreviousPage = () => {
    if (pagination.hasPrevious) {
      setPage((p) => p - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNext) {
      setPage((p) => p + 1);
    }
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setPage(0);
  };

  const handleView = async (product: Product) => {
    setDetailProductId(product.id);
    setDetailLoading(true);
    setDetailError(undefined);
    setDetailState({ produto: null, avaliacoes: null, vendas: null });

    try {
      const [produto, vendas, avaliacoes] = await Promise.all([
        api.get<Produto>(`/produtos/${product.id}`),
        api.get<VendasProdutoResponse>(`/produtos/${product.id}/vendas`),
        api.get<AvaliacoesProdutoResponse>(`/produtos/${product.id}/avaliacoes`),
      ]);

      setDetailState({ produto, vendas, avaliacoes });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar detalhes";
      setDetailError(message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleEdit = async (product: Product) => {
    setEditingProductId(product.id);
    setEditLoading(true);
    setEditError(undefined);
    setEditForm(null);

    try {
      const produto = await api.get<Produto>(`/produtos/${product.id}`);
      setEditForm(buildFormState(produto, product.preco));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar produto";
      setEditError(message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (product: Product) => {
    const firstConfirmation = window.confirm(
      `Deseja remover o produto \"${product.nome}\"?`,
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
      await api.delete(`/produtos/${product.id}`);

      setProducts((current) => current.filter((item) => item.id !== product.id));
      setRefreshKey((current) => current + 1);
      if (products.length === 1 && page > 0) {
        setPage((current) => current - 1);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao remover produto";
      setError(message);
    }
  };

  const handleEditFieldChange = (field: keyof ProdutoFormState, value: string) => {
    setEditForm((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleCreateFieldChange = (field: keyof ProdutoFormState, value: string) => {
    setCreateForm((current) => ({ ...current, [field]: value }));
  };

  const handleImageUpload = async (file: File, target: "create" | "edit") => {
    const formData = new FormData();
    formData.append("file", file);

    setImageUploading(target);
    setImageUploadError(undefined);

    try {
      const response = await api.post<UploadImagemResponse>("/produtos/upload-imagem", formData);

      if (target === "create") {
        setCreateForm((current) => ({ ...current, imagem_url: response.image_url }));
      } else {
        setEditForm((current) => (current ? { ...current, imagem_url: response.image_url } : current));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao enviar imagem";
      setImageUploadError(message);
    } finally {
      setImageUploading(null);
    }
  };

  const handleOpenCreate = () => {
    setIsCreateOpen(true);
    setCreateError(undefined);
    setCreateForm(buildEmptyFormState());
  };

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateSaving(true);
    setCreateError(undefined);

    try {
      await api.post("/produtos", {
        nome_produto: createForm.nome_produto.trim(),
        categoria_produto: createForm.categoria_produto.trim(),
        imagem_url: createForm.imagem_url.trim() || null,
        preco: parseOptionalNumber(createForm.preco),
        peso_produto_gramas: parseOptionalNumber(createForm.peso_produto_gramas),
        comprimento_centimetros: parseOptionalNumber(createForm.comprimento_centimetros),
        altura_centimetros: parseOptionalNumber(createForm.altura_centimetros),
        largura_centimetros: parseOptionalNumber(createForm.largura_centimetros),
      });

      setIsCreateOpen(false);
      setCreateForm(buildEmptyFormState());
      setPage(0);
      setRefreshKey((current) => current + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao criar produto";
      setCreateError(message);
    } finally {
      setCreateSaving(false);
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
      await api.patch(`/produtos/${editingProductId}`, {
        nome_produto: editForm.nome_produto.trim(),
        categoria_produto: editForm.categoria_produto.trim(),
        imagem_url: editForm.imagem_url.trim() || null,
        preco: parseOptionalNumber(editForm.preco),
        peso_produto_gramas: parseOptionalNumber(editForm.peso_produto_gramas),
        comprimento_centimetros: parseOptionalNumber(editForm.comprimento_centimetros),
        altura_centimetros: parseOptionalNumber(editForm.altura_centimetros),
        largura_centimetros: parseOptionalNumber(editForm.largura_centimetros),
      });

      setEditingProductId(null);
      setEditForm(null);
      setRefreshKey((current) => current + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao editar produto";
      setEditError(message);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDetailEdit = () => {
    if (!detailState.produto || !detailState.vendas || !detailState.avaliacoes) {
      return;
    }

    setDetailProductId(null);
    void handleEdit(
      buildAdminProduct(detailState.produto, detailState.vendas, detailState.avaliacoes),
    );
  };

  const handleDetailDelete = async () => {
    if (!detailState.produto || !detailState.vendas || !detailState.avaliacoes) {
      return;
    }

    const product = buildAdminProduct(
      detailState.produto,
      detailState.vendas,
      detailState.avaliacoes,
    );

    setDetailProductId(null);
    await handleDelete(product);
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-8 px-4 pb-16 pt-6 sm:px-6">
      <PageHeader title="" onAdd={handleOpenCreate} />

      {/* Barra de filtros */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={search} onChange={setSearch} />

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

      {error ? (
        <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-8 text-red-200">
          {error}
        </div>
      ) : (
        <>
          <ProductTable
            products={filtered}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />

          {/* Controles de paginação */}
          <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 px-6 py-4">
            <div className="text-sm text-slate-400">
              Página{" "}
              <span className="font-semibold">{pagination.currentPage}</span> de{" "}
              <span className="font-semibold">{pagination.pages}</span> (
              <span className="font-semibold">{pagination.total}</span>{" "}
              produtos)
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={!pagination.hasPrevious || isLoading}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition-all disabled:cursor-not-allowed disabled:opacity-50 hover:enabled:border-slate-500 hover:enabled:bg-slate-700"
              >
                <ChevronLeft size={16} />
                Anterior
              </button>

              <button
                onClick={handleNextPage}
                disabled={!pagination.hasNext || isLoading}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition-all disabled:cursor-not-allowed disabled:opacity-50 hover:enabled:border-slate-500 hover:enabled:bg-slate-700"
              >
                Próxima
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {detailProductId ? (
        <Modal
          title="Detalhes do produto"
          onClose={() => {
            setDetailProductId(null);
            setDetailError(undefined);
          }}
        >
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
              imageUrl={detailState.produto.imagem_url ?? categoryImages[detailState.produto.categoria_produto]}
              onEdit={handleDetailEdit}
              onDelete={() => {
                void handleDetailDelete();
              }}
            />
          ) : null}
        </Modal>
      ) : null}

      {editingProductId ? (
        <Modal
          title="Editar produto"
          onClose={() => {
            if (editSaving) {
              return;
            }

            setEditingProductId(null);
            setEditForm(null);
            setEditError(undefined);
          }}
        >
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

                <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
                  <span>Imagem do produto</span>
                  <input
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 file:mr-4 file:rounded-full file:border-0 file:bg-[#e8c547] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#0d0d0f]"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void handleImageUpload(file, "edit");
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

              {imageUploadError && imageUploading === "edit" ? (
                <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                  {imageUploadError}
                </div>
              ) : null}

              {imageUploading === "edit" ? (
                <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4 text-sm text-slate-300">
                  Enviando imagem...
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
        </Modal>
      ) : null}

      {isCreateOpen ? (
        <Modal
          title="Adicionar produto"
          onClose={() => {
            if (createSaving) {
              return;
            }

            setIsCreateOpen(false);
            setCreateError(undefined);
          }}
        >
          <form className="space-y-6" onSubmit={handleCreateSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                <span>Nome do produto</span>
                <input
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                  value={createForm.nome_produto}
                  onChange={(event) => handleCreateFieldChange("nome_produto", event.target.value)}
                  required
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>Categoria</span>
                <input
                  list="categoria-suggestions"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                  value={createForm.categoria_produto}
                  onChange={(event) => handleCreateFieldChange("categoria_produto", event.target.value)}
                  required
                />
                <datalist id="categoria-suggestions">
                  {categorySuggestions.map((categoria) => (
                    <option key={categoria} value={categoria} />
                  ))}
                </datalist>
                <p className="text-xs text-slate-500">
                  Digite uma nova categoria ou escolha uma existente.
                </p>
              </label>

              <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
                <span>Imagem do produto</span>
                <input
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 file:mr-4 file:rounded-full file:border-0 file:bg-[#e8c547] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#0d0d0f]"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleImageUpload(file, "create");
                    }
                  }}
                />
                {createForm.imagem_url ? (
                  <img
                    src={createForm.imagem_url}
                    alt="Preview do produto"
                    className="h-32 w-32 rounded-2xl object-cover"
                  />
                ) : null}
              </label>

              <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
                <span>Preço inicial</span>
                <input
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                  value={createForm.preco}
                  onChange={(event) => handleCreateFieldChange("preco", event.target.value)}
                  inputMode="decimal"
                  required
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>Peso (g)</span>
                <input
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                  value={createForm.peso_produto_gramas}
                  onChange={(event) => handleCreateFieldChange("peso_produto_gramas", event.target.value)}
                  inputMode="decimal"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>Comprimento (cm)</span>
                <input
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                  value={createForm.comprimento_centimetros}
                  onChange={(event) => handleCreateFieldChange("comprimento_centimetros", event.target.value)}
                  inputMode="decimal"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>Altura (cm)</span>
                <input
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                  value={createForm.altura_centimetros}
                  onChange={(event) => handleCreateFieldChange("altura_centimetros", event.target.value)}
                  inputMode="decimal"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>Largura (cm)</span>
                <input
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                  value={createForm.largura_centimetros}
                  onChange={(event) => handleCreateFieldChange("largura_centimetros", event.target.value)}
                  inputMode="decimal"
                />
              </label>
            </div>

            {createError ? (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                {createError}
              </div>
            ) : null}

            {imageUploadError && imageUploading === "create" ? (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                {imageUploadError}
              </div>
            ) : null}

            {imageUploading === "create" ? (
              <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4 text-sm text-slate-300">
                Enviando imagem...
              </div>
            ) : null}

            <div className="flex justify-end gap-3">
              <button
                className="rounded-full border border-[#1f1f24] bg-[#141417] px-4 py-2 text-sm font-semibold text-slate-200"
                onClick={() => {
                  if (createSaving) {
                    return;
                  }

                  setIsCreateOpen(false);
                  setCreateError(undefined);
                }}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="rounded-full bg-[#e8c547] px-5 py-2 text-sm font-semibold text-[#0d0d0f] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={createSaving}
                type="submit"
              >
                {createSaving ? "Criando..." : "Criar produto"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </section>
  );
}
