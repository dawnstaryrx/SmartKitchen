from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 导入模型（确保 ORM 映射在应用启动前注册；建表统一由 Alembic 管理）
from app.modules.user.models import User  # noqa: F401
from app.modules.ingredient import models as ingredient_models  # noqa: F401

# 导入路由
from app.modules.auth.router import router as auth_router
from app.modules.ingredient.router import router as ingredient_router

app = FastAPI(
    title="SmartKitchen API",
    version="1.0.0"
)

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 注册认证模块
app.include_router(auth_router)

# 注册食材管理模块
app.include_router(ingredient_router)