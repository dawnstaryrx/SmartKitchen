from fastapi import FastAPI

from app.core.database import Base
from app.core.database import engine

# 导入模型
from app.modules.user.models import User

# 导入路由
from app.modules.auth.router import router as auth_router

app = FastAPI(
    title="SmartKitchen API",
    version="1.0.0"
)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(
        bind=engine
    )


# 注册认证模块
app.include_router(auth_router)