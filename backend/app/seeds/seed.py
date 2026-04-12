import os
import pandas as pd
from sqlalchemy.orm import Session

from app.database import engine, Base
from app.models import (
    Consumidor,
    Produto,
    Vendedor,
    Pedido,
    ItemPedido,
    AvaliacaoPedido,
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

# Ordem importa: dimensões antes dos fatos (por causa das foreign keys)
SEEDS = [
    ("dim_consumidores.csv",       Consumidor),
    ("dim_produtos.csv",           Produto),
    ("dim_vendedores.csv",         Vendedor),
    ("fat_pedidos.csv",            Pedido),
    ("fat_itens_pedidos.csv",      ItemPedido),
    ("fat_avaliacoes_pedidos.csv", AvaliacaoPedido),
]


def seed():
    print("🌱 Iniciando seed do banco de dados...\n")

    with Session(engine) as session:
        for filename, Model in SEEDS:
            path = os.path.join(DATA_DIR, filename)

            if not os.path.exists(path):
                print(f"⚠️  Arquivo não encontrado, pulando: {path}")
                continue

            df = pd.read_csv(path)
            
            df = df.dropna(how="all")

            # Preenche categoria vazia antes de inserir
            if Model == Produto:
                if "categoria_produto" not in df.columns:
                    df["categoria_produto"] = "Sem categoria"
                else:
                    df["categoria_produto"] = (
                        df["categoria_produto"]
                        .fillna("")
                        .astype(str)
                        .str.strip()
                        .replace({"": "Sem categoria", "nan": "Sem categoria", "NaN": "Sem categoria"})
                    )

            # Converte datas/horas para tipos Python compatíveis com SQLite
            if Model == Pedido:
                for col in ["pedido_compra_timestamp", "pedido_entregue_timestamp"]:
                    if col in df.columns:
                        df[col] = pd.to_datetime(df[col], errors="coerce")
                if "data_estimada_entrega" in df.columns:
                    df["data_estimada_entrega"] = pd.to_datetime(
                        df["data_estimada_entrega"], errors="coerce"
                    ).dt.date

            if Model == AvaliacaoPedido:
                for col in ["data_comentario", "data_resposta"]:
                    if col in df.columns:
                        df[col] = pd.to_datetime(df[col], errors="coerce")
                if "id_avaliacao" in df.columns:
                    df = df.drop_duplicates(subset=["id_avaliacao"], keep="first")

            records = []
            for _, row in df.iterrows():
                data = {k: (None if pd.isna(v) else v) for k, v in row.items()}
                if Model == Produto and not data.get("categoria_produto"):
                    data["categoria_produto"] = "Sem categoria"
                records.append(Model(**data))

            session.bulk_save_objects(records)
            print(f"✅ {filename:<35} → {len(records)} registros inseridos")

        session.commit()

    print("\n🎉 Seed concluído com sucesso!")


if __name__ == "__main__":
    seed()
