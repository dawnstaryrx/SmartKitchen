from dataclasses import dataclass
from typing import Any
from typing import Generic
from typing import List
from typing import TypeVar

from pydantic import BaseModel
from pydantic import Field

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """统一返回结构"""

    code: int = Field(
        default=200,
        description="业务状态码"
    )

    message: str = Field(
        default="success",
        description="提示信息"
    )

    data: T | None = Field(
        default=None,
        description="业务数据"
    )


class PageData(BaseModel, Generic[T]):
    """分页数据结构（用于响应模型）"""

    items: List[T] = Field(
        description="当前页数据列表"
    )

    total: int = Field(
        description="总记录数"
    )

    page: int = Field(
        description="当前页码"
    )

    page_size: int = Field(
        description="每页条数"
    )

    total_pages: int = Field(
        description="总页数"
    )


@dataclass
class PageResult(Generic[T]):
    """分页查询结果（Service 层返回，承载 ORM 对象）"""

    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int


def success(
        data: Any = None,
        message: str = "success"
) -> dict:
    """构建统一成功返回字典"""

    return {
        "code": 200,
        "message": message,
        "data": data
    }


def fail(
        code: int,
        message: str,
        data: Any = None
) -> dict:
    """构建统一失败返回字典"""

    return {
        "code": code,
        "message": message,
        "data": data
    }
