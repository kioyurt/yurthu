"""留言板相关 Pydantic 模型。"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class GuestbookBase(BaseModel):
    """留言板基础字段。"""

    content: str = Field(..., min_length=1, max_length=1000, description="留言内容")


class GuestbookEntryCreate(GuestbookBase):
    """匿名留言创建请求。"""

    guest_name: str = Field(..., max_length=50, description="昵称")
    guest_email: Optional[EmailStr] = Field(None, description="邮箱")


class GuestbookCreate(GuestbookBase):
    """登录用户留言创建请求（同基础）。"""

    pass


class GuestbookAuthorOut(BaseModel):
    """留言作者简要信息（登录用户）。"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="用户 ID")
    username: str = Field(..., description="用户名")
    display_name: Optional[str] = Field(None, description="显示昵称")
    avatar_url: Optional[str] = Field(None, description="头像 URL")


class GuestbookOut(BaseModel):
    """留言板响应。"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="留言 ID")
    content: str = Field(..., description="留言内容")
    status: str = Field(..., description="状态")
    created_at: datetime = Field(..., description="创建时间")

    # 作者信息（二选一）
    user: Optional[GuestbookAuthorOut] = Field(None, description="登录用户")
    guest_name: Optional[str] = Field(None, description="匿名昵称")
