from fastapi import Depends
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from fastapi.security import HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.redis import redis_client
from app.core.security import decode_access_token
from app.modules.user.models import User

security = HTTPBearer()


def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="无效的Token"
        )

    user_id = payload.get("user_id")

    result = db.execute(
        select(User).where(User.id == user_id)
    )

    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="用户不存在"
        )

    redis_token = redis_client.get(
        f"auth:token:{user.id}"
    )

    if redis_token != token:
        raise HTTPException(
            status_code=401,
            detail="登录已失效"
        )

    return user