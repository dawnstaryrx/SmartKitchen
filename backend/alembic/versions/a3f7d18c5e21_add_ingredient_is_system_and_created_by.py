"""add ingredient is_system and created_by

Revision ID: a3f7d18c5e21
Revises: f8a9c12e4b07
Create Date: 2026-06-18 09:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a3f7d18c5e21'
down_revision: Union[str, Sequence[str], None] = 'f8a9c12e4b07'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: 食材表新增 is_system、created_by 字段"""

    op.add_column(
        'ingredient',
        sa.Column(
            'is_system',
            sa.Boolean(),
            nullable=False,
            server_default=sa.text('false'),
            comment='是否系统食材：True系统内置 False用户创建'
        )
    )

    op.add_column(
        'ingredient',
        sa.Column(
            'created_by',
            sa.Integer(),
            nullable=True,
            comment='创建人ID'
        )
    )

    op.create_foreign_key(
        'fk_ingredient_created_by',
        'ingredient',
        'users',
        ['created_by'],
        ['id'],
        ondelete='SET NULL'
    )

    op.create_index(
        'ix_ingredient_created_by',
        'ingredient',
        ['created_by'],
        unique=False
    )

    op.create_index(
        'ix_ingredient_is_system',
        'ingredient',
        ['is_system'],
        unique=False
    )


def downgrade() -> None:
    """Downgrade schema: 回滚食材表 is_system、created_by 字段"""

    op.drop_index('ix_ingredient_is_system', table_name='ingredient')
    op.drop_index('ix_ingredient_created_by', table_name='ingredient')

    op.drop_constraint(
        'fk_ingredient_created_by',
        'ingredient',
        type_='foreignkey'
    )

    op.drop_column('ingredient', 'created_by')
    op.drop_column('ingredient', 'is_system')
