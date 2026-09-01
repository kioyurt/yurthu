"""媒体文件模型。

记录上传的文件元数据，文件本身存在本地磁盘。
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Media(Base):
    """媒体文件表。"""

    __tablename__ = "media"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True,)
    filename: Mapped[str] = mapped_column(String(255), nullable=False, comment="原始文件名")
    stored_filename: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, comment="存储文件名（UUID 化）"
    )
    filepath: Mapped[str] = mapped_column(
        String(500), nullable=False, comment="相对 MEDIA_ROOT 的路径"
    )
    url_path: Mapped[str] = mapped_column(
        String(500), nullable=False, comment="可访问的 URL 路径"
    )
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False, comment="MIME 类型")
    size_bytes: Mapped[int] = mapped_column(
        BigInteger, nullable=False, comment="文件大小（字节）"
    )
    width: Mapped[Optional[int]] = mapped_column(
        Integer, default=None, comment="图片宽度（像素，非图片为 NULL）"
    )
    height: Mapped[Optional[int]] = mapped_column(
        Integer, default=None, comment="图片高度（像素，非图片为 NULL）"
    )
    uploader_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
        comment="上传者 ID",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="上传时间",
    )

    # ---- 关系 ----
    uploader: Mapped["User"] = relationship(  # noqa: F821
        "User", back_populates="media_uploads",)
