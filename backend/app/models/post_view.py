"""文章访问记录模型。

细粒度的访问事件，支持按日/周/月维度的统计分析。
posts.view_count 是它的缓存汇总。
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import (
    BigInteger,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class PostView(Base):
    """文章访问记录表。"""

    __tablename__ = "post_views"

    id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, autoincrement=True,)
    post_id: Mapped[int] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
        comment="文章 ID",
    )
    session_id: Mapped[Optional[str]] = mapped_column(
        String(64), index=True, default=None, comment="会话标识（用于去重）"
    )
    ip_hash: Mapped[Optional[str]] = mapped_column(
        String(64), default=None, comment="IP 哈希"
    )
    referer: Mapped[Optional[str]] = mapped_column(
        String(500), default=None, comment="来源页"
    )
    user_agent: Mapped[Optional[str]] = mapped_column(
        String(500), default=None, comment="UA"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
        comment="访问时间",
    )

    # ---- 关系 ----
    post: Mapped["Post"] = relationship(  # noqa: F821
        "Post", back_populates="views",)

    __table_args__ = (
        Index("idx_post_views_post_created", "post_id", "created_at"),
    )
