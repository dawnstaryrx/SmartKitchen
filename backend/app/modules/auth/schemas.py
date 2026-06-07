from pydantic import BaseModel
from pydantic import EmailStr


class SendCodeRequest(BaseModel):
    email: EmailStr

class RegisterRequest(BaseModel):
    email: EmailStr
    code: str
    password: str
    confirm_password: str