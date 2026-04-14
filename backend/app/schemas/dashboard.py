from pydantic import BaseModel


class DashboardResumoResponse(BaseModel):
    total_produtos: int
    total_consumidores: int
    total_pedidos: int
    receita_total: float
    avaliacao_media_geral: float


class DashboardTopVendaItem(BaseModel):
    id_produto: str
    nome_produto: str
    categoria_produto: str
    total_vendas: int
    receita_total: float
    preco_medio: float


class DashboardTopAvaliadoItem(BaseModel):
    id_produto: str
    nome_produto: str
    categoria_produto: str
    avaliacao_media: float
    total_avaliacoes: int


class DashboardCategoriaItem(BaseModel):
    categoria_produto: str
    total_produtos: int
    total_vendas: int
    receita_total: float


class DashboardReceitaMensalItem(BaseModel):
    mes: str
    total_pedidos: int
    receita_total: float
