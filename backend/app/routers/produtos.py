import csv
from functools import lru_cache
from math import ceil
from pathlib import Path
from typing import Dict
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.avaliacao_pedido import AvaliacaoPedido
from app.models.item_pedido import ItemPedido
from app.models.pedido import Pedido
from app.models.produto import Produto
from app.models.vendedor import Vendedor
from app.schemas.pagination import PaginatedResponse
from app.schemas.produto import (
    ProdutoCreate,
    ProdutoListItemResponse,
    ProdutoResponse,
    ProdutoUpdate,
)
from app.schemas.produto_admin import ProdutoAdminResponse
from app.schemas.produto_metricas import (
    AvaliacoesProdutoResponse,
    VendasProdutoResponse,
)

router = APIRouter(prefix="/produtos", tags=["Produtos"])


def _listar_produtos_otimizado(
    db: Session,
    skip: int,
    limit: int,
    order_by: str,
    order_dir: str,
    categoria: str,
    search: str,
) -> PaginatedResponse[ProdutoListItemResponse]:
    valid_order_fields = ["nome_produto", "preco", "avaliacao_media"]
    if order_by not in valid_order_fields:
        order_by = "nome_produto"

    if order_dir not in ["asc", "desc"]:
        order_dir = "asc"

    precos_subquery = (
        db.query(
            ItemPedido.id_produto.label("id_produto"),
            func.avg(ItemPedido.preco_BRL).label("preco"),
        )
        .group_by(ItemPedido.id_produto)
        .subquery()
    )

    avaliacoes_subquery = (
        db.query(
            ItemPedido.id_produto.label("id_produto"),
            func.avg(AvaliacaoPedido.avaliacao).label("avaliacao_media"),
        )
        .join(Pedido, Pedido.id_pedido == ItemPedido.id_pedido)
        .join(AvaliacaoPedido, AvaliacaoPedido.id_pedido == Pedido.id_pedido)
        .group_by(ItemPedido.id_produto)
        .subquery()
    )

    vendedores_subquery = (
        db.query(
            ItemPedido.id_produto.label("id_produto"),
            func.min(Vendedor.nome_vendedor).label("nome_vendedor"),
        )
        .join(Vendedor, Vendedor.id_vendedor == ItemPedido.id_vendedor)
        .group_by(ItemPedido.id_produto)
        .subquery()
    )

    query = (
        db.query(
            Produto.id_produto,
            Produto.nome_produto,
            Produto.categoria_produto,
            func.coalesce(precos_subquery.c.preco, Produto.preco, 0).label("preco"),
            func.coalesce(vendedores_subquery.c.nome_vendedor, "—").label("nome_vendedor"),
            func.coalesce(avaliacoes_subquery.c.avaliacao_media, 0).label("avaliacao_media"),
        )
        .outerjoin(precos_subquery, precos_subquery.c.id_produto == Produto.id_produto)
        .outerjoin(vendedores_subquery, vendedores_subquery.c.id_produto == Produto.id_produto)
        .outerjoin(avaliacoes_subquery, avaliacoes_subquery.c.id_produto == Produto.id_produto)
    )

    if categoria:
        query = query.filter(Produto.categoria_produto == categoria)

    if search:
        query = query.filter(Produto.nome_produto.ilike(f"%{search}%"))

    total = query.order_by(None).count()

    order_column = {
        "nome_produto": Produto.nome_produto,
        "preco": func.coalesce(precos_subquery.c.preco, Produto.preco, 0),
        "avaliacao_media": func.coalesce(avaliacoes_subquery.c.avaliacao_media, 0),
    }[order_by]
    order_expression = order_column.desc() if order_dir == "desc" else order_column.asc()

    produtos = query.order_by(order_expression, Produto.id_produto.asc()).offset(skip).limit(limit).all()
    pages = ceil(total / limit) if limit > 0 else 0

    items = [
        ProdutoListItemResponse(
            id_produto=produto.id_produto,
            nome_produto=produto.nome_produto,
            categoria_produto=produto.categoria_produto,
            preco=float(produto.preco or 0),
            nome_vendedor=produto.nome_vendedor,
            avaliacao_media=float(produto.avaliacao_media or 0),
        )
        for produto in produtos
    ]

    return PaginatedResponse[ProdutoListItemResponse](
        items=items,
        total=total,
        skip=skip,
        limit=limit,
        pages=pages,
    )


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


