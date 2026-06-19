from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.common.response import PageResult
from app.modules.ingredient.models import Ingredient
from app.modules.ingredient.models import IngredientCategory
from app.modules.ingredient.models import IngredientNutrition
from app.modules.ingredient.models import IngredientStorage
from app.modules.ingredient.schemas import CategoryCreateRequest
from app.modules.ingredient.schemas import CategoryPageQuery
from app.modules.ingredient.schemas import CategoryUpdateRequest
from app.modules.ingredient.schemas import IngredientCreateRequest
from app.modules.ingredient.schemas import IngredientPageQuery
from app.modules.ingredient.schemas import IngredientUpdateRequest
from app.modules.ingredient.schemas import NutritionCreateRequest
from app.modules.ingredient.schemas import NutritionUpdateRequest
from app.modules.ingredient.schemas import StorageCreateRequest
from app.modules.ingredient.schemas import StorageUpdateRequest


# ==================================================
# 食材分类 Service
# ==================================================

class CategoryService:
    """食材分类业务逻辑"""

    @staticmethod
    async def create(
            db: AsyncSession,
            data: CategoryCreateRequest
    ) -> IngredientCategory:
        # 校验编码唯一
        existing = await db.execute(
            select(IngredientCategory).where(
                IngredientCategory.code == data.code,
                IngredientCategory.is_deleted == False  # noqa: E712
            )
        )

        if existing.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=400,
                detail="分类编码已存在"
            )

        category = IngredientCategory(
            name=data.name,
            code=data.code,
            sort=data.sort,
            status=data.status,
            remark=data.remark
        )

        db.add(category)
        await db.commit()
        await db.refresh(category)

        return category

    @staticmethod
    async def update(
            db: AsyncSession,
            category_id: int,
            data: CategoryUpdateRequest
    ) -> IngredientCategory:
        category = await CategoryService.get_by_id(db, category_id)

        if category is None:
            raise HTTPException(
                status_code=404,
                detail="分类不存在"
            )

        payload = data.model_dump(exclude_unset=True)

        # 若修改编码，校验唯一
        if payload.get("code") is not None and payload["code"] != category.code:
            dup = await db.execute(
                select(IngredientCategory).where(
                    IngredientCategory.code == payload["code"],
                    IngredientCategory.id != category_id,
                    IngredientCategory.is_deleted == False  # noqa: E712
                )
            )

            if dup.scalar_one_or_none() is not None:
                raise HTTPException(
                    status_code=400,
                    detail="分类编码已存在"
                )

        for key, value in payload.items():
            setattr(category, key, value)

        await db.commit()
        await db.refresh(category)

        return category

    @staticmethod
    async def delete(
            db: AsyncSession,
            category_id: int
    ) -> IngredientCategory:
        category = await CategoryService.get_by_id(db, category_id)

        if category is None:
            raise HTTPException(
                status_code=404,
                detail="分类不存在"
            )

        # 软删除
        category.is_deleted = True
        await db.commit()

        return category

    @staticmethod
    async def get_by_id(
            db: AsyncSession,
            category_id: int
    ) -> IngredientCategory | None:
        result = await db.execute(
            select(IngredientCategory).where(
                IngredientCategory.id == category_id,
                IngredientCategory.is_deleted == False  # noqa: E712
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def get_page(
            db: AsyncSession,
            query: CategoryPageQuery
    ) -> PageResult[IngredientCategory]:
        conditions = [
            IngredientCategory.is_deleted == False  # noqa: E712
        ]

        if query.keyword:
            conditions.append(
                IngredientCategory.name.ilike(f"%{query.keyword}%")
            )

        # 总数
        count_stmt = (
            select(func.count())
            .select_from(IngredientCategory)
            .where(*conditions)
        )

        total = (await db.execute(count_stmt)).scalar_one()

        # 分页列表
        stmt = (
            select(IngredientCategory)
            .where(*conditions)
            .order_by(
                IngredientCategory.sort.asc(),
                IngredientCategory.id.desc()
            )
            .offset((query.page - 1) * query.page_size)
            .limit(query.page_size)
        )

        result = await db.execute(stmt)
        items = list(result.scalars().unique().all())

        total_pages = (total + query.page_size - 1) // query.page_size

        return PageResult(
            items=items,
            total=total,
            page=query.page,
            page_size=query.page_size,
            total_pages=total_pages
        )


# ==================================================
# 食材 Service
# ==================================================

class IngredientService:
    """食材业务逻辑"""

    @staticmethod
    async def create(
            db: AsyncSession,
            data: IngredientCreateRequest,
            created_by: int
    ) -> Ingredient:
        # 校验分类存在
        category = await CategoryService.get_by_id(db, data.category_id)

        if category is None:
            raise HTTPException(
                status_code=400,
                detail="所选分类不存在"
            )

        ingredient = Ingredient(
            category_id=data.category_id,
            name=data.name,
            alias_name=data.alias_name,
            cover_image=data.cover_image,
            description=data.description,
            edible_value=data.edible_value,
            suitable_people=data.suitable_people,
            contraindications=data.contraindications,
            origin_place=data.origin_place,
            season=data.season,
            is_system=data.is_system,
            created_by=created_by,
            status=data.status
        )

        db.add(ingredient)
        await db.commit()

        # 重新查询以加载关联数据（分类/营养/保存），供详情响应使用
        return await IngredientService.get_by_id(db, ingredient.id)

    @staticmethod
    async def update(
            db: AsyncSession,
            ingredient_id: int,
            data: IngredientUpdateRequest
    ) -> Ingredient:
        ingredient = await IngredientService.get_by_id(db, ingredient_id)

        if ingredient is None:
            raise HTTPException(
                status_code=404,
                detail="食材不存在"
            )

        payload = data.model_dump(exclude_unset=True)

        # 若修改分类，校验分类存在
        if payload.get("category_id") is not None:
            category = await CategoryService.get_by_id(
                db,
                payload["category_id"]
            )

            if category is None:
                raise HTTPException(
                    status_code=400,
                    detail="所选分类不存在"
                )

        for key, value in payload.items():
            setattr(ingredient, key, value)

        await db.commit()

        # 重新查询以加载最新关联数据，供详情响应使用
        return await IngredientService.get_by_id(db, ingredient_id)

    @staticmethod
    async def delete(
            db: AsyncSession,
            ingredient_id: int
    ) -> Ingredient:
        ingredient = await IngredientService.get_by_id(db, ingredient_id)

        if ingredient is None:
            raise HTTPException(
                status_code=404,
                detail="食材不存在"
            )

        # 软删除食材
        ingredient.is_deleted = True

        # 同步软删除营养与保存指南
        if ingredient.nutrition is not None:
            ingredient.nutrition.is_deleted = True

        if ingredient.storage is not None:
            ingredient.storage.is_deleted = True

        await db.commit()

        return ingredient

    @staticmethod
    async def get_by_id(
            db: AsyncSession,
            ingredient_id: int
    ) -> Ingredient | None:
        result = await db.execute(
            select(Ingredient)
            .options(
                selectinload(Ingredient.category),
                selectinload(Ingredient.nutrition),
                selectinload(Ingredient.storage)
            )
            .where(
                Ingredient.id == ingredient_id,
                Ingredient.is_deleted == False  # noqa: E712
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def get_page(
            db: AsyncSession,
            query: IngredientPageQuery
    ) -> PageResult[Ingredient]:
        conditions = [
            Ingredient.is_deleted == False  # noqa: E712
        ]

        if query.keyword:
            keyword = f"%{query.keyword}%"
            conditions.append(
                (Ingredient.name.ilike(keyword)) |
                (Ingredient.alias_name.ilike(keyword))
            )

        if query.category_id is not None:
            conditions.append(Ingredient.category_id == query.category_id)

        if query.status is not None:
            conditions.append(Ingredient.status == query.status)

        if query.is_system is not None:
            conditions.append(Ingredient.is_system == query.is_system)

        # 总数
        count_stmt = (
            select(func.count())
            .select_from(Ingredient)
            .where(*conditions)
        )

        total = (await db.execute(count_stmt)).scalar_one()

        # 分页列表（含分类/营养/保存指南，用于列表卡片展示）
        stmt = (
            select(Ingredient)
            .options(
                selectinload(Ingredient.category),
                selectinload(Ingredient.nutrition),
                selectinload(Ingredient.storage)
            )
            .where(*conditions)
            .order_by(Ingredient.id.desc())
            .offset((query.page - 1) * query.page_size)
            .limit(query.page_size)
        )

        result = await db.execute(stmt)
        items = list(result.scalars().unique().all())

        total_pages = (total + query.page_size - 1) // query.page_size

        return PageResult(
            items=items,
            total=total,
            page=query.page,
            page_size=query.page_size,
            total_pages=total_pages
        )


# ==================================================
# 营养成分 Service
# ==================================================

class NutritionService:
    """营养成分业务逻辑"""

    @staticmethod
    async def create(
            db: AsyncSession,
            data: NutritionCreateRequest
    ) -> IngredientNutrition:
        # 校验食材存在
        ingredient = await IngredientService.get_by_id(
            db,
            data.ingredient_id
        )

        if ingredient is None:
            raise HTTPException(
                status_code=400,
                detail="食材不存在"
            )

        # 校验该食材尚未有营养记录
        existing = await db.execute(
            select(IngredientNutrition).where(
                IngredientNutrition.ingredient_id == data.ingredient_id,
                IngredientNutrition.is_deleted == False  # noqa: E712
            )
        )

        if existing.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=400,
                detail="该食材的营养成分已存在"
            )

        nutrition = IngredientNutrition(
            ingredient_id=data.ingredient_id,
            calories=data.calories,
            protein=data.protein,
            fat=data.fat,
            carbohydrate=data.carbohydrate,
            fiber=data.fiber,
            vitamins=data.vitamins,
            minerals=data.minerals,
            remark=data.remark
        )

        db.add(nutrition)
        await db.commit()
        await db.refresh(nutrition)

        return nutrition

    @staticmethod
    async def update(
            db: AsyncSession,
            nutrition_id: int,
            data: NutritionUpdateRequest
    ) -> IngredientNutrition:
        nutrition = await NutritionService.get_by_id(db, nutrition_id)

        if nutrition is None:
            raise HTTPException(
                status_code=404,
                detail="营养成分不存在"
            )

        payload = data.model_dump(exclude_unset=True)

        for key, value in payload.items():
            setattr(nutrition, key, value)

        await db.commit()
        await db.refresh(nutrition)

        return nutrition

    @staticmethod
    async def get_by_id(
            db: AsyncSession,
            nutrition_id: int
    ) -> IngredientNutrition | None:
        result = await db.execute(
            select(IngredientNutrition).where(
                IngredientNutrition.id == nutrition_id,
                IngredientNutrition.is_deleted == False  # noqa: E712
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_ingredient_id(
            db: AsyncSession,
            ingredient_id: int
    ) -> IngredientNutrition | None:
        result = await db.execute(
            select(IngredientNutrition).where(
                IngredientNutrition.ingredient_id == ingredient_id,
                IngredientNutrition.is_deleted == False  # noqa: E712
            )
        )

        return result.scalar_one_or_none()


# ==================================================
# 保存指南 Service
# ==================================================

class StorageService:
    """保存指南业务逻辑"""

    @staticmethod
    async def create(
            db: AsyncSession,
            data: StorageCreateRequest
    ) -> IngredientStorage:
        # 校验食材存在
        ingredient = await IngredientService.get_by_id(
            db,
            data.ingredient_id
        )

        if ingredient is None:
            raise HTTPException(
                status_code=400,
                detail="食材不存在"
            )

        # 校验该食材尚未有保存指南
        existing = await db.execute(
            select(IngredientStorage).where(
                IngredientStorage.ingredient_id == data.ingredient_id,
                IngredientStorage.is_deleted == False  # noqa: E712
            )
        )

        if existing.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=400,
                detail="该食材的保存指南已存在"
            )

        storage = IngredientStorage(
            ingredient_id=data.ingredient_id,
            room_temperature_days=data.room_temperature_days,
            refrigerated_days=data.refrigerated_days,
            frozen_days=data.frozen_days,
            room_temperature_method=data.room_temperature_method,
            refrigerated_method=data.refrigerated_method,
            frozen_method=data.frozen_method,
            spoilage_signs=data.spoilage_signs,
            remark=data.remark
        )

        db.add(storage)
        await db.commit()
        await db.refresh(storage)

        return storage

    @staticmethod
    async def update(
            db: AsyncSession,
            storage_id: int,
            data: StorageUpdateRequest
    ) -> IngredientStorage:
        storage = await StorageService.get_by_id(db, storage_id)

        if storage is None:
            raise HTTPException(
                status_code=404,
                detail="保存指南不存在"
            )

        payload = data.model_dump(exclude_unset=True)

        for key, value in payload.items():
            setattr(storage, key, value)

        await db.commit()
        await db.refresh(storage)

        return storage

    @staticmethod
    async def get_by_id(
            db: AsyncSession,
            storage_id: int
    ) -> IngredientStorage | None:
        result = await db.execute(
            select(IngredientStorage).where(
                IngredientStorage.id == storage_id,
                IngredientStorage.is_deleted == False  # noqa: E712
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_ingredient_id(
            db: AsyncSession,
            ingredient_id: int
    ) -> IngredientStorage | None:
        result = await db.execute(
            select(IngredientStorage).where(
                IngredientStorage.ingredient_id == ingredient_id,
                IngredientStorage.is_deleted == False  # noqa: E712
            )
        )

        return result.scalar_one_or_none()
