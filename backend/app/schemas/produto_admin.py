from pydantic import BaseModel, ConfigDict


class ProdutoAdminResponse(BaseModel):
    """Schema otimizado para listagem administrativa de produtos"""
    id_produto: str
    nome_produto: str
    categoria_produto: str
    preco: float
    nome_vendedor: str
    avaliacao_media: float
    total_vendas: int

    model_config = ConfigDict(from_attributes=True)