@router.get("/catalogo", response_model=PaginatedResponse[ProdutoListItemResponse])
def listar_produtos_catalogo(
    skip: int = Query(0, ge=0, description="Número de registros a pular"),
    limit: int = Query(20, ge=1, le=100, description="Limite de registros por página"),
    order_by: str = Query("nome_produto", description="Campo para ordenação: nome_produto, preco, avaliacao_media"),
    order_dir: str = Query("asc", description="Direção da ordenação: asc ou desc"),
    categoria: str = Query("", description="Filtrar por categoria"),
    search: str = Query("", description="Buscar por nome do produto"),
    db: Session = Depends(get_db),
):
    return _listar_produtos_otimizado(
        db=db,
        skip=skip,
        limit=limit,
        order_by=order_by,
        order_dir=order_dir,
        categoria=categoria,
        search=search,
    )


@router.get("/", response_model=PaginatedResponse[ProdutoListItemResponse])
def listar_produtos(
    skip: int = Query(0, ge=0, description="Número de registros a pular"),
    limit: int = Query(20, ge=1, le=100, description="Limite de registros por página"),
    order_by: str = Query("nome_produto", description="Campo para ordenação: nome_produto, preco, avaliacao_media"),
    order_dir: str = Query("asc", description="Direção da ordenação: asc ou desc"),
    categoria: str = Query("", description="Filtrar por categoria"),
    search: str = Query("", description="Buscar por nome do produto"),
    db: Session = Depends(get_db),
):
    return _listar_produtos_otimizado(
        db=db,
        skip=skip,
        limit=limit,
        order_by=order_by,
        order_dir=order_dir,
        categoria=categoria,
        search=search,
    )


@router.get("/lista-admin", response_model=PaginatedResponse[ProdutoAdminResponse])
def listar_produtos_admin(
    skip: int = Query(0, ge=0, description="Número de registros a pular"),
    limit: int = Query(12, ge=1, le=100, description="Limite de registros por página"),
    order_by: str = Query("nome_produto", description="Campo para ordenação: nome_produto, preco, avaliacao_media, total_vendas"),
    order_dir: str = Query("asc", description="Direção da ordenação: asc ou desc"),
    db: Session = Depends(get_db),
):
    """
    Endpoint otimizado para listagem administrativa de produtos.
    
    Retorna produtos com:
    - Preço médio de venda
    - Nome do vendedor mais frequente
    - Avaliação média
    - Total de vendas
    
    - **skip**: Número de registros a pular (offset)
    - **limit**: Quantidade de registros por página (máximo 100)
    - **order_by**: Campo para ordenação (nome_produto, preco, avaliacao_media, total_vendas)
    - **order_dir**: Direção da ordenação (asc, desc)
    """
    # Validar parâmetros de ordenação
    valid_order_fields = ["nome_produto", "preco", "avaliacao_media", "total_vendas"]
    if order_by not in valid_order_fields:
        order_by = "nome_produto"
    
    if order_dir not in ["asc", "desc"]:
        order_dir = "asc"
    
    # Contar total
    total = db.query(func.count(Produto.id_produto)).scalar() or 0
    
    # Buscar apenas produtos (primeira página)
    produtos_base = db.query(Produto).offset(skip).limit(limit).all()
    
    # Para cada produto, agregar dados
    produtos_dados = []
    for produto in produtos_base:
        # Preço médio
        preco_result = (
            db.query(func.avg(ItemPedido.preco_BRL))
            .filter(ItemPedido.id_produto == produto.id_produto)
            .scalar()
        )
        preco = float(preco_result or produto.preco or 0)
        
        # Total de vendas
        total_vendas = (
            db.query(func.count(ItemPedido.id_item))
            .filter(ItemPedido.id_produto == produto.id_produto)
            .scalar() or 0
        )
        
        # Avaliação média
        media_avaliacao = (
            db.query(func.avg(AvaliacaoPedido.avaliacao))
            .join(Pedido, Pedido.id_pedido == AvaliacaoPedido.id_pedido)
            .join(ItemPedido, ItemPedido.id_pedido == Pedido.id_pedido)
            .filter(ItemPedido.id_produto == produto.id_produto)
            .scalar()
        )
        media_avaliacao = float(media_avaliacao or 0)
        
        # Nome do vendedor (do primeiro item do produto)
        vendedor_result = (
            db.query(Vendedor.nome_vendedor)
            .join(ItemPedido, ItemPedido.id_vendedor == Vendedor.id_vendedor)
            .filter(ItemPedido.id_produto == produto.id_produto)
            .first()
        )
        nome_vendedor = vendedor_result[0] if vendedor_result else "—"
        
        produtos_dados.append(
            ProdutoAdminResponse(
                id_produto=produto.id_produto,
                nome_produto=produto.nome_produto,
                categoria_produto=produto.categoria_produto,
                preco=preco,
                nome_vendedor=nome_vendedor,
                avaliacao_media=media_avaliacao,
                total_vendas=total_vendas,
            )
        )
    
    # Aplicar ordenação
    if order_by == "nome_produto":
        produtos_dados.sort(key=lambda x: x.nome_produto, reverse=(order_dir == "desc"))
    elif order_by == "preco":
        produtos_dados.sort(key=lambda x: x.preco, reverse=(order_dir == "desc"))
    elif order_by == "avaliacao_media":
        produtos_dados.sort(key=lambda x: x.avaliacao_media, reverse=(order_dir == "desc"))
    elif order_by == "total_vendas":
        produtos_dados.sort(key=lambda x: x.total_vendas, reverse=(order_dir == "desc"))
    
    pages = ceil(total / limit) if limit > 0 else 0
    
    return PaginatedResponse[ProdutoAdminResponse](
        items=produtos_dados,
        total=total,
        skip=skip,
        limit=limit,
        pages=pages,
    )


