"""留言板模型。

独立于文章评论的留言板功能，结构类似评论但更轻量。
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class GuestbookEntry(Base):
    """留言板条目表。"""

    __tablename__ = "guestbook_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True,)
    user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        index=True,
        default=None,
        comment="登录留言者 ID",
    )
    guest_name: Mapped[str] = mapped_column(String(50), nullable=False, comment="昵称")
    guest_email: Mapped[Optional[str]] = mapped_column(
        String(255), default=None, comment="邮箱"
    )
    content: Mapped[str] = mapped_column(
        String(1000), nullable=False, comment="留言内容"
    )
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="pending",
        index=True,
        comment="状态：approved / pending / spam",
    )
    ip_hash: Mapped[Optional[str]] = mapped_column(
        String(64), default=None, comment="IP 哈希"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
        comment="创建时间",
    )

    # ---- 关系 ----
    user: Mapped[Optional["User"]] = relationship(  # noqa: F821
        "User",)

    __table_args__ = (
        Index("idx_guestbook_status_created", "status", "created_at"),
    )
