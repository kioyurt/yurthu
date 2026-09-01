"""分类相关 Pydantic 模型。"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CategoryBase(BaseModel):
    """分类基础字段。"""

    name: str = Field(..., max_length=50, description="分类名称")
    slug: str = Field(..., max_length=50, description="URL slug")
    description: Optional[str] = Field(None, max_length=200, description="分类描述")
    sort_order: int = Field(0, description="排序权重（越小越靠前）")


class CategoryCreate(CategoryBase):
    """创建分类请求。"""

    pass


class CategoryUpdate(BaseModel):
    """更新分类请求。"""

    model_config = ConfigDict(extra="forbid")

    name: Optional[str] = Field(None, max_length=50, description="分类名称")
    slug: Optional[str] = Field(None, max_length=50, description="URL slug")
    description: Optional[str] = Field(None, max_length=200, description="分类描述")
    sort_order: Optional[int] = Field(None, description="排序权重")


class CategoryOut(BaseModel):
    """分类响应。"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="分类 ID")
    name: str = Field(..., description="分类名称")
    slug: str = Field(..., description="URL slug")
    description: Optional[str] = Field(None, description="分类描述")
    sort_order: int = Field(..., description="排序权重")
    created_at: datetime = Field(..., description="创建时间")


class CategoryWithCountOut(CategoryOut):
    """分类响应（含文章数量）。"""

    post_count: int = Field(0, description="该分类下的文章数")