@router.get("/lista", response_model=PaginatedResponse[ProdutoListItemResponse])
def listar_produtos_paginado(
    skip: int = Query(0, ge=0, description="Número de registros a pular"),
    limit: int = Query(20, ge=1, le=100, description="Limite de registros por página"),
    search: str = Query("", description="Buscar por nome do produto"),
    categoria: str = Query("", description="Filtrar por categoria"),
    db: Session = Depends(get_db),
):
    return _listar_produtos_otimizado(
        db=db,
        skip=skip,
        limit=limit,
        order_by="nome_produto",
        order_dir="asc",
        categoria=categoria,
        search=search,
    )


@router.get("/categorias/imagens", response_model=Dict[str, str])
def listar_imagens_categorias():
    return _carregar_imagens_categoria()


@router.get("/categorias", response_model=list[str])
def listar_categorias_produtos(
    search: str = Query("", description="Buscar categorias por nome"),
    limit: int = Query(10, ge=1, le=20, description="Limite de categorias"),
    db: Session = Depends(get_db),
):
    query = db.query(Produto.categoria_produto.distinct())

    if search:
        query = query.filter(Produto.categoria_produto.ilike(f"%{search}%"))

    categorias = (
        query.order_by(Produto.categoria_produto.asc())
        .limit(limit)
        .all()
    )

    return [categoria for (categoria,) in categorias if categoria]


@router.get("/precos", response_model=Dict[str, float])
def listar_precos_produtos(db: Session = Depends(get_db)):
    precos = (
        db.query(
            Produto.id_produto,
            func.coalesce(func.avg(ItemPedido.preco_BRL), Produto.preco, 0.0),
        )
        .outerjoin(ItemPedido, ItemPedido.id_produto == Produto.id_produto)
        .group_by(Produto.id_produto, Produto.preco)
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
    preco = dados.pop("preco", None)

    for campo, valor in dados.items():
        setattr(produto, campo, valor)

    if preco is not None:
        produto.preco = preco
        db.query(ItemPedido).filter(ItemPedido.id_produto == id_produto).update(
            {ItemPedido.preco_BRL: preco}, synchronize_session=False
        )

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
