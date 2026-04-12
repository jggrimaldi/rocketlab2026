from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.consumidor import Consumidor
from app.schemas.consumidor import ConsumidorResponse

router = APIRouter(prefix="/consumidores", tags=["Consumidores"])


@router.get("/", response_model=List[ConsumidorResponse])
def listar_consumidores(nome: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Consumidor)
    if nome:
        query = query.filter(Consumidor.nome_consumidor.ilike(f"%{nome}%"))
    return query.all()


@router.get("/{id_consumidor}", response_model=ConsumidorResponse)
def buscar_consumidor(id_consumidor: str, db: Session = Depends(get_db)):
    consumidor = (
        db.query(Consumidor).filter(Consumidor.id_consumidor == id_consumidor).first()
    )
    if not consumidor:
        raise HTTPException(status_code=404, detail="Consumidor não encontrado")
    return consumidor
