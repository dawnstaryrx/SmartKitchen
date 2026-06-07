from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.modules.auth.schemas import (
    SendCodeRequest,
    RegisterRequest
)

from app.modules.auth.service import AuthService

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