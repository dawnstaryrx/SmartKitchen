from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel
from pydantic import Field
from pydantic import ConfigDict

from app.common.response import PageData


# ==================================================
# 食材分类 Category
# ==================================================

class CategoryCreateRequest(BaseModel):
    """分类新增请求"""

    name: str = Field(
        min_length=1,
        max_length=50,
        description="分类名称"
    )

    code: str = Field(
        min_length=1,
        max_length=50,
        description="分类编码"
    )

    sort: int = Field(
        default=0,
        ge=0,
        description="排序值"
    )

    status: bool = Field(
        default=True,
        description="状态：True启用 False禁用"
    )

    remark: str | None = Field(
        default=None,
        max_length=255,
        description="备注"
    )


class CategoryUpdateRequest(BaseModel):
    """分类修改请求"""

    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
        description="分类名称"
    )

    code: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
        description="分类编码"
    )

    sort: int | None = Field(
        default=None,
        ge=0,
        description="排序值"
    )

    status: bool | None = Field(
        default=None,
        description="状态：True启用 False禁用"
    )

    remark: str | None = Field(
        default=None,
        max_length=255,
        description="备注"
    )


class CategoryDetailResponse(BaseModel):
    """分类详情响应"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(description="主键ID")

    name: str = Field(description="分类名称")

    code: str = Field(description="分类编码")

    sort: int = Field(description="排序值")

    status: bool = Field(description="状态")

    remark: str | None = Field(description="备注")

    created_at: datetime = Field(description="创建时间")

    updated_at: datetime = Field(description="更新时间")


class CategoryPageResponse(PageData[CategoryDetailResponse]):
    """分类分页响应"""

    pass


class CategoryPageQuery(BaseModel):
    """分类分页查询参数"""

    page: int = Field(
        default=1,
        ge=1,
        description="页码"
    )

    page_size: int = Field(
        default=10,
        ge=1,
        le=100,
        description="每页条数"
    )

    keyword: str | None = Field(
        default=None,
        description="关键字（分类名称模糊搜索）"
    )


# ==================================================
# 营养成分 Nutrition
# ==================================================

class NutritionCreateRequest(BaseModel):
    """营养成分新增请求"""

    ingredient_id: int = Field(
        gt=0,
        description="食材ID"
    )

    calories: Decimal | None = Field(
        default=None,
        description="热量(千卡/100g)"
    )

    protein: Decimal | None = Field(
        default=None,
        description="蛋白质(g/100g)"
    )

    fat: Decimal | None = Field(
        default=None,
        description="脂肪(g/100g)"
    )

    carbohydrate: Decimal | None = Field(
        default=None,
        description="碳水化合物(g/100g)"
    )

    fiber: Decimal | None = Field(
        default=None,
        description="膳食纤维(g/100g)"
    )

    vitamins: str | None = Field(
        default=None,
        description="维生素说明"
    )

    minerals: str | None = Field(
        default=None,
        description="矿物质说明"
    )

    remark: str | None = Field(
        default=None,
        max_length=500,
        description="备注"
    )


class NutritionUpdateRequest(BaseModel):
    """营养成分修改请求"""

    calories: Decimal | None = Field(
        default=None,
        description="热量(千卡/100g)"
    )

    protein: Decimal | None = Field(
        default=None,
        description="蛋白质(g/100g)"
    )

    fat: Decimal | None = Field(
        default=None,
        description="脂肪(g/100g)"
    )

    carbohydrate: Decimal | None = Field(
        default=None,
        description="碳水化合物(g/100g)"
    )

    fiber: Decimal | None = Field(
        default=None,
        description="膳食纤维(g/100g)"
    )

    vitamins: str | None = Field(
        default=None,
        description="维生素说明"
    )

    minerals: str | None = Field(
        default=None,
        description="矿物质说明"
    )

    remark: str | None = Field(
        default=None,
        max_length=500,
        description="备注"
    )


class NutritionDetailResponse(BaseModel):
    """营养成分详情响应"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(description="主键ID")

    ingredient_id: int = Field(description="食材ID")

    calories: float | None = Field(description="热量(千卡/100g)")

    protein: float | None = Field(description="蛋白质(g/100g)")

    fat: float | None = Field(description="脂肪(g/100g)")

    carbohydrate: float | None = Field(description="碳水化合物(g/100g)")

    fiber: float | None = Field(description="膳食纤维(g/100g)")

    vitamins: str | None = Field(description="维生素说明")

    minerals: str | None = Field(description="矿物质说明")

    remark: str | None = Field(description="备注")

    created_at: datetime = Field(description="创建时间")

    updated_at: datetime = Field(description="更新时间")


