"""文章分类模型。"""

from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Category(Base):
    """文章分类表。"""

    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True,)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, comment="分类名称")
    slug: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False, comment="URL 友好标识"
    )
    description: Mapped[Optional[str]] = mapped_column(
        String(200), default=None, comment="分类描述"
    )
    sort_order: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, index=True, comment="排序权重（越小越靠前）"
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
        back_populates="category",)
