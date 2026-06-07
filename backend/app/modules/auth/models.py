# pydantic用于接口数据校验
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):

    email: EmailStr

    code: str = Field(
        min_length=6,
        max_length=6
    )

    password: str = Field(
        min_length=6,
        max_length=32
    )

    confirm_password: str = Field(
        min_length=6,
        max_length=32
    )