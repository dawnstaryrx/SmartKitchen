from functools import lru_cache

from pydantic_settings import BaseSettings
from pydantic_settings import SettingsConfigDict


class Settings(BaseSettings):

    # ========================
    # 项目
    # ========================
    APP_NAME: str = "SmartKitchen"
    APP_ENV: str = "dev"

    # ========================
    # PostgreSQL
    # ========================
    DATABASE_URL: str

    # ========================
    # Redis
    # ========================
    REDIS_HOST: str = "121.43.175.61"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = "Password0k$"

    # ========================
    # SMTP
    # ========================
    MAIL_USERNAME: str = "dawnstar001@126.com"
    MAIL_PASSWORD: str = "TTumgDp2xqC9YvSk"

    MAIL_FROM: str = "dawnstar001@126.com"
    MAIL_SERVER: str = "smtp.126.com"
    MAIL_PORT: int = 25
    MAIL_SSL_TLS: bool = False
    MAIL_STARTTLS: bool = False
    USE_CREDENTIALS: bool = True

    # ========================
    # JWT
    # ========================
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_DAYS: int = 7

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()