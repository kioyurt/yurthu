"""标签相关 Pydantic 模型。"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TagBase(BaseModel):
    """标签基础字段。"""

    name: str = Field(..., max_length=30, description="标签名称")
    slug: str = Field(..., max_length=30, description="URL slug")


class TagCreate(TagBase):
    """创建标签请求。"""

    pass


class TagUpdate(BaseModel):
    """更新标签请求。"""

    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(None, max_length=30, description="标签名称")
    slug: str | None = Field(None, max_length=30, description="URL slug")


class TagOut(BaseModel):
    """标签响应。"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="标签 ID")
    name: str = Field(..., description="标签名称")
    slug: str = Field(..., description="URL slug")
    created_at: datetime = Field(..., description="创建时间")


class TagWithCountOut(TagOut):
    """标签响应（含文章数量）。"""

    post_count: int = Field(0, description="该标签下的文章数")
