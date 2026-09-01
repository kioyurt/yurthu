"""媒体上传业务逻辑：文件存储、图片宽高提取、媒体库管理。"""

import io
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Tuple

from PIL import Image
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import settings
from ..core.exceptions import (
    FileTooLargeException,
    MediaNotFoundException,
    ValidationException,
)
from ..core.logging import get_logger
from ..models.media import Media
from ..repositories.media_repository import MediaRepository

logger = get_logger(__name__)


class MediaService:
    """媒体服务类。"""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.media_repo = MediaRepository(db)

    async def upload_file(
        self,
        filename: str,
        content: bytes,
        mime_type: str,
        uploader_id: int,
    ) -> Media:
        """上传单个文件。

        Args:
            filename: 原始文件名。
            content: 文件内容字节。
            mime_type: MIME 类型。
            uploader_id: 上传者用户 ID。

        Returns:
            创建后的媒体记录对象。

        Raises:
            FileTooLargeException: 文件超过大小限制。
            ValidationException: 文件为空。
        """
        # 校验文件大小
        if len(content) == 0:
            raise ValidationException(message="文件不能为空")
        if len(content) > settings.max_upload_size:
            max_size_mb = settings.max_upload_size // (1024 * 1024)
            raise FileTooLargeException(max_size_mb=max_size_mb)

        # 生成 UUID 文件名，保留原扩展名
        ext = Path(filename).suffix.lower()
        stored_name = f"{uuid.uuid4().hex}{ext}"

        # 按年月分子目录，避免单目录文件过多
        date_dir = datetime.utcnow().strftime("%Y/%m")
        relative_dir = Path(date_dir)
        full_dir = Path(settings.media_root) / relative_dir
        full_dir.mkdir(parents=True, exist_ok=True)

        filepath = str(relative_dir / stored_name)
        full_path = Path(settings.media_root) / filepath

        # 写入磁盘
        with open(full_path, "wb") as f:
            f.write(content)

        # 图片读宽高
        width: Optional[int] = None
        height: Optional[int] = None
        if mime_type.startswith("image/") and ext not in (".svg",):
            try:
                with Image.open(io.BytesIO(content)) as img:
                    width, height = img.size
            except Exception as exc:
                logger.warning(f"Failed to get image dimensions for {filename}: {exc}")
                width = None
                height = None

        # 构建 URL 路径
        url_path = f"{settings.media_url.rstrip('/')}/{filepath}"

        media = Media(
            filename=filename,
            stored_filename=stored_name,
            filepath=filepath,
            url_path=url_path,
            mime_type=mime_type,
            size_bytes=len(content),
            width=width,
            height=height,
            uploader_id=uploader_id,
        )

        media = await self.media_repo.create(media)
        logger.info(
            f"Media uploaded: id={media.id}, filename={filename}, size={len(content)} bytes"
        )
        return media

    async def list_media(
        self,
        page: int = 1,
        page_size: int = 20,
        uploader_id: Optional[int] = None,
        mime_type_prefix: Optional[str] = None,
    ) -> Tuple[List[Media], int]:
        """分页查询媒体列表。

        Args:
            page: 页码。
            page_size: 每页数量。
            uploader_id: 上传者 ID 筛选。
            mime_type_prefix: MIME 类型前缀筛选。

        Returns:
            (媒体列表, 总数)。
        """
        return await self.media_repo.list_paginated(
            page=page,
            page_size=page_size,
            uploader_id=uploader_id,
            mime_type_prefix=mime_type_prefix,
        )

    async def delete_media(self, media_id: int) -> None:
        """删除媒体记录及磁盘文件。

        Args:
            media_id: 媒体 ID。

        Raises:
            MediaNotFoundException: 媒体文件不存在。
        """
        media = await self.media_repo.get_by_id(media_id)
        if media is None:
            raise MediaNotFoundException()

        # 删除磁盘文件
        full_path = Path(settings.media_root) / media.filepath
        try:
            if full_path.exists():
                full_path.unlink()
                logger.info(f"Media file deleted: {full_path}")
        except OSError as exc:
            logger.error(f"Failed to delete media file {full_path}: {exc}")
            # 文件删除失败不阻断记录删除，只记日志

        await self.media_repo.delete(media)
        logger.info(f"Media record deleted: id={media_id}")

    async def get_media(self, media_id: int) -> Optional[Media]:
        """按 ID 获取媒体信息。

        Args:
            media_id: 媒体 ID。

        Returns:
            媒体对象或 None。
        """
        return await self.media_repo.get_by_id(media_id)
