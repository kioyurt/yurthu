"""评论模型。

支持嵌套回复（parent_id 自关联）、登录 + 匿名双模式、审核机制。
"""

from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Comment(Base):
    """评论表。"""

    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True,)
    post_id: Mapped[int] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
        comment="所属文章 ID",
    )
    parent_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("comments.id", ondelete="SET NULL"),
        index=True,
        default=None,
        comment="父评论 ID（顶层为 NULL）",
    )
    user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        index=True,
        default=None,
        comment="登录评论者 ID（GitHub 登录用户）",
    )
    guest_name: Mapped[Optional[str]] = mapped_column(
        String(50), default=None, comment="匿名评论者昵称"
    )
    guest_email: Mapped[Optional[str]] = mapped_column(
        String(255), default=None, comment="匿名评论者邮箱"
    )
    guest_website: Mapped[Optional[str]] = mapped_column(
        String(500), default=None, comment="匿名评论者网站"
    )
    content: Mapped[str] = mapped_column(Text, nullable=False, comment="评论内容")
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="pending",
        index=True,
        comment="状态：approved / pending / spam / trashed",
    )
    ip_hash: Mapped[Optional[str]] = mapped_column(
        String(64), default=None, comment="评论者 IP 哈希（用于反垃圾）"
    )
    user_agent: Mapped[Optional[str]] = mapped_column(
        String(500), default=None, comment="浏览器 UA"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
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
    post: Mapped["Post"] = relationship(  # noqa: F821
        "Post", back_populates="comments",)
    user: Mapped[Optional["User"]] = relationship(  # noqa: F821
        "User", back_populates="comments",)
    parent: Mapped[Optional["Comment"]] = relationship(
        "Comment",
        remote_side=[id],
        back_populates="replies",
    )
    replies: Mapped[List["Comment"]] = relationship(
        "Comment",
        back_populates="parent",cascade="all, delete-orphan",
    )

    __table_args__ = (
        Index("idx_comments_post_status_created", "post_id", "status", "created_at"),
    )
