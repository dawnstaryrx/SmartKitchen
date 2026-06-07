from fastapi_mail import (
    FastMail,
    MessageSchema,
    ConnectionConfig
)

from app.core.config import settings


conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,

    MAIL_FROM=settings.MAIL_FROM,

    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_PORT=settings.MAIL_PORT,

    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,

    USE_CREDENTIALS=settings.USE_CREDENTIALS
)

# 发送验证码邮件
async def send_email_code(
        email: str,
        code: str
):
    print("MAIL_SERVER:", settings.MAIL_SERVER)
    print("MAIL_PORT:", settings.MAIL_PORT)
    print("MAIL_USERNAME:", settings.MAIL_USERNAME)
    print("MAIL_PASSWORD:", settings.MAIL_PASSWORD)
    message = MessageSchema(
        subject="SmartKitchen验证码",
        recipients=[email],
        body=f"""
        您的验证码是：

        {code} 

        ，5分钟内有效。
        """,
        subtype="plain"
    )

    fm = FastMail(conf)

    await fm.send_message(message)