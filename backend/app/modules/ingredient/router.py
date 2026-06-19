from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.response import ApiResponse
from app.common.response import success
from app.core.database import get_async_db
from app.core.deps import get_current_user
from app.modules.ingredient.schemas import CategoryCreateRequest
from app.modules.ingredient.schemas import CategoryDetailResponse
from app.modules.ingredient.schemas import CategoryPageQuery
from app.modules.ingredient.schemas import CategoryPageResponse
from app.modules.ingredient.schemas import CategoryUpdateRequest
from app.modules.ingredient.schemas import IngredientCreateRequest
from app.modules.ingredient.schemas import IngredientDetailResponse
from app.modules.ingredient.schemas import IngredientListResponse
from app.modules.ingredient.schemas import IngredientPageQuery
from app.modules.ingredient.schemas import IngredientPageResponse
from app.modules.ingredient.schemas import IngredientUpdateRequest
from app.modules.ingredient.schemas import NutritionCreateRequest
from app.modules.ingredient.schemas import NutritionDetailResponse
from app.modules.ingredient.schemas import NutritionUpdateRequest
from app.modules.ingredient.schemas import StorageCreateRequest
from app.modules.ingredient.schemas import StorageDetailResponse
from app.modules.ingredient.schemas import StorageUpdateRequest
from app.modules.ingredient.models import Ingredient
from app.modules.ingredient.service import CategoryService
from app.modules.ingredient.service import IngredientService
from app.modules.ingredient.service import NutritionService
from app.modules.ingredient.service import StorageService
from app.modules.user.models import User

router = APIRouter(
    prefix="/ingredient",
    tags=["食材管理"]
)


def _can_manage(ingredient: Ingredient, current_user: User) -> bool:
    """判断当前用户是否可编辑/删除该食材：管理员可管理全部，普通用户仅可管理自己创建的"""
    if current_user.is_admin:
        return True

    return ingredient.created_by == current_user.id


# ==================================================
# 食材分类管理
# ==================================================

@router.post(
    "/categories",
    tags=["分类管理"],
    response_model=ApiResponse[CategoryDetailResponse],
    summary="新增分类"
)
async def create_category(
        req: CategoryCreateRequest,
        db: AsyncSession = Depends(get_async_db),
        current_user: User = Depends(get_current_user)
):
    category = await CategoryService.create(db, req)

    return success(
        data=CategoryDetailResponse.model_validate(category),
        message="新增分类成功"
    )


@router.get(
    "/categories",
    tags=["分类管理"],
    response_model=ApiResponse[CategoryPageResponse],
    summary="分页查询分类"
)
async def get_category_page(
        query: CategoryPageQuery = Depends(),
        db: AsyncSession = Depends(get_async_db),
        current_user: User = Depends(get_current_user)
):
    page = await CategoryService.get_page(db, query)

    items = [
        CategoryDetailResponse.model_validate(c)
        for c in page.items
    ]

    data = CategoryPageResponse(
        items=items,
        total=page.total,
        page=page.page,
        page_size=page.page_size,
        total_pages=page.total_pages
    )

    return success(data=data)


@router.get(
    "/categories/{category_id}",
    tags=["分类管理"],
    response_model=ApiResponse[CategoryDetailResponse],
    summary="分类详情"
)
async def get_category_detail(
        category_id: int,
        db: AsyncSession = Depends(get_async_db),
        current_user: User = Depends(get_current_user)
):
    category = await CategoryService.get_by_id(db, category_id)

    if category is None:
        return success(data=None, message="分类不存在")

    return success(
        data=CategoryDetailResponse.model_validate(category)
    )


@router.put(
    "/categories/{category_id}",
    tags=["分类管理"],
    response_model=ApiResponse[CategoryDetailResponse],
    summary="修改分类"
)
async def update_category(
        category_id: int,
        req: CategoryUpdateRequest,
        db: AsyncSession = Depends(get_async_db),
        current_user: User = Depends(get_current_user)
):
    category = await CategoryService.update(db, category_id, req)

    return success(
        data=CategoryDetailResponse.model_validate(category),
        message="修改分类成功"
    )


@router.delete(
    "/categories/{category_id}",
    tags=["分类管理"],
    response_model=ApiResponse[int],
    summary="删除分类"
)
async def delete_category(
        category_id: int,
        db: AsyncSession = Depends(get_async_db),
        current_user: User = Depends(get_current_user)
):
    await CategoryService.delete(db, category_id)

    return success(
        data=category_id,
        message="删除分类成功"
    )


