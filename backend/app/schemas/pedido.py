from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class PedidoBase(BaseModel):
    id_consumidor: str
    status: str
    pedido_compra_timestamp: Optional[datetime] = None
    pedido_entregue_timestamp: Optional[datetime] = None
    data_estimada_entrega: Optional[date] = None
    tempo_entrega_dias: Optional[float] = None
    tempo_entrega_estimado_dias: Optional[float] = None
    diferenca_entrega_dias: Optional[float] = None
    entrega_no_prazo: Optional[str] = None


class PedidoCreate(PedidoBase):
    pass


class PedidoResponse(PedidoBase):
    id_pedido: str

    model_config = ConfigDict(from_attributes=True)
