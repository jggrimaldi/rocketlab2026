import csv
from functools import lru_cache
from pathlib import Path
from typing import Dict, List
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.avaliacao_pedido import AvaliacaoPedido
from app.models.item_pedido import ItemPedido
from app.models.pedido import Pedido
from app.models.produto import Produto
from app.schemas.produto import ProdutoCreate, ProdutoResponse, ProdutoUpdate
from app.schemas.produto_metricas import (
    AvaliacoesProdutoResponse,
    VendasProdutoResponse,
)

router = APIRouter(prefix="/produtos", tags=["Produtos"])


@lru_cache(maxsize=1)
def _carregar_imagens_categoria() -> Dict[str, str]:
    arquivo = (
        Path(__file__).resolve().parents[1]
        / "seeds"
        / "data"
        / "dim_categoria_imagens.csv"
    )

    if not arquivo.exists():
        return {}

    imagens: Dict[str, str] = {}
    with arquivo.open("r", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            categoria = (row.get("Categoria") or "").strip()
            link = (row.get("Link") or "").strip()
            if categoria and link:
                imagens[categoria] = link
    return imagens


@router.get("/", response_model=List[ProdutoResponse])
def listar_produtos(db: Session = Depends(get_db)):
    return db.query(Produto).all()


@router.get("/categorias/imagens", response_model=Dict[str, str])
def listar_imagens_categorias():
    return _carregar_imagens_categoria()


@router.get("/precos", response_model=Dict[str, float])
def listar_precos_produtos(db: Session = Depends(get_db)):
    precos = (
        db.query(ItemPedido.id_produto, func.avg(ItemPedido.preco_BRL))
        .group_by(ItemPedido.id_produto)
        .all()
    )
    return {id_produto: float(preco or 0) for id_produto, preco in precos}


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


@router.delete("/{id_produto}", status_code=204)
def deletar_produto(id_produto: str, db: Session = Depends(get_db)):
    produto = db.query(Produto).filter(Produto.id_produto == id_produto).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    db.delete(produto)
    db.commit()


@router.get("/{id_produto}/avaliacoes", response_model=AvaliacoesProdutoResponse)
def avaliacoes_produto(id_produto: str, db: Session = Depends(get_db)):
    produto = db.query(Produto).filter(Produto.id_produto == id_produto).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    avaliacoes = (
        db.query(AvaliacaoPedido)
        .join(Pedido, Pedido.id_pedido == AvaliacaoPedido.id_pedido)
        .join(ItemPedido, ItemPedido.id_pedido == Pedido.id_pedido)
        .filter(ItemPedido.id_produto == id_produto)
        .distinct(AvaliacaoPedido.id_avaliacao)
        .all()
    )

    total_avaliacoes = len(avaliacoes)
    if total_avaliacoes:
        media = round(
            sum(avaliacao.avaliacao for avaliacao in avaliacoes) / total_avaliacoes,
            2,
        )
    else:
        media = 0.0

    return AvaliacoesProdutoResponse(
        media=media,
        total_avaliacoes=total_avaliacoes,
        avaliacoes=avaliacoes,
    )


@router.get("/{id_produto}/vendas", response_model=VendasProdutoResponse)
def vendas_produto(id_produto: str, db: Session = Depends(get_db)):
    produto = db.query(Produto).filter(Produto.id_produto == id_produto).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    total_vendas, receita_total, receita_frete = (
        db.query(
            func.count(ItemPedido.id_item),
            func.coalesce(func.sum(ItemPedido.preco_BRL), 0.0),
            func.coalesce(func.sum(ItemPedido.preco_frete), 0.0),
        )
        .filter(ItemPedido.id_produto == id_produto)
        .one()
    )

    return VendasProdutoResponse(
        total_vendas=total_vendas,
        receita_total=float(receita_total),
        receita_frete=float(receita_frete),
    )
