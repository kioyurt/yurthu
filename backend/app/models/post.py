"""文章模型。

核心内容载体，覆盖从草稿到发布的全生命周期。
"""

from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    Boolean,
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


class Post(Base):
    """文章表。"""

    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True,)
    title: Mapped[str] = mapped_column(String(200), nullable=False, comment="文章标题")
    slug: Mapped[str] = mapped_column(
        String(200), unique=True, index=True, nullable=False, comment="URL slug"
    )
    content: Mapped[str] = mapped_column(Text, nullable=False, comment="文章正文（Markdown）")
    excerpt: Mapped[Optional[str]] = mapped_column(
        String(500), default=None, comment="摘要"
    )
    cover_image: Mapped[Optional[str]] = mapped_column(
        String(500), default=None, comment="封面图 URL"
    )
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="draft",
        index=True,
        comment="状态：draft / published / archived",
    )
    category_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("categories.id", ondelete="SET NULL"),
        index=True,
        default=None,
        comment="所属分类 ID",
    )
    author_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        comment="作者 ID",
    )
    view_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, comment="阅读数（缓存计数器）"
    )
    comment_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, comment="评论数（缓存计数器）"
    )
    published_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        index=True,
        default=None,
        comment="发布时间（草稿→发布时写入）",
    )
    is_pinned: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, comment="是否置顶"
    )
    allow_comments: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, comment="是否允许评论"
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
    author: Mapped["User"] = relationship(  # noqa: F821
        "User", back_populates="posts",)
    category: Mapped[Optional["Category"]] = relationship(  # noqa: F821
        "Category", back_populates="posts",)
    tags: Mapped[List["Tag"]] = relationship(  # noqa: F821
        "Tag",
        secondary="post_tags",
        back_populates="posts",)
    comments: Mapped[List["Comment"]] = relationship(  # noqa: F821
        "Comment",
        back_populates="post",cascade="all, delete-orphan",
    )
    views: Mapped[List["PostView"]] = relationship(  # noqa: F821
        "PostView",
        back_populates="post",cascade="all, delete-orphan",
    )

    __table_args__ = (
        Index("idx_posts_status_published_at", "status", "published_at"),
        Index("idx_posts_author_id", "author_id"),
    )
