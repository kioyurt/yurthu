"""文章标签模型。"""

from datetime import datetime
from typing import List

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Tag(Base):
    """文章标签表。"""

    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True,)
    name: Mapped[str] = mapped_column(String(30), unique=True, nullable=False, comment="标签名")
    slug: Mapped[str] = mapped_column(
        String(30), unique=True, index=True, nullable=False, comment="URL 友好标识"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="创建时间",
    )

    # ---- 关系 ----
    posts: Mapped[List["Post"]] = relationship(  # noqa: F821
        "Post",
        secondary="post_tags",
        back_populates="tags",)
