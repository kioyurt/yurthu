"""标签数据访问层。"""

from typing import List, Optional, Tuple

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.tag import Tag
from ..models.post import Post
from ..models.post_tag import post_tags


class TagRepository:
    """标签数据访问类。"""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, tag_id: int) -> Optional[Tag]:
        """按 ID 查找标签。

        Args:
            tag_id: 标签 ID。

        Returns:
            标签对象或 None。
        """
        result = await self.db.execute(select(Tag).where(Tag.id == tag_id))
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> Optional[Tag]:
        """按 slug 查找标签。

        Args:
            slug: 标签 slug。

        Returns:
            标签对象或 None。
        """
        result = await self.db.execute(select(Tag).where(Tag.slug == slug))
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Optional[Tag]:
        """按名称查找标签。

        Args:
            name: 标签名称。

        Returns:
            标签对象或 None。
        """
        result = await self.db.execute(select(Tag).where(Tag.name == name))
        return result.scalar_one_or_none()

    async def get_by_ids(self, tag_ids: List[int]) -> List[Tag]:
        """按 ID 列表批量获取标签。

        Args:
            tag_ids: 标签 ID 列表。

        Returns:
            标签列表。
        """
        if not tag_ids:
            return []
        result = await self.db.execute(
            select(Tag).where(Tag.id.in_(tag_ids))
        )
        return list(result.scalars().all())

    async def list_all(self) -> List[Tag]:
        """获取所有标签（按名称排序）。

        Returns:
            标签列表。
        """
        result = await self.db.execute(select(Tag).order_by(Tag.name.asc()))
        return list(result.scalars().all())

    async def list_with_post_count(
        self, published_only: bool = True
    ) -> List[Tuple[Tag, int]]:
        """获取所有标签及对应文章数（按文章数倒序）。

        Args:
            published_only: 是否只统计已发布文章。

        Returns:
            (标签对象, 文章数) 的列表。
        """
        from sqlalchemy import outerjoin

        query = (
            select(Tag, func.count(Post.id))
            .select_from(outerjoin(Tag, post_tags, Tag.id == post_tags.c.tag_id))
            .outerjoin(Post, post_tags.c.post_id == Post.id)
            .group_by(Tag.id)
            .order_by(desc(func.count(Post.id)), Tag.name.asc())
        )
        if published_only:
            query = query.where(
                (Post.status == "published") | (Post.id.is_(None))
            )

        result = await self.db.execute(query)
        return [(row[0], row[1] or 0) for row in result.all()]

    async def create(self, tag: Tag) -> Tag:
        """创建标签。

        Args:
            tag: 标签对象。

        Returns:
            创建后的标签对象。
        """
        self.db.add(tag)
        await self.db.commit()
        await self.db.refresh(tag)
        return tag

    async def update(self, tag: Tag) -> Tag:
        """更新标签。

        Args:
            tag: 标签对象。

        Returns:
            更新后的标签对象。
        """
        await self.db.commit()
        await self.db.refresh(tag)
        return tag

    async def delete(self, tag: Tag) -> None:
        """删除标签。

        Args:
            tag: 标签对象。
        """
        await self.db.delete(tag)
        await self.db.commit()

    async def count_all(self) -> int:
        """统计标签总数。

        Returns:
            标签总数。
        """
        result = await self.db.execute(select(func.count(Tag.id)))
        return result.scalar_one()
