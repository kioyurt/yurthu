"""评论数据访问层。"""

from typing import List, Optional, Tuple

from sqlalchemy import and_, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models.comment import Comment
from ..models.user import User


class CommentRepository:
    """评论数据访问类。"""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, comment_id: int, include_user: bool = True) -> Optional[Comment]:
        """按 ID 查找评论。

        Args:
            comment_id: 评论 ID。
            include_user: 是否加载关联用户。

        Returns:
            评论对象或 None。
        """
        query = select(Comment).where(Comment.id == comment_id)
        if include_user:
            query = query.options(selectinload(Comment.user))
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def list_by_post(
        self,
        post_id: int,
        status: Optional[str] = None,
        include_user: bool = True,
    ) -> List[Comment]:
        """获取文章的所有评论（按创建时间倒序）。

        Args:
            post_id: 文章 ID。
            status: 状态筛选，None 表示全部。
            include_user: 是否加载关联用户。

        Returns:
            评论列表。
        """
        query = select(Comment).where(Comment.post_id == post_id)
        if status:
            query = query.where(Comment.status == status)
        query = query.order_by(Comment.created_at.desc())
        if include_user:
            query = query.options(selectinload(Comment.user))
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def list_paginated(
        self,
        page: int = 1,
        page_size: int = 10,
        status: Optional[str] = None,
        post_id: Optional[int] = None,
        search: Optional[str] = None,
        include_user: bool = True,
    ) -> Tuple[List[Comment], int]:
        """分页查询评论列表。

        Args:
            page: 页码。
            page_size: 每页数量。
            status: 状态筛选。
            post_id: 文章 ID 筛选。
            search: 搜索关键词（内容匹配）。
            include_user: 是否加载关联用户。

        Returns:
            (评论列表, 总数)。
        """
        query = select(Comment)
        count_query = select(func.count(Comment.id))

        conditions = []
        if status:
            conditions.append(Comment.status == status)
        if post_id:
            conditions.append(Comment.post_id == post_id)
        if search:
            search_pattern = f"%{search}%"
            conditions.append(Comment.content.ilike(search_pattern))

        if conditions:
            query = query.where(and_(*conditions))
            count_query = count_query.where(and_(*conditions))

        query = query.order_by(desc(Comment.created_at))

        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        if include_user:
            query = query.options(selectinload(Comment.user))

        result = await self.db.execute(query)
        items = list(result.scalars().all())

        count_result = await self.db.execute(count_query)
        total = count_result.scalar_one()

        return items, total

    async def create(self, comment: Comment) -> Comment:
        """创建评论。

        Args:
            comment: 评论对象。

        Returns:
            创建后的评论对象。
        """
        self.db.add(comment)
        await self.db.commit()
        await self.db.refresh(comment)
        return comment

    async def update_status(self, comment: Comment, status: str) -> Comment:
        """更新评论状态。

        Args:
            comment: 评论对象。
            status: 新状态。

        Returns:
            更新后的评论对象。
        """
        comment.status = status
        await self.db.commit()
        await self.db.refresh(comment)
        return comment

    async def delete(self, comment: Comment) -> None:
        """删除评论。

        Args:
            comment: 评论对象。
        """
        await self.db.delete(comment)
        await self.db.commit()

    async def count_by_status(self, status: Optional[str] = None) -> int:
        """统计评论数量。

        Args:
            status: 状态筛选，None 表示全部。

        Returns:
            评论数量。
        """
        query = select(func.count(Comment.id))
        if status:
            query = query.where(Comment.status == status)
        result = await self.db.execute(query)
        return result.scalar_one()
