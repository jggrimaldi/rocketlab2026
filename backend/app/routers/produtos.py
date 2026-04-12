from typing import List
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.produto import Produto
from app.schemas.produto import ProdutoCreate, ProdutoResponse, ProdutoUpdate

router = APIRouter(prefix="/produtos", tags=["Produtos"])


@router.get("/", response_model=List[ProdutoResponse])
def listar_produtos(db: Session = Depends(get_db)):
    return db.query(Produto).all()


@router.get("/{id_produto}", response_model=ProdutoResponse)
def buscar_produto(id_produto: str, db: Session = Depends(get_db)):
    produto = db.query(Produto).filter(Produto.id_produto == id_produto).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return produto


@router.post("/", response_model=ProdutoResponse, status_code=201)
def criar_produto(payload: ProdutoCreate, db: Session = Depends(get_db)):
    produto = Produto(id_produto=uuid4().hex, **payload.model_dump())
    db.add(produto)
    db.commit()
    db.refresh(produto)
    return produto


@router.patch("/{id_produto}", response_model=ProdutoResponse)
def atualizar_produto(
    id_produto: str,
    payload: ProdutoUpdate,
    db: Session = Depends(get_db),
):
    produto = db.query(Produto).filter(Produto.id_produto == id_produto).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    dados = payload.model_dump(exclude_unset=True)
    for campo, valor in dados.items():
        setattr(produto, campo, valor)

    db.commit()
    db.refresh(produto)
    return produto