# ==================================================
# 保存指南 Storage
# ==================================================

class StorageCreateRequest(BaseModel):
    """保存指南新增请求"""

    ingredient_id: int = Field(
        gt=0,
        description="食材ID"
    )

    room_temperature_days: int | None = Field(
        default=None,
        ge=0,
        description="常温保存天数"
    )

    refrigerated_days: int | None = Field(
        default=None,
        ge=0,
        description="冷藏保存天数"
    )

    frozen_days: int | None = Field(
        default=None,
        ge=0,
        description="冷冻保存天数"
    )

    room_temperature_method: str | None = Field(
        default=None,
        description="常温保存方法"
    )

    refrigerated_method: str | None = Field(
        default=None,
        description="冷藏保存方法"
    )

    frozen_method: str | None = Field(
        default=None,
        description="冷冻保存方法"
    )

    spoilage_signs: str | None = Field(
        default=None,
        description="变质判断方法"
    )

    remark: str | None = Field(
        default=None,
        max_length=500,
        description="备注"
    )


class StorageUpdateRequest(BaseModel):
    """保存指南修改请求"""

    room_temperature_days: int | None = Field(
        default=None,
        ge=0,
        description="常温保存天数"
    )

    refrigerated_days: int | None = Field(
        default=None,
        ge=0,
        description="冷藏保存天数"
    )

    frozen_days: int | None = Field(
        default=None,
        ge=0,
        description="冷冻保存天数"
    )

    room_temperature_method: str | None = Field(
        default=None,
        description="常温保存方法"
    )

    refrigerated_method: str | None = Field(
        default=None,
        description="冷藏保存方法"
    )

    frozen_method: str | None = Field(
        default=None,
        description="冷冻保存方法"
    )

    spoilage_signs: str | None = Field(
        default=None,
        description="变质判断方法"
    )

    remark: str | None = Field(
        default=None,
        max_length=500,
        description="备注"
    )


