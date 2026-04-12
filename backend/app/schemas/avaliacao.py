from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class AvaliacaoPedidoBase(BaseModel):
    id_pedido: str
    avaliacao: int
    titulo_comentario: Optional[str] = None
    comentario: Optional[str] = None
    data_comentario: Optional[datetime] = None
    data_resposta: Optional[datetime] = None


class AvaliacaoPedidoCreate(AvaliacaoPedidoBase):
    pass


class AvaliacaoPedidoResponse(AvaliacaoPedidoBase):
    id_avaliacao: str

    model_config = ConfigDict(from_attributes=True)


class AvaliacaoResponse(AvaliacaoPedidoResponse):
    pass
