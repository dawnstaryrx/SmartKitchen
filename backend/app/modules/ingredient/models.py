from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import Numeric
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

from app.core.database import Base


class IngredientCategory(Base):
    """食材分类表"""

    __tablename__ = "ingredient_category"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="主键ID"
    )

    # 分类名称
    name: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
        comment="分类名称"
    )

    # 分类编码（唯一，用于程序识别，便于扩展）
    code: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        index=True,
        comment="分类编码"
    )

    # 排序值，越小越靠前
    sort: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        comment="排序值"
    )

    # 状态：True 启用 / False 禁用
    status: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        comment="状态：True启用 False禁用"
    )

    # 备注
    remark: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        comment="备注"
    )

    # 创建时间
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        comment="创建时间"
    )

    # 更新时间
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        comment="更新时间"
    )

    # 是否软删除
    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        comment="是否软删除"
    )

    # 分类 1:N 食材
    # back_populates 指向另一侧 Ingredient.category，形成正确双向关系
    # lazy="raise"：避免加载分类时把全部食材拉出；需要时用 selectinload 显式加载
    ingredients: Mapped[list["Ingredient"]] = relationship(
        back_populates="category",
        cascade="all, delete-orphan",
        lazy="raise"
    )


class Ingredient(Base):
    """食材基础信息表"""

    __tablename__ = "ingredient"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="主键ID"
    )

    # 分类ID
    category_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "ingredient_category.id",
            ondelete="RESTRICT"
        ),
        nullable=False,
        index=True,
        comment="分类ID"
    )

    # 食材名称
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
        comment="食材名称"
    )

    # 别名
    alias_name: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
        comment="别名"
    )

    # 封面图URL
    cover_image: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        comment="封面图URL"
    )

    # 基本介绍
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="基本介绍"
    )

    # 食用价值
    edible_value: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="食用价值"
    )

    # 适宜人群
    suitable_people: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="适宜人群"
    )

    # 禁忌搭配
    contraindications: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="禁忌搭配"
    )

    # 产地
    origin_place: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
        comment="产地"
    )

    # 时令季节
    season: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        comment="时令季节"
    )

    # 是否系统食材
    is_system: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        comment="是否系统食材：True系统内置 False用户创建"
    )

    # 创建人ID
    created_by: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="创建人ID"
    )

    # 状态：True 启用 / False 禁用
    status: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        comment="状态：True启用 False禁用"
    )

    # 创建时间
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        comment="创建时间"
    )

    # 更新时间
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        comment="更新时间"
    )

    # 是否软删除
    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        comment="是否软删除"
    )

    # 食材 N:1 分类
    category: Mapped["IngredientCategory"] = relationship(
        back_populates="ingredients",
        lazy="selectin"
    )

    # 食材 1:1 营养成分
    # lazy="raise"：异步下禁止隐式懒加载，详情查询用 selectinload 显式加载
    nutrition: Mapped["IngredientNutrition | None"] = relationship(
        back_populates="ingredient",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="raise"
    )

    # 食材 1:1 保存指南
    # lazy="raise"：异步下禁止隐式懒加载，详情查询用 selectinload 显式加载
    storage: Mapped["IngredientStorage | None"] = relationship(
        back_populates="ingredient",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="raise"
    )


class IngredientNutrition(Base):
    """食材营养成分表（与食材 1:1）"""

    __tablename__ = "ingredient_nutrition"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="主键ID"
    )

    # 食材ID
    ingredient_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "ingredient.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        unique=True,
        index=True,
        comment="食材ID"
    )

    # 热量（千卡/100g）
    calories: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
        comment="热量(千卡/100g)"
    )

    # 蛋白质（g/100g）
    protein: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
        comment="蛋白质(g/100g)"
    )

    # 脂肪（g/100g）
    fat: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
        comment="脂肪(g/100g)"
    )

    # 碳水化合物（g/100g）
    carbohydrate: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
        comment="碳水化合物(g/100g)"
    )

    # 膳食纤维（g/100g）
    fiber: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
        comment="膳食纤维(g/100g)"
    )

    # 维生素说明
    vitamins: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="维生素说明"
    )

    # 矿物质说明
    minerals: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="矿物质说明"
    )

    # 备注
    remark: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        comment="备注"
    )

    # 创建时间
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        comment="创建时间"
    )

    # 更新时间
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        comment="更新时间"
    )

    # 是否软删除
    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        comment="是否软删除"
    )

    # 营养成分 1:1 食材
    # lazy="raise"：反向关系按需显式加载，避免级联预加载
    ingredient: Mapped["Ingredient"] = relationship(
        back_populates="nutrition",
        lazy="raise"
    )


class IngredientStorage(Base):
    """食材保存指南表（与食材 1:1）"""

    __tablename__ = "ingredient_storage"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="主键ID"
    )

    # 食材ID
    ingredient_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "ingredient.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        unique=True,
        index=True,
        comment="食材ID"
    )

    # 常温保存天数
    room_temperature_days: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        comment="常温保存天数"
    )

    # 冷藏保存天数
    refrigerated_days: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        comment="冷藏保存天数"
    )

    # 冷冻保存天数
    frozen_days: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        comment="冷冻保存天数"
    )

    # 常温保存方法
    room_temperature_method: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="常温保存方法"
    )

    # 冷藏保存方法
    refrigerated_method: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="冷藏保存方法"
    )

    # 冷冻保存方法
    frozen_method: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="冷冻保存方法"
    )

    # 变质判断方法
    spoilage_signs: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="变质判断方法"
    )

    # 备注
    remark: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        comment="备注"
    )

    # 创建时间
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        comment="创建时间"
    )

    # 更新时间
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        comment="更新时间"
    )

    # 是否软删除
    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        comment="是否软删除"
    )

    # 保存指南 1:1 食材
    # lazy="raise"：反向关系按需显式加载，避免级联预加载
    ingredient: Mapped["Ingredient"] = relationship(
        back_populates="storage",
        lazy="raise"
    )
