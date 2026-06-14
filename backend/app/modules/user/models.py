from datetime import datetime
# SQLAlchemy 用于数据库映射
from sqlalchemy import (
    String,
    Boolean,
    Integer,
    DateTime
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column
)

from app.core.database import Base


class User(Base):

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    # 邮箱
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True
    )

    # 昵称
    nickname: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    # 密码哈希
    password_hash: Mapped[str] = mapped_column(
        String(255)
    )

    # 是否启用
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )

    # 是否管理员
    is_admin: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )

    # 头像
    avatar: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    # AI调用次数
    ai_count: Mapped[int] = mapped_column(
        Integer,
        default=0
    )

    # 创建时间
    created_time: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    # 更新时间
    updated_time: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    last_login_time: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    last_login_ip: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )