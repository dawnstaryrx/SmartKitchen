"""add ingredient module

Revision ID: f8a9c12e4b07
Revises: 28d67200ff11
Create Date: 2026-06-17 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f8a9c12e4b07'
down_revision: Union[str, Sequence[str], None] = '28d67200ff11'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: 创建食材管理模块四张表"""

    # 1. 食材分类表
    op.create_table(
        'ingredient_category',
        sa.Column(
            'id',
            sa.Integer(),
            autoincrement=True,
            nullable=False,
            comment='主键ID'
        ),
        sa.Column(
            'name',
            sa.String(length=50),
            nullable=False,
            comment='分类名称'
        ),
        sa.Column(
            'code',
            sa.String(length=50),
            nullable=False,
            comment='分类编码'
        ),
        sa.Column(
            'sort',
            sa.Integer(),
            nullable=False,
            server_default='0',
            comment='排序值'
        ),
        sa.Column(
            'status',
            sa.Boolean(),
            nullable=False,
            server_default=sa.text('true'),
            comment='状态：True启用 False禁用'
        ),
        sa.Column(
            'remark',
            sa.String(length=255),
            nullable=True,
            comment='备注'
        ),
        sa.Column(
            'created_at',
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
            comment='创建时间'
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
            comment='更新时间'
        ),
        sa.Column(
            'is_deleted',
            sa.Boolean(),
            nullable=False,
            server_default=sa.text('false'),
            comment='是否软删除'
        ),
        sa.PrimaryKeyConstraint('id', name='pk_ingredient_category'),
        sa.UniqueConstraint('code', name='uq_ingredient_category_code'),
        comment='食材分类表'
    )

    op.create_index(
        'ix_ingredient_category_name',
        'ingredient_category',
        ['name'],
        unique=False
    )

    op.create_index(
        'ix_ingredient_category_code',
        'ingredient_category',
        ['code'],
        unique=True
    )

    # 2. 食材基础信息表
    op.create_table(
        'ingredient',
        sa.Column(
            'id',
            sa.Integer(),
            autoincrement=True,
            nullable=False,
            comment='主键ID'
        ),
        sa.Column(
            'category_id',
            sa.Integer(),
            nullable=False,
            comment='分类ID'
        ),
        sa.Column(
            'name',
            sa.String(length=100),
            nullable=False,
            comment='食材名称'
        ),
        sa.Column(
            'alias_name',
            sa.String(length=200),
            nullable=True,
            comment='别名'
        ),
        sa.Column(
            'cover_image',
            sa.String(length=500),
            nullable=True,
            comment='封面图URL'
        ),
        sa.Column(
            'description',
            sa.Text(),
            nullable=True,
            comment='基本介绍'
        ),
        sa.Column(
            'edible_value',
            sa.Text(),
            nullable=True,
            comment='食用价值'
        ),
        sa.Column(
            'suitable_people',
            sa.Text(),
            nullable=True,
            comment='适宜人群'
        ),
        sa.Column(
            'contraindications',
            sa.Text(),
            nullable=True,
            comment='禁忌搭配'
        ),
        sa.Column(
            'origin_place',
            sa.String(length=200),
            nullable=True,
            comment='产地'
        ),
        sa.Column(
            'season',
            sa.String(length=100),
            nullable=True,
            comment='时令季节'
        ),
        sa.Column(
            'status',
            sa.Boolean(),
            nullable=False,
            server_default=sa.text('true'),
            comment='状态：True启用 False禁用'
        ),
        sa.Column(
            'created_at',
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
            comment='创建时间'
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
            comment='更新时间'
        ),
        sa.Column(
            'is_deleted',
            sa.Boolean(),
            nullable=False,
            server_default=sa.text('false'),
            comment='是否软删除'
        ),
        sa.ForeignKeyConstraint(
            ['category_id'],
            ['ingredient_category.id'],
            name='fk_ingredient_category_id',
            ondelete='RESTRICT'
        ),
        sa.PrimaryKeyConstraint('id', name='pk_ingredient'),
        comment='食材基础信息表'
    )

    op.create_index(
        'ix_ingredient_category_id',
        'ingredient',
        ['category_id'],
        unique=False
    )

    op.create_index(
        'ix_ingredient_name',
        'ingredient',
        ['name'],
        unique=False
    )

    op.create_index(
        'ix_ingredient_is_deleted',
        'ingredient',
        ['is_deleted'],
        unique=False
    )

    # 3. 食材营养成分表
    op.create_table(
        'ingredient_nutrition',
        sa.Column(
            'id',
            sa.Integer(),
            autoincrement=True,
            nullable=False,
            comment='主键ID'
        ),
        sa.Column(
            'ingredient_id',
            sa.Integer(),
            nullable=False,
            comment='食材ID'
        ),
        sa.Column(
            'calories',
            sa.Numeric(precision=10, scale=2),
            nullable=True,
            comment='热量(千卡/100g)'
        ),
        sa.Column(
            'protein',
            sa.Numeric(precision=10, scale=2),
            nullable=True,
            comment='蛋白质(g/100g)'
        ),
        sa.Column(
            'fat',
            sa.Numeric(precision=10, scale=2),
            nullable=True,
            comment='脂肪(g/100g)'
        ),
        sa.Column(
            'carbohydrate',
            sa.Numeric(precision=10, scale=2),
            nullable=True,
            comment='碳水化合物(g/100g)'
        ),
        sa.Column(
            'fiber',
            sa.Numeric(precision=10, scale=2),
            nullable=True,
            comment='膳食纤维(g/100g)'
        ),
        sa.Column(
            'vitamins',
            sa.Text(),
            nullable=True,
            comment='维生素说明'
        ),
        sa.Column(
            'minerals',
            sa.Text(),
            nullable=True,
            comment='矿物质说明'
        ),
        sa.Column(
            'remark',
            sa.String(length=500),
            nullable=True,
            comment='备注'
        ),
        sa.Column(
            'created_at',
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
            comment='创建时间'
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
            comment='更新时间'
        ),
        sa.Column(
            'is_deleted',
            sa.Boolean(),
            nullable=False,
            server_default=sa.text('false'),
            comment='是否软删除'
        ),
        sa.ForeignKeyConstraint(
            ['ingredient_id'],
            ['ingredient.id'],
            name='fk_ingredient_nutrition_ingredient_id',
            ondelete='CASCADE'
        ),
        sa.PrimaryKeyConstraint('id', name='pk_ingredient_nutrition'),
        sa.UniqueConstraint(
            'ingredient_id',
            name='uq_ingredient_nutrition_ingredient_id'
        ),
        comment='食材营养成分表'
    )

    op.create_index(
        'ix_ingredient_nutrition_ingredient_id',
        'ingredient_nutrition',
        ['ingredient_id'],
        unique=True
    )

    # 4. 食材保存指南表
    op.create_table(
        'ingredient_storage',
        sa.Column(
            'id',
            sa.Integer(),
            autoincrement=True,
            nullable=False,
            comment='主键ID'
        ),
        sa.Column(
            'ingredient_id',
            sa.Integer(),
            nullable=False,
            comment='食材ID'
        ),
        sa.Column(
            'room_temperature_days',
            sa.Integer(),
            nullable=True,
            comment='常温保存天数'
        ),
        sa.Column(
            'refrigerated_days',
            sa.Integer(),
            nullable=True,
            comment='冷藏保存天数'
        ),
        sa.Column(
            'frozen_days',
            sa.Integer(),
            nullable=True,
            comment='冷冻保存天数'
        ),
        sa.Column(
            'room_temperature_method',
            sa.Text(),
            nullable=True,
            comment='常温保存方法'
        ),
        sa.Column(
            'refrigerated_method',
            sa.Text(),
            nullable=True,
            comment='冷藏保存方法'
        ),
        sa.Column(
            'frozen_method',
            sa.Text(),
            nullable=True,
            comment='冷冻保存方法'
        ),
        sa.Column(
            'spoilage_signs',
            sa.Text(),
            nullable=True,
            comment='变质判断方法'
        ),
        sa.Column(
            'remark',
            sa.String(length=500),
            nullable=True,
            comment='备注'
        ),
        sa.Column(
            'created_at',
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
            comment='创建时间'
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
            comment='更新时间'
        ),
        sa.Column(
            'is_deleted',
            sa.Boolean(),
            nullable=False,
            server_default=sa.text('false'),
            comment='是否软删除'
        ),
        sa.ForeignKeyConstraint(
            ['ingredient_id'],
            ['ingredient.id'],
            name='fk_ingredient_storage_ingredient_id',
            ondelete='CASCADE'
        ),
        sa.PrimaryKeyConstraint('id', name='pk_ingredient_storage'),
        sa.UniqueConstraint(
            'ingredient_id',
            name='uq_ingredient_storage_ingredient_id'
        ),
        comment='食材保存指南表'
    )

    op.create_index(
        'ix_ingredient_storage_ingredient_id',
        'ingredient_storage',
        ['ingredient_id'],
        unique=True
    )


def downgrade() -> None:
    """Downgrade schema: 回滚食材管理模块四张表"""

    op.drop_index(
        'ix_ingredient_storage_ingredient_id',
        table_name='ingredient_storage'
    )

    op.drop_table('ingredient_storage')

    op.drop_index(
        'ix_ingredient_nutrition_ingredient_id',
        table_name='ingredient_nutrition'
    )

    op.drop_table('ingredient_nutrition')

    op.drop_index(
        'ix_ingredient_is_deleted',
        table_name='ingredient'
    )
    op.drop_index(
        'ix_ingredient_name',
        table_name='ingredient'
    )
    op.drop_index(
        'ix_ingredient_category_id',
        table_name='ingredient'
    )

    op.drop_table('ingredient')

    op.drop_index(
        'ix_ingredient_category_code',
        table_name='ingredient_category'
    )
    op.drop_index(
        'ix_ingredient_category_name',
        table_name='ingredient_category'
    )

    op.drop_table('ingredient_category')
