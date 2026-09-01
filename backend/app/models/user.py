"""用户模型。

存储 GitHub 身份映射、角色、头像等信息。
"""

from datetime import datetime
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class User(Base):
    """用户表。

    以 GitHub 身份为基础，本地维护角色体系。
    """

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True,)
    github_id: Mapped[int] = mapped_column(
        Integer, unique=True, index=True, nullable=False, comment="GitHub 用户 ID（数值型）"
    )
    username: Mapped[str] = mapped_column(String(100), nullable=False, comment="GitHub login 名")
    display_name: Mapped[Optional[str]] = mapped_column(String(100), default=None, comment="显示昵称")
    email: Mapped[Optional[str]] = mapped_column(String(255), default=None, comment="GitHub 公开邮箱")
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), default=None, comment="GitHub 头像 URL")
    bio: Mapped[Optional[str]] = mapped_column(Text, default=None, comment="个人简介")
    role: Mapped[str] = mapped_column(
        String(20), nullable=False, default="user", index=True, comment="角色：admin / user"
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, comment="是否启用"
    )
    last_login_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), default=None, comment="最后登录时间"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="创建时间",
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
        comment="更新时间",
    )

    # ---- 关系 ----
    posts: Mapped[List["Post"]] = relationship(  # noqa: F821
        "Post",
        back_populates="author",cascade="all, delete-orphan",
    )
    media_uploads: Mapped[List["Media"]] = relationship(  # noqa: F821
        "Media",
        back_populates="uploader",)
    comments: Mapped[List["Comment"]] = relationship(  # noqa: F821
        "Comment",
        back_populates="user",)
