from pydantic import BaseModel
from pydantic import EmailStr


class SendCodeRequest(BaseModel):
    email: EmailStr

class RegisterRequest(BaseModel):
    email: EmailStr
    code: str
    password: str
    confirm_password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    nickname: str | None = None
    avatar: str | None = None
    is_admin: bool = False
    ai_count: int = 0

    model_config = {
        "from_attributes": True
    }