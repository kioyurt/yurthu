"""媒体文件相关 Pydantic 模型。"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class MediaBase(BaseModel):
    """媒体文件基础字段。"""

    filename: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="原始文件名",
    )

    mime_type: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="MIME 类型",
    )

    size_bytes: int = Field(
        ...,
        ge=0,
        description="文件大小（字节）",
    )


class MediaOut(BaseModel):
    """媒体文件公共响应。"""

    model_config = ConfigDict(
        from_attributes=True,
        extra="forbid",
    )

    id: int = Field(
        ...,
        description="媒体 ID",
    )

    filename: str = Field(
        ...,
        description="原始文件名",
    )

    stored_filename: str = Field(
        ...,
        description="存储文件名",
    )

    filepath: str = Field(
        ...,
        description="相对媒体根目录的路径",
    )

    url_path: str = Field(
        ...,
        description="公开访问 URL",
    )

    mime_type: str = Field(
        ...,
        description="MIME 类型",
    )

    size_bytes: int = Field(
        ...,
        ge=0,
        description="文件大小（字节）",
    )

    width: Optional[int] = Field(
        None,
        ge=1,
        description="图片宽度",
    )

    height: Optional[int] = Field(
        None,
        ge=1,
        description="图片高度",
    )

    uploader_id: int = Field(
        ...,
        description="上传者 ID",
    )

    created_at: datetime = Field(
        ...,
        description="创建时间",
    )


class MediaUploadOut(MediaOut):
    """媒体上传响应。"""

    pass