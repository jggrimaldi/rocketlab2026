"""Add indexes for product listing

Revision ID: 002
Revises: 001
Create Date: 2026-04-13

"""

from typing import Sequence, Union

from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index("ix_produtos_nome_produto", "produtos", ["nome_produto"], unique=False)
    op.create_index("ix_produtos_categoria_produto", "produtos", ["categoria_produto"], unique=False)
    op.create_index("ix_itens_pedidos_id_vendedor", "itens_pedidos", ["id_vendedor"], unique=False)
    op.create_index("ix_itens_pedidos_id_produto", "itens_pedidos", ["id_produto"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_itens_pedidos_id_produto", table_name="itens_pedidos")
    op.drop_index("ix_itens_pedidos_id_vendedor", table_name="itens_pedidos")
    op.drop_index("ix_produtos_categoria_produto", table_name="produtos")
    op.drop_index("ix_produtos_nome_produto", table_name="produtos")
