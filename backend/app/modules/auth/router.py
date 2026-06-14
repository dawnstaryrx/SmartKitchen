from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user

from app.modules.auth.schemas import (
    SendCodeRequest,
    RegisterRequest,
    LoginRequest,
    UserResponse
)

from app.modules.auth.service import AuthService
from app.modules.user.models import User

router = APIRouter(
    prefix="/auth",
    tags=["认证"]
)


@router.post("/send-code")
async def send_code(
        req: SendCodeRequest
):

    await AuthService.send_register_code(
        req.email
    )

    return {
        "message": "验证码已发送"
    }

@router.post("/register")
async def register(
        req: RegisterRequest,
        db: Session = Depends(get_db)
):

    user = await AuthService.register(
        db=db,
        email=req.email,
        code=req.code,
        password=req.password,
        confirm_password=req.confirm_password
    )

    return {
        "message": "注册成功",
        "user_id": user.id,
        "email": user.email
    }


@router.post("/login")
async def login(
        req: LoginRequest,
        db: Session = Depends(get_db)
):

    result = await AuthService.login(
        db=db,
        email=req.email,
        password=req.password
    )

    return {
        "message": "登录成功",
        "token": result["token"],
        "user_id": result["user_id"]
    }


@router.get("/me", response_model=UserResponse)
async def me(
        current_user: User = Depends(get_current_user)
):

    return current_user


@router.post("/logout")
async def logout(
        current_user: User = Depends(get_current_user)
):

    await AuthService.logout(
        user_id=current_user.id
    )

    return {
        "message": "退出成功"
    }