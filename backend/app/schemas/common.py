"""通用 Pydantic 模型：分页、成功响应等。"""

from typing import Any, Dict, Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class SuccessResponse(BaseModel):
    """通用成功响应。"""

    success: bool = Field(default=True, description="是否成功")
    message: str = Field(default="操作成功", description="提示信息")
    data: Optional[Dict[str, Any]] = Field(default=None, description="附加数据")


class PaginatedParams(BaseModel):
    """分页查询参数。"""

    page: int = Field(default=1, ge=1, description="页码，从 1 开始")
    page_size: int = Field(default=10, ge=1, le=100, description="每页数量，最大 100")


class PaginatedResponse(BaseModel, Generic[T]):
    """统一分页响应结构。"""

    items: List[T] = Field(description="当前页数据列表")
    total: int = Field(description="总记录数")
    page: int = Field(description="当前页码")
    page_size: int = Field(description="每页数量")
    total_pages: int = Field(description="总页数")

    @classmethod
    def create(
        cls,
        items: List[Any],
        total: int,
        page: int,
        page_size: int,
    ) -> "PaginatedResponse[Any]":
        """创建分页响应实例。

        Args:
            items: 当前页数据。
            total: 总记录数。
            page: 当前页码。
            page_size: 每页数量。

        Returns:
            PaginatedResponse 实例。
        """
        total_pages = (total + page_size - 1) // page_size if page_size > 0 else 0
        return cls(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )
