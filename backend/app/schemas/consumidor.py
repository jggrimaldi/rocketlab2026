from pydantic import BaseModel, ConfigDict


class ConsumidorBase(BaseModel):
    prefixo_cep: str
    nome_consumidor: str
    cidade: str
    estado: str


class ConsumidorCreate(ConsumidorBase):
    pass


class ConsumidorResponse(ConsumidorBase):
    id_consumidor: str

    model_config = ConfigDict(from_attributes=True)
