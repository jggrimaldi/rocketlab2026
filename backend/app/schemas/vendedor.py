from pydantic import BaseModel, ConfigDict


class VendedorBase(BaseModel):
    nome_vendedor: str
    prefixo_cep: str
    cidade: str
    estado: str


class VendedorCreate(VendedorBase):
    pass


class VendedorResponse(VendedorBase):
    id_vendedor: str

    model_config = ConfigDict(from_attributes=True)
