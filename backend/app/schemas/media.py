"""媒体文件相关 Pydantic 模型。"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class MediaBase(BaseModel):
    """媒体文件基础字段。"""

    filename: str = Field(..., max_length=255, description="原始文件名")
    mime_type: str = Field(..., max_length=100, description="MIME 类型")
    size_bytes: int = Field(..., description="文件大小（字节）")


class MediaOut(BaseModel):
    """媒体文件响应。"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="媒体 ID")
    filename: str = Field(..., description="原始文件名")
    stored_filename: str = Field(..., description="存储文件名")
    filepath: str = Field(..., description="相对路径")
    url_path: str = Field(..., description="可访问 URL 路径")
    mime_type: str = Field(..., description="MIME 类型")
    size_bytes: int = Field(..., description="文件大小（字节）")
    width: Optional[int] = Field(None, description="图片宽度（像素）")
    height: Optional[int] = Field(None, description="图片高度（像素）")
    uploader_id: int = Field(..., description="上传者 ID")
    created_at: datetime = Field(..., description="上传时间")


class MediaUploadOut(MediaOut):
    """上传成功响应（同 MediaOut，保留别名便于扩展）。"""

    pass
