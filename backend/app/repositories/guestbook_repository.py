"""留言板数据访问层。"""

from typing import List, Optional, Tuple

from sqlalchemy import and_, desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models.guestbook import GuestbookEntry


class GuestbookRepository:
    """留言板数据访问类。"""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(
        self, entry_id: int, include_user: bool = True
    ) -> Optional[GuestbookEntry]:
        """按 ID 查找留言。

        Args:
            entry_id: 留言 ID。
            include_user: 是否加载关联用户。

        Returns:
            留言对象或 None。
        """
        query = select(GuestbookEntry).where(GuestbookEntry.id == entry_id)
        if include_user:
            query = query.options(selectinload(GuestbookEntry.user))
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def list_paginated(
        self,
        page: int = 1,
        page_size: int = 20,
        status: Optional[str] = None,
        include_user: bool = True,
    ) -> Tuple[List[GuestbookEntry], int]:
        """分页查询留言列表。

        Args:
            page: 页码。
            page_size: 每页数量。
            status: 状态筛选，None 表示全部。
            include_user: 是否加载关联用户。

        Returns:
            (留言列表, 总数)。
        """
        query = select(GuestbookEntry)
        count_query = select(func.count(GuestbookEntry.id))

        if status:
            query = query.where(GuestbookEntry.status == status)
            count_query = count_query.where(GuestbookEntry.status == status)

        query = query.order_by(desc(GuestbookEntry.created_at))

        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        if include_user:
            query = query.options(selectinload(GuestbookEntry.user))

        result = await self.db.execute(query)
        items = list(result.scalars().all())

        count_result = await self.db.execute(count_query)
        total = count_result.scalar_one()

        return items, total

    async def create(self, entry: GuestbookEntry) -> GuestbookEntry:
        """创建留言。

        Args:
            entry: 留言对象。

        Returns:
            创建后的留言对象。
        """
        self.db.add(entry)
        await self.db.commit()
        await self.db.refresh(entry)
        return entry

    async def delete(self, entry: GuestbookEntry) -> None:
        """删除留言。

        Args:
            entry: 留言对象。
        """
        await self.db.delete(entry)
        await self.db.commit()

    async def update_status(self, entry: GuestbookEntry, status: str) -> GuestbookEntry:
        """更新留言状态。

        Args:
            entry: 留言对象。
            status: 新状态。

        Returns:
            更新后的留言对象。
        """
        entry.status = status
        await self.db.commit()
        await self.db.refresh(entry)
        return entry

    async def count_by_status(self, status: Optional[str] = None) -> int:
        """统计留言数量。

        Args:
            status: 状态筛选，None 表示全部。

        Returns:
            留言数量。
        """
        query = select(func.count(GuestbookEntry.id))
        if status:
            query = query.where(GuestbookEntry.status == status)
        result = await self.db.execute(query)
        return result.scalar_one()
