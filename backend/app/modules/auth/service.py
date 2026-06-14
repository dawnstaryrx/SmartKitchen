import random

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.common.email import send_email_code
from app.core.config import settings
from app.core.redis import redis_client
from app.core.security import hash_password
from app.core.security import verify_password
from app.core.security import create_access_token

from app.modules.user.models import User


class AuthService:

    @staticmethod
    async def send_register_code(
            email: str
    ):

        code = f"{random.randint(0, 999999):06d}"

        key = f"register:{email}"

        redis_client.set(
            key,
            code,
            ex=300
        )

        await send_email_code(
            email,
            code
        )

    @staticmethod
    async def register(
            db: Session,
            email: str,
            code: str,
            password: str,
            confirm_password: str
    ):

        # 校验密码
        if password != confirm_password:
            raise HTTPException(
                status_code=400,
                detail="两次密码不一致"
            )

        # 检查邮箱是否已注册
        result = db.execute(
            select(User).where(
                User.email == email
            )
        )

        user = result.scalar_one_or_none()

        if user:
            raise HTTPException(
                status_code=400,
                detail="邮箱已注册"
            )

        # 校验验证码
        redis_code = redis_client.get(
            f"register:{email}"
        )

        if not redis_code:
            raise HTTPException(
                status_code=400,
                detail="验证码已过期"
            )

        if redis_code != code:
            raise HTTPException(
                status_code=400,
                detail="验证码错误"
            )
        print("password:", repr(password))
        print("password length:", len(password))
        # 创建用户
        new_user = User(
            email=email,
            nickname=email.split("@")[0],
            password_hash=hash_password(password),
        )

        db.add(new_user)

        db.commit()

        db.refresh(new_user)

        # 删除验证码
        redis_client.delete(
            f"register:{email}"
        )

        return new_user

    @staticmethod
    async def login(
            db: Session,
            email: str,
            password: str
    ):
        result = db.execute(
            select(User).where(
                User.email == email
            )
        )

        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=400,
                detail="用户不存在"
            )

        if not user.is_active:
            raise HTTPException(
                status_code=400,
                detail="账号已被禁用"
            )

        if not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=400,
                detail="密码错误"
            )

        token = create_access_token(
            data={
                "user_id": user.id,
                "email": user.email
            }
        )

        redis_client.set(
            f"auth:token:{user.id}",
            token,
            ex=86400
        )

        return {
            "token": token,
            "user_id": user.id
        }

    @staticmethod
    async def logout(
            user_id: int
    ):
        redis_client.delete(
            f"auth:token:{user_id}"
        )

        return {"message": "退出成功"}