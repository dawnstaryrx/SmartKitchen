from functools import lru_cache

from pydantic_settings import BaseSettings
from pydantic_settings import SettingsConfigDict


class Settings(BaseSettings):

    # ========================
    # 项目
    # ========================
    APP_NAME: str
    APP_ENV: str

    # ========================
    # PostgreSQL
    # ========================
    DATABASE_URL: str

    # ========================
    # Redis
    # ========================
    REDIS_HOST: str
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str

    # ========================
    # SMTP
    # ========================
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_SERVER: str
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
    JWT_EXPIRE_HOURS: int = 24

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()