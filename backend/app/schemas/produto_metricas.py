from typing import List

from pydantic import BaseModel

from app.schemas.avaliacao import AvaliacaoResponse


class AvaliacoesProdutoResponse(BaseModel):
    media: float
    total_avaliacoes: int
    avaliacoes: List[AvaliacaoResponse]


class VendasProdutoResponse(BaseModel):
    total_vendas: int
    receita_total: float
    receita_frete: float
