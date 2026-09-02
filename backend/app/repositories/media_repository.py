"""媒体文件数据访问层。"""

from typing import List, Optional, Tuple

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models.media import Media


class MediaRepository:
    """媒体文件数据访问类。"""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, media_id: int, include_uploader: bool = True) -> Optional[Media]:
        """按 ID 查找媒体文件。

        Args:
            media_id: 媒体 ID。
            include_uploader: 是否加载上传者信息。

        Returns:
            媒体对象或 None。
        """
        query = select(Media).where(Media.id == media_id)
        if include_uploader:
            query = query.options(selectinload(Media.uploader))
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_stored_filename(
        self, stored_filename: str
    ) -> Optional[Media]:
        """按存储文件名查找媒体文件。

        Args:
            stored_filename: 存储文件名。

        Returns:
            媒体对象或 None。
        """
        result = await self.db.execute(
            select(Media).where(Media.stored_filename == stored_filename)
        )
        return result.scalar_one_or_none()

    async def list_paginated(
        self,
        page: int = 1,
        page_size: int = 20,
        uploader_id: Optional[int] = None,
        mime_type_prefix: Optional[str] = None,
    ) -> Tuple[List[Media], int]:
        """分页查询媒体列表。"""

        query = select(Media)
        count_query = select(func.count(Media.id))

        if uploader_id is not None:
            query = query.where(
                Media.uploader_id == uploader_id
            )

            count_query = count_query.where(
                Media.uploader_id == uploader_id
            )

        if mime_type_prefix:
            normalized_prefix = (
                mime_type_prefix.strip()
            )

            query = query.where(
                Media.mime_type.startswith(
                    normalized_prefix
                )
            )

            count_query = count_query.where(
                Media.mime_type.startswith(
                    normalized_prefix
                )
            )

        query = (
            query
            .order_by(desc(Media.created_at))
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        result = await self.db.execute(query)

        items = list(
            result.scalars().all()
        )

        count_result = await self.db.execute(
            count_query
        )

        total = int(
            count_result.scalar_one()
        )

        return items, total

    async def create(self, media: Media) -> Media:
        """创建媒体记录。

        Args:
            media: 媒体对象。

        Returns:
            创建后的媒体对象。
        """
        self.db.add(media)
        await self.db.commit()
        await self.db.refresh(media)
        return media

    async def delete(self, media: Media) -> None:
        """删除媒体记录。

        Args:
            media: 媒体对象。
        """
        await self.db.delete(media)
        await self.db.commit()

    async def count_all(self) -> int:
        """统计媒体文件总数。

        Returns:
            媒体文件总数。
        """
        result = await self.db.execute(select(func.count(Media.id)))
        return result.scalar_one()