class StorageDetailResponse(BaseModel):
    """保存指南详情响应"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(description="主键ID")

    ingredient_id: int = Field(description="食材ID")

    room_temperature_days: int | None = Field(description="常温保存天数")

    refrigerated_days: int | None = Field(description="冷藏保存天数")

    frozen_days: int | None = Field(description="冷冻保存天数")

    room_temperature_method: str | None = Field(description="常温保存方法")

    refrigerated_method: str | None = Field(description="冷藏保存方法")

    frozen_method: str | None = Field(description="冷冻保存方法")

    spoilage_signs: str | None = Field(description="变质判断方法")

    remark: str | None = Field(description="备注")

    created_at: datetime = Field(description="创建时间")

    updated_at: datetime = Field(description="更新时间")


# ==================================================
# 食材 Ingredient
# ==================================================

class IngredientCreateRequest(BaseModel):
    """食材新增请求"""

    category_id: int = Field(
        gt=0,
        description="分类ID"
    )

    name: str = Field(
        min_length=1,
        max_length=100,
        description="食材名称"
    )

    alias_name: str | None = Field(
        default=None,
        max_length=200,
        description="别名"
    )

    cover_image: str | None = Field(
        default=None,
        max_length=500,
        description="封面图URL"
    )

    description: str | None = Field(
        default=None,
        description="基本介绍"
    )

    edible_value: str | None = Field(
        default=None,
        description="食用价值"
    )

    suitable_people: str | None = Field(
        default=None,
        description="适宜人群"
    )

    contraindications: str | None = Field(
        default=None,
        description="禁忌搭配"
    )

    origin_place: str | None = Field(
        default=None,
        max_length=200,
        description="产地"
    )

    season: str | None = Field(
        default=None,
        max_length=100,
        description="时令季节"
    )

    is_system: bool = Field(
        default=False,
        description="是否系统食材：True系统内置 False用户创建"
    )

    status: bool = Field(
        default=True,
        description="状态：True启用 False禁用"
    )


class IngredientUpdateRequest(BaseModel):
    """食材修改请求"""

    category_id: int | None = Field(
        default=None,
        gt=0,
        description="分类ID"
    )

    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
        description="食材名称"
    )

    alias_name: str | None = Field(
        default=None,
        max_length=200,
        description="别名"
    )

    cover_image: str | None = Field(
        default=None,
        max_length=500,
        description="封面图URL"
    )

    description: str | None = Field(
        default=None,
        description="基本介绍"
    )

    edible_value: str | None = Field(
        default=None,
        description="食用价值"
    )

    suitable_people: str | None = Field(
        default=None,
        description="适宜人群"
    )

    contraindications: str | None = Field(
        default=None,
        description="禁忌搭配"
    )

    origin_place: str | None = Field(
        default=None,
        max_length=200,
        description="产地"
    )

    season: str | None = Field(
        default=None,
        max_length=100,
        description="时令季节"
    )

    is_system: bool | None = Field(
        default=None,
        description="是否系统食材：True系统内置 False用户创建"
    )

    status: bool | None = Field(
        default=None,
        description="状态：True启用 False禁用"
    )


class IngredientDetailResponse(BaseModel):
    """食材详情响应（含分类、营养、保存指南）"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(description="主键ID")

    category_id: int = Field(description="分类ID")

    name: str = Field(description="食材名称")

    alias_name: str | None = Field(description="别名")

    cover_image: str | None = Field(description="封面图URL")

    description: str | None = Field(description="基本介绍")

    edible_value: str | None = Field(description="食用价值")

    suitable_people: str | None = Field(description="适宜人群")

    contraindications: str | None = Field(description="禁忌搭配")

    origin_place: str | None = Field(description="产地")

    season: str | None = Field(description="时令季节")

    is_system: bool = Field(description="是否系统食材")

    created_by: int | None = Field(description="创建人ID")

    status: bool = Field(description="状态")

    created_at: datetime = Field(description="创建时间")

    updated_at: datetime = Field(description="更新时间")

    category: CategoryDetailResponse | None = Field(
        default=None,
        description="所属分类"
    )

    nutrition: NutritionDetailResponse | None = Field(
        default=None,
        description="营养成分"
    )

    storage: StorageDetailResponse | None = Field(
        default=None,
        description="保存指南"
    )

    can_edit: bool = Field(
        default=False,
        description="当前用户是否可编辑"
    )

    can_delete: bool = Field(
        default=False,
        description="当前用户是否可删除"
    )


class IngredientListResponse(BaseModel):
    """食材列表项响应（轻量，用于分页列表）"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(description="主键ID")

    category_id: int = Field(description="分类ID")

    category_name: str | None = Field(
        default=None,
        description="所属分类名称"
    )

    name: str = Field(description="食材名称")

    alias_name: str | None = Field(description="别名")

    cover_image: str | None = Field(description="封面图URL")

    description: str | None = Field(description="基本介绍")

    is_system: bool = Field(description="是否系统食材")

    status: bool = Field(description="状态")

    created_at: datetime = Field(description="创建时间")

    calories: float | None = Field(
        default=None,
        description="热量(kcal/100g)，取自营养成分"
    )

    room_temperature_method: str | None = Field(
        default=None,
        description="常温保存方法"
    )

    refrigerated_method: str | None = Field(
        default=None,
        description="冷藏保存方法"
    )

    frozen_method: str | None = Field(
        default=None,
        description="冷冻保存方法"
    )

    can_edit: bool = Field(
        default=False,
        description="当前用户是否可编辑"
    )

    can_delete: bool = Field(
        default=False,
        description="当前用户是否可删除"
    )


class IngredientPageResponse(PageData[IngredientListResponse]):
    """食材分页响应"""

    pass


class IngredientPageQuery(BaseModel):
    """食材分页查询参数"""

    page: int = Field(
        default=1,
        ge=1,
        description="页码"
    )

    page_size: int = Field(
        default=10,
        ge=1,
        le=100,
        description="每页条数"
    )

    keyword: str | None = Field(
        default=None,
        description="关键字（食材名称/别名模糊搜索）"
    )

    category_id: int | None = Field(
        default=None,
        gt=0,
        description="分类ID筛选"
    )

    status: bool | None = Field(
        default=None,
        description="状态筛选"
    )

    is_system: bool | None = Field(
        default=None,
        description="是否系统食材筛选：True仅系统内置"
    )