# ==================================================
# 食材管理
# ==================================================

@router.post(
    "",
    response_model=ApiResponse[IngredientDetailResponse],
    summary="新增食材"
)
async def create_ingredient(
        req: IngredientCreateRequest,
        db: AsyncSession = Depends(get_async_db),
        current_user: User = Depends(get_current_user)
):
    ingredient = await IngredientService.create(
        db,
        req,
        created_by=current_user.id
    )

    return success(
        data=IngredientDetailResponse.model_validate(ingredient),
        message="新增食材成功"
    )


@router.get(
    "",
    response_model=ApiResponse[IngredientPageResponse],
    summary="分页查询食材"
)
async def get_ingredient_page(
        query: IngredientPageQuery = Depends(),
        db: AsyncSession = Depends(get_async_db),
        current_user: User = Depends(get_current_user)
):
    page = await IngredientService.get_page(db, query)

    items: list[IngredientListResponse] = []

    for item in page.items:
        resp = IngredientListResponse.model_validate(item)

        resp.category_name = (
            item.category.name if item.category else None
        )

        resp.calories = (
            float(item.nutrition.calories)
            if item.nutrition and item.nutrition.calories is not None
            else None
        )

        resp.room_temperature_method = (
            item.storage.room_temperature_method
            if item.storage else None
        )
        resp.refrigerated_method = (
            item.storage.refrigerated_method
            if item.storage else None
        )
        resp.frozen_method = (
            item.storage.frozen_method
            if item.storage else None
        )

        manageable = _can_manage(item, current_user)
        resp.can_edit = manageable
        resp.can_delete = manageable

        items.append(resp)

    data = IngredientPageResponse(
        items=items,
        total=page.total,
        page=page.page,
        page_size=page.page_size,
        total_pages=page.total_pages
    )

    return success(data=data)


@router.get(
    "/{ingredient_id}",
    response_model=ApiResponse[IngredientDetailResponse],
    summary="食材详情"
)
async def get_ingredient_detail(
        ingredient_id: int,
        db: AsyncSession = Depends(get_async_db),
        current_user: User = Depends(get_current_user)
):
    ingredient = await IngredientService.get_by_id(db, ingredient_id)

    if ingredient is None:
        return success(data=None, message="食材不存在")

    resp = IngredientDetailResponse.model_validate(ingredient)

    manageable = _can_manage(ingredient, current_user)
    resp.can_edit = manageable
    resp.can_delete = manageable

    return success(data=resp)


@router.put(
    "/{ingredient_id}",
    response_model=ApiResponse[IngredientDetailResponse],
    summary="修改食材"
)
async def update_ingredient(
        ingredient_id: int,
        req: IngredientUpdateRequest,
        db: AsyncSession = Depends(get_async_db),
        current_user: User = Depends(get_current_user)
):
    ingredient = await IngredientService.get_by_id(db, ingredient_id)

    if ingredient is None:
        raise HTTPException(
            status_code=404,
            detail="食材不存在"
        )

    if not _can_manage(ingredient, current_user):
        raise HTTPException(
            status_code=403,
            detail="无权修改他人创建的食材"
        )

    updated = await IngredientService.update(
        db,
        ingredient_id,
        req
    )

    resp = IngredientDetailResponse.model_validate(updated)
    resp.can_edit = True
    resp.can_delete = True

    return success(
        data=resp,
        message="修改食材成功"
    )


@router.delete(
    "/{ingredient_id}",
    response_model=ApiResponse[int],
    summary="删除食材"
)
async def delete_ingredient(
        ingredient_id: int,
        db: AsyncSession = Depends(get_async_db),
        current_user: User = Depends(get_current_user)
):
    ingredient = await IngredientService.get_by_id(db, ingredient_id)

    if ingredient is None:
        raise HTTPException(
            status_code=404,
            detail="食材不存在"
        )

    if not _can_manage(ingredient, current_user):
        raise HTTPException(
            status_code=403,
            detail="无权删除他人创建的食材"
        )

    await IngredientService.delete(db, ingredient_id)

    return success(
        data=ingredient_id,
        message="删除食材成功"
    )


# ==================================================
# 营养成分管理
# ==================================================

