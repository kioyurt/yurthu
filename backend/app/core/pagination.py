"""分页统一封装。

所有列表接口统一返回格式：
{
    "items": [...],
    "total": 100,
    "page": 1,
    "page_size": 10,
    "total_pages": 10
}
"""

from typing import Any, Dict, Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginatedParams(BaseModel):
    """分页查询参数。"""

    page: int = Field(default=1, ge=1, description="页码，从 1 开始")
    page_size: int = Field(default=10, ge=1, le=100, description="每页数量，最大 100")

    @property
    def offset(self) -> int:
        """SQL OFFSET 值。"""
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        """SQL LIMIT 值。"""
        return self.page_size


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
        """创建分页响应。

        Args:
            items: 当前页数据列表。
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


def build_pagination(page: int = 1, page_size: int = 10) -> Dict[str, int]:
    """构建分页参数字典（用于路由层快速获取）。

    Args:
        page: 页码。
        page_size: 每页数量。

    Returns:
        包含 page、page_size、offset、limit 的字典。
    """
    page = max(1, page)
    page_size = min(100, max(1, page_size))
    return {
        "page": page,
        "page_size": page_size,
        "offset": (page - 1) * page_size,
        "limit": page_size,
    }
