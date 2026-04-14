from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.avaliacao_pedido import AvaliacaoPedido
from app.models.consumidor import Consumidor
from app.models.item_pedido import ItemPedido
from app.models.pedido import Pedido
from app.models.produto import Produto
from app.schemas.dashboard import (
    DashboardCategoriaItem,
    DashboardReceitaMensalItem,
    DashboardResumoResponse,
    DashboardTopAvaliadoItem,
    DashboardTopVendaItem,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/resumo", response_model=DashboardResumoResponse)
def dashboard_resumo(db: Session = Depends(get_db)):
    total_produtos = db.query(func.count(Produto.id_produto)).scalar() or 0
    total_consumidores = db.query(func.count(Consumidor.id_consumidor)).scalar() or 0
    total_pedidos = db.query(func.count(Pedido.id_pedido)).scalar() or 0
    receita_total = db.query(func.coalesce(func.sum(ItemPedido.preco_BRL), 0.0)).scalar() or 0.0
    avaliacao_media_geral = db.query(func.coalesce(func.avg(AvaliacaoPedido.avaliacao), 0.0)).scalar() or 0.0

    return DashboardResumoResponse(
        total_produtos=int(total_produtos),
        total_consumidores=int(total_consumidores),
        total_pedidos=int(total_pedidos),
        receita_total=float(receita_total),
        avaliacao_media_geral=float(avaliacao_media_geral),
    )


@router.get("/top-vendas", response_model=list[DashboardTopVendaItem])
def dashboard_top_vendas(
    limit: int = Query(10, ge=1, le=20),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(
            Produto.id_produto,
            Produto.nome_produto,
            Produto.categoria_produto,
            func.count(ItemPedido.id_item).label("total_vendas"),
            func.coalesce(func.sum(ItemPedido.preco_BRL), 0.0).label("receita_total"),
            func.coalesce(func.avg(ItemPedido.preco_BRL), 0.0).label("preco_medio"),
        )
        .join(ItemPedido, ItemPedido.id_produto == Produto.id_produto)
        .group_by(Produto.id_produto, Produto.nome_produto, Produto.categoria_produto)
        .order_by(func.count(ItemPedido.id_item).desc(), func.sum(ItemPedido.preco_BRL).desc())
        .limit(limit)
        .all()
    )

    return [
        DashboardTopVendaItem(
            id_produto=row.id_produto,
            nome_produto=row.nome_produto,
            categoria_produto=row.categoria_produto,
            total_vendas=int(row.total_vendas or 0),
            receita_total=float(row.receita_total or 0),
            preco_medio=float(row.preco_medio or 0),
        )
        for row in rows
    ]


@router.get("/top-avaliados", response_model=list[DashboardTopAvaliadoItem])
def dashboard_top_avaliados(
    limit: int = Query(10, ge=1, le=20),
    db: Session = Depends(get_db),
):
    avaliacoes_subquery = (
        db.query(
            ItemPedido.id_produto.label("id_produto"),
            func.avg(AvaliacaoPedido.avaliacao).label("avaliacao_media"),
            func.count(AvaliacaoPedido.id_avaliacao).label("total_avaliacoes"),
        )
        .join(Pedido, Pedido.id_pedido == ItemPedido.id_pedido)
        .join(AvaliacaoPedido, AvaliacaoPedido.id_pedido == Pedido.id_pedido)
        .group_by(ItemPedido.id_produto)
        .subquery()
    )

    rows = (
        db.query(
            Produto.id_produto,
            Produto.nome_produto,
            Produto.categoria_produto,
            avaliacoes_subquery.c.avaliacao_media,
            avaliacoes_subquery.c.total_avaliacoes,
        )
        .join(avaliacoes_subquery, avaliacoes_subquery.c.id_produto == Produto.id_produto)
        .order_by(
            avaliacoes_subquery.c.avaliacao_media.desc(),
            avaliacoes_subquery.c.total_avaliacoes.desc(),
        )
        .limit(limit)
        .all()
    )

    return [
        DashboardTopAvaliadoItem(
            id_produto=row.id_produto,
            nome_produto=row.nome_produto,
            categoria_produto=row.categoria_produto,
            avaliacao_media=float(row.avaliacao_media or 0),
            total_avaliacoes=int(row.total_avaliacoes or 0),
        )
        for row in rows
    ]


@router.get("/categorias", response_model=list[DashboardCategoriaItem])
def dashboard_categorias(
    limit: int = Query(20, ge=1, le=30),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(
            Produto.categoria_produto,
            func.count(func.distinct(Produto.id_produto)).label("total_produtos"),
            func.count(ItemPedido.id_item).label("total_vendas"),
            func.coalesce(func.sum(ItemPedido.preco_BRL), 0.0).label("receita_total"),
        )
        .outerjoin(ItemPedido, ItemPedido.id_produto == Produto.id_produto)
        .group_by(Produto.categoria_produto)
        .order_by(func.count(func.distinct(Produto.id_produto)).desc(), Produto.categoria_produto.asc())
        .limit(limit)
        .all()
    )

    return [
        DashboardCategoriaItem(
            categoria_produto=row.categoria_produto,
            total_produtos=int(row.total_produtos or 0),
            total_vendas=int(row.total_vendas or 0),
            receita_total=float(row.receita_total or 0),
        )
        for row in rows
    ]


@router.get("/receita-mensal", response_model=list[DashboardReceitaMensalItem])
def dashboard_receita_mensal(
    limit: int = Query(12, ge=1, le=24),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(
            func.strftime("%Y-%m", Pedido.pedido_compra_timestamp).label("mes"),
            func.count(func.distinct(Pedido.id_pedido)).label("total_pedidos"),
            func.coalesce(func.sum(ItemPedido.preco_BRL), 0.0).label("receita_total"),
        )
        .join(ItemPedido, ItemPedido.id_pedido == Pedido.id_pedido)
        .filter(Pedido.pedido_compra_timestamp.isnot(None))
        .group_by(func.strftime("%Y-%m", Pedido.pedido_compra_timestamp))
        .order_by(func.strftime("%Y-%m", Pedido.pedido_compra_timestamp).desc())
        .limit(limit)
        .all()
    )

    return [
        DashboardReceitaMensalItem(
            mes=row.mes,
            total_pedidos=int(row.total_pedidos or 0),
            receita_total=float(row.receita_total or 0),
        )
        for row in reversed(rows)
        if row.mes
    ]
