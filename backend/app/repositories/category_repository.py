"""分类数据访问层。"""

from typing import List, Optional, Tuple

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.category import Category
from ..models.post import Post


class CategoryRepository:
    """分类数据访问类。"""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, category_id: int) -> Optional[Category]:
        """按 ID 查找分类。

        Args:
            category_id: 分类 ID。

        Returns:
            分类对象或 None。
        """
        result = await self.db.execute(
            select(Category).where(Category.id == category_id)
        )
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> Optional[Category]:
        """按 slug 查找分类。

        Args:
            slug: 分类 slug。

        Returns:
            分类对象或 None。
        """
        result = await self.db.execute(
            select(Category).where(Category.slug == slug)
        )
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Optional[Category]:
        """按名称查找分类。

        Args:
            name: 分类名称。

        Returns:
            分类对象或 None。
        """
        result = await self.db.execute(
            select(Category).where(Category.name == name)
        )
        return result.scalar_one_or_none()

    async def list_all(self) -> List[Category]:
        """获取所有分类（按 sort_order 排序）。

        Returns:
            分类列表。
        """
        result = await self.db.execute(
            select(Category).order_by(Category.sort_order.asc(), Category.id.asc())
        )
        return list(result.scalars().all())

    async def list_with_post_count(self, published_only: bool = True) -> List[Tuple[Category, int]]:
        """获取所有分类及对应文章数。

        Args:
            published_only: 是否只统计已发布文章。

        Returns:
            (分类对象, 文章数) 的列表。
        """
        from sqlalchemy import outerjoin

        query = (
            select(Category, func.count(Post.id))
            .select_from(outerjoin(Category, Post, Category.id == Post.category_id))
            .group_by(Category.id)
            .order_by(Category.sort_order.asc(), Category.id.asc())
        )
        if published_only:
            query = query.where(
                (Post.status == "published") | (Post.id.is_(None))
            )

        result = await self.db.execute(query)
        return [(row[0], row[1] or 0) for row in result.all()]

    async def create(self, category: Category) -> Category:
        """创建分类。

        Args:
            category: 分类对象。

        Returns:
            创建后的分类对象。
        """
        self.db.add(category)
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def update(self, category: Category) -> Category:
        """更新分类。

        Args:
            category: 分类对象。

        Returns:
            更新后的分类对象。
        """
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def delete(self, category: Category) -> None:
        """删除分类。

        Args:
            category: 分类对象。
        """
        await self.db.delete(category)
        await self.db.commit()

    async def count_all(self) -> int:
        """统计分类总数。

        Returns:
            分类总数。
        """
        result = await self.db.execute(select(func.count(Category.id)))
        return result.scalar_one()
