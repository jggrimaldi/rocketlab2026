from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.vendedor import Vendedor
from app.schemas.vendedor import VendedorResponse

router = APIRouter(prefix="/vendedores", tags=["Vendedores"])


@router.get("/", response_model=List[VendedorResponse])
def listar_vendedores(nome: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Vendedor)
    if nome:
        query = query.filter(Vendedor.nome_vendedor.ilike(f"%{nome}%"))
    return query.all()


@router.get("/{id_vendedor}", response_model=VendedorResponse)
def buscar_vendedor(id_vendedor: str, db: Session = Depends(get_db)):
    vendedor = (
        db.query(Vendedor).filter(Vendedor.id_vendedor == id_vendedor).first()
    )
    if not vendedor:
        raise HTTPException(status_code=404, detail="Vendedor não encontrado")
    return vendedor