@router.post(
    "/nutrition",
    tags=["营养成分管理"],
    response_model=ApiResponse[NutritionDetailResponse],
    summary="新增营养成分"
)
async def create_nutrition(
        req: NutritionCreateRequest,
        db: AsyncSession = Depends(get_async_db),
        current_user: User = Depends(get_current_user)
):
    nutrition = await NutritionService.create(db, req)

    return success(
        data=NutritionDetailResponse.model_validate(nutrition),
        message="新增营养成分成功"
    )


@router.put(
    "/nutrition/{nutrition_id}",
    tags=["营养成分管理"],
    response_model=ApiResponse[NutritionDetailResponse],
    summary="修改营养成分"
)
async def update_nutrition(
        nutrition_id: int,
        req: NutritionUpdateRequest,
        db: AsyncSession = Depends(get_async_db),
        current_user: User = Depends(get_current_user)
):
    nutrition = await NutritionService.update(
        db,
        nutrition_id,
        req
    )

    return success(
        data=NutritionDetailResponse.model_validate(nutrition),
        message="修改营养成分成功"
    )


@router.get(
    "/nutrition/{nutrition_id}",
    tags=["营养成分管理"],
    response_model=ApiResponse[NutritionDetailResponse],
    summary="营养成分详情"
)
async def get_nutrition_detail(
        nutrition_id: int,
        db: AsyncSession = Depends(get_async_db),
        current_user: User = Depends(get_current_user)
):
    nutrition = await NutritionService.get_by_id(db, nutrition_id)

    if nutrition is None:
        return success(data=None, message="营养成分不存在")

    return success(
        data=NutritionDetailResponse.model_validate(nutrition)
    )


@router.get(
    "/{ingredient_id}/nutrition",
    tags=["营养成分管理"],
    response_model=ApiResponse[NutritionDetailResponse],
    summary="根据食材ID查询营养成分"
)
async def get_nutrition_by_ingredient(
        ingredient_id: int,
        db: AsyncSession = Depends(get_async_db),
        current_user: User = Depends(get_current_user)
):
    nutrition = await NutritionService.get_by_ingredient_id(
        db,
        ingredient_id
    )

    if nutrition is None:
        return success(data=None, message="该食材暂无营养成分")

    return success(
        data=NutritionDetailResponse.model_validate(nutrition)
    )


# ==================================================
# 保存指南管理
# ==================================================

@router.post(
    "/storage",
    tags=["保存指南管理"],
    response_model=ApiResponse[StorageDetailResponse],
    summary="新增保存指南"
)
async def create_storage(
        req: StorageCreateRequest,
        db: AsyncSession = Depends(get_async_db),
        current_user: User = Depends(get_current_user)
):
    storage = await StorageService.create(db, req)

    return success(
        data=StorageDetailResponse.model_validate(storage),
        message="新增保存指南成功"
    )


@router.put(
    "/storage/{storage_id}",
    tags=["保存指南管理"],
    response_model=ApiResponse[StorageDetailResponse],
    summary="修改保存指南"
)
async def update_storage(
        storage_id: int,
        req: StorageUpdateRequest,
        db: AsyncSession = Depends(get_async_db),
        current_user: User = Depends(get_current_user)
):
    storage = await StorageService.update(db, storage_id, req)

    return success(
        data=StorageDetailResponse.model_validate(storage),
        message="修改保存指南成功"
    )


@router.get(
    "/storage/{storage_id}",
    tags=["保存指南管理"],
    response_model=ApiResponse[StorageDetailResponse],
    summary="保存指南详情"
)
async def get_storage_detail(
        storage_id: int,
        db: AsyncSession = Depends(get_async_db),
        current_user: User = Depends(get_current_user)
):
    storage = await StorageService.get_by_id(db, storage_id)

    if storage is None:
        return success(data=None, message="保存指南不存在")

    return success(
        data=StorageDetailResponse.model_validate(storage)
    )


@router.get(
    "/{ingredient_id}/storage",
    tags=["保存指南管理"],
    response_model=ApiResponse[StorageDetailResponse],
    summary="根据食材ID查询保存指南"
)
async def get_storage_by_ingredient(
        ingredient_id: int,
        db: AsyncSession = Depends(get_async_db),
        current_user: User = Depends(get_current_user)
):
    storage = await StorageService.get_by_ingredient_id(
        db,
        ingredient_id
    )

    if storage is None:
        return success(data=None, message="该食材暂无保存指南")

    return success(
        data=StorageDetailResponse.model_validate(storage)
    )
