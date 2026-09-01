"""评论相关 Pydantic 模型。"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CommentAuthorOut(BaseModel):
    """评论作者简要信息（登录用户）。"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="用户 ID")
    username: str = Field(..., description="用户名")
    display_name: Optional[str] = Field(None, description="显示昵称")
    avatar_url: Optional[str] = Field(None, description="头像 URL")


class CommentBase(BaseModel):
    """评论基础字段。"""

    content: str = Field(..., min_length=1, max_length=2000, description="评论内容")
    parent_id: Optional[int] = Field(None, description="父评论 ID（回复时传）")


class GuestCommentCreate(CommentBase):
    """匿名评论创建请求。"""

    guest_name: str = Field(..., max_length=50, description="昵称")
    guest_email: Optional[EmailStr] = Field(None, description="邮箱")
    guest_website: Optional[str] = Field(None, max_length=500, description="个人网站")


class CommentCreate(CommentBase):
    """登录用户评论创建请求。"""

    pass


class CommentStatusUpdate(BaseModel):
    """评论状态更新请求。"""

    status: str = Field(..., max_length=20, description="状态：approved / pending / spam / trashed")


class CommentOut(BaseModel):
    """评论响应。"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="评论 ID")
    post_id: int = Field(..., description="文章 ID")
    parent_id: Optional[int] = Field(None, description="父评论 ID")
    content: str = Field(..., description="评论内容")
    status: str = Field(..., description="状态")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")

    # 作者信息（二选一）
    user: Optional[CommentAuthorOut] = Field(None, description="登录评论者")
    guest_name: Optional[str] = Field(None, description="匿名评论者昵称")
    guest_website: Optional[str] = Field(None, description="匿名评论者网站")


class CommentTreeOut(CommentOut):
    """树形结构评论响应（含回复列表）。"""

    replies: List["CommentTreeOut"] = Field(default_factory=list, description="回复列表")


# 解决前向引用
CommentTreeOut.model_rebuild()
