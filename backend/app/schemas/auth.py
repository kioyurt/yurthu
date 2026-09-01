"""认证相关 Pydantic 模型。"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, EmailStr


class UserBase(BaseModel):
    """用户基础字段。"""

    username: str = Field(..., max_length=100, description="GitHub 用户名")
    display_name: Optional[str] = Field(None, max_length=100, description="显示昵称")
    avatar_url: Optional[str] = Field(None, max_length=500, description="头像 URL")
    bio: Optional[str] = Field(None, description="个人简介")


class UserCreate(UserBase):
    """创建用户请求。"""

    github_id: int = Field(..., description="GitHub 用户 ID")
    email: Optional[EmailStr] = Field(None, description="邮箱")
    role: str = Field("user", max_length=20, description="角色")


class UserUpdate(BaseModel):
    """更新用户请求。"""

    model_config = ConfigDict(extra="forbid")

    display_name: Optional[str] = Field(None, max_length=100, description="显示昵称")
    bio: Optional[str] = Field(None, description="个人简介")


class UserOut(BaseModel):
    """用户信息响应。"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="用户 ID")
    username: str = Field(..., description="GitHub 用户名")
    display_name: Optional[str] = Field(None, description="显示昵称")
    email: Optional[str] = Field(None, description="邮箱")
    avatar_url: Optional[str] = Field(None, description="头像 URL")
    bio: Optional[str] = Field(None, description="个人简介")
    role: str = Field(..., description="角色")
    is_active: bool = Field(..., description="是否启用")
    last_login_at: Optional[datetime] = Field(None, description="最后登录时间")
    created_at: datetime = Field(..., description="创建时间")


class LoginResponse(BaseModel):
    """登录成功响应。"""

    access_token: str = Field(..., description="访问令牌")
    token_type: str = Field("bearer", description="令牌类型")
    user: UserOut = Field(..., description="用户信息")
