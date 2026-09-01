"""文章相关 Pydantic 模型。"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class PostBase(BaseModel):
    """文章基础字段。"""

    title: str = Field(..., max_length=200, description="文章标题")
    slug: str = Field(..., max_length=200, description="URL slug")
    content: str = Field(..., description="文章正文（Markdown）")
    excerpt: Optional[str] = Field(None, max_length=500, description="摘要")
    cover_image: Optional[str] = Field(None, max_length=500, description="封面图 URL")
    status: str = Field("draft", max_length=20, description="状态：draft / published / archived")
    category_id: Optional[int] = Field(None, description="分类 ID")
    is_pinned: bool = Field(False, description="是否置顶")
    allow_comments: bool = Field(True, description="是否允许评论")


class PostCreate(PostBase):
    """创建文章请求。"""

    tag_ids: List[int] = Field(default_factory=list, description="关联的标签 ID 列表")


class PostUpdate(BaseModel):
    """更新文章请求。"""

    model_config = ConfigDict(extra="forbid")

    title: Optional[str] = Field(None, max_length=200, description="文章标题")
    slug: Optional[str] = Field(None, max_length=200, description="URL slug")
    content: Optional[str] = Field(None, description="文章正文（Markdown）")
    excerpt: Optional[str] = Field(None, max_length=500, description="摘要")
    cover_image: Optional[str] = Field(None, max_length=500, description="封面图 URL")
    status: Optional[str] = Field(None, max_length=20, description="状态")
    category_id: Optional[int] = Field(None, description="分类 ID")
    is_pinned: Optional[bool] = Field(None, description="是否置顶")
    allow_comments: Optional[bool] = Field(None, description="是否允许评论")
    tag_ids: Optional[List[int]] = Field(None, description="关联的标签 ID 列表")


class PostAuthorOut(BaseModel):
    """文章作者简要信息。"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="用户 ID")
    username: str = Field(..., description="用户名")
    display_name: Optional[str] = Field(None, description="显示昵称")
    avatar_url: Optional[str] = Field(None, description="头像 URL")


class PostCategoryOut(BaseModel):
    """文章分类简要信息。"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="分类 ID")
    name: str = Field(..., description="分类名称")
    slug: str = Field(..., description="分类 slug")


class PostTagOut(BaseModel):
    """文章标签简要信息。"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="标签 ID")
    name: str = Field(..., description="标签名称")
    slug: str = Field(..., description="标签 slug")


class PostListOut(BaseModel):
    """文章列表项（摘要信息）。"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="文章 ID")
    title: str = Field(..., description="标题")
    slug: str = Field(..., description="slug")
    excerpt: Optional[str] = Field(None, description="摘要")
    cover_image: Optional[str] = Field(None, description="封面图")
    status: str = Field(..., description="状态")
    view_count: int = Field(..., description="阅读数")
    comment_count: int = Field(..., description="评论数")
    published_at: Optional[datetime] = Field(None, description="发布时间")
    is_pinned: bool = Field(..., description="是否置顶")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")

    # 关联数据
    author: Optional[PostAuthorOut] = Field(None, description="作者")
    category: Optional[PostCategoryOut] = Field(None, description="分类")
    tags: List[PostTagOut] = Field(default_factory=list, description="标签列表")


class PostDetailOut(PostListOut):
    """文章详情（含完整内容）。"""

    content: str = Field(..., description="文章正文")
    allow_comments: bool = Field(..., description="是否允许评论")


# 兼容别名
PostOut = PostDetailOut
