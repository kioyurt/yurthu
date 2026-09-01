"""文章数据访问层。"""

from typing import List, Optional, Tuple

from sqlalchemy import and_, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models.post import Post
from ..models.category import Category
from ..models.tag import Tag
from ..models.user import User


class PostRepository:
    """文章数据访问类。"""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, post_id: int, include_relations: bool = True) -> Optional[Post]:
        """按 ID 查找文章。

        Args:
            post_id: 文章 ID。
            include_relations: 是否加载关联数据（作者、分类、标签）。

        Returns:
            文章对象或 None。
        """
        query = select(Post).where(Post.id == post_id)
        if include_relations:
            query = query.options(
                selectinload(Post.author),
                selectinload(Post.category),
                selectinload(Post.tags),
            )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str, include_relations: bool = True) -> Optional[Post]:
        """按 slug 查找文章。

        Args:
            slug: 文章 slug。
            include_relations: 是否加载关联数据。

        Returns:
            文章对象或 None。
        """
        query = select(Post).where(Post.slug == slug)
        if include_relations:
            query = query.options(
                selectinload(Post.author),
                selectinload(Post.category),
                selectinload(Post.tags),
            )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def list_paginated(
        self,
        page: int = 1,
        page_size: int = 10,
        status: Optional[str] = None,
        category_id: Optional[int] = None,
        tag_id: Optional[int] = None,
        search: Optional[str] = None,
        include_relations: bool = True,
    ) -> Tuple[List[Post], int]:
        """分页查询文章列表。

        Args:
            page: 页码。
            page_size: 每页数量。
            status: 状态筛选。
            category_id: 分类 ID 筛选。
            tag_id: 标签 ID 筛选。
            search: 搜索关键词（标题+摘要+内容模糊匹配）。
            include_relations: 是否加载关联数据。

        Returns:
            (文章列表, 总数)。
        """
        query = select(Post)
        count_query = select(func.count(Post.id))

        # 条件筛选
        conditions = []
        if status:
            conditions.append(Post.status == status)
        if category_id:
            conditions.append(Post.category_id == category_id)
        if search:
            search_pattern = f"%{search}%"
            conditions.append(
                or_(
                    Post.title.ilike(search_pattern),
                    Post.excerpt.ilike(search_pattern),
                    Post.content.ilike(search_pattern),
                )
            )
        if conditions:
            query = query.where(and_(*conditions))
            count_query = count_query.where(and_(*conditions))

        # 标签筛选（多对多，需要 join）
        if tag_id:
            query = query.join(Post.tags).where(Tag.id == tag_id)
            count_query = count_query.join(Post.tags).where(Tag.id == tag_id)

        # 排序：置顶优先，然后按发布时间倒序
        query = query.order_by(desc(Post.is_pinned), desc(Post.published_at), desc(Post.id))

        # 分页
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        # 加载关联
        if include_relations:
            query = query.options(
                selectinload(Post.author),
                selectinload(Post.category),
                selectinload(Post.tags),
            )

        result = await self.db.execute(query)
        items = list(result.scalars().all())

        count_result = await self.db.execute(count_query)
        total = count_result.scalar_one()

        return items, total

    async def create(self, post: Post, tag_ids: Optional[List[int]] = None) -> Post:
        """创建文章。

        Args:
            post: 文章对象。
            tag_ids: 关联的标签 ID 列表。

        Returns:
            创建后的文章对象。
        """
        if tag_ids:
            tags_result = await self.db.execute(
                select(Tag).where(Tag.id.in_(tag_ids))
            )
            tags = list(tags_result.scalars().all())
            post.tags = tags

        self.db.add(post)
        await self.db.commit()
        await self.db.refresh(post)

        # 提交后重新加载关联数据，避免序列化时触发懒加载
        result = await self.db.execute(
            select(Post)
            .where(Post.id == post.id)
            .options(
                selectinload(Post.author),
                selectinload(Post.category),
                selectinload(Post.tags),
            )
        )
        return result.scalar_one()

    async def update(
        self,
        post: Post,
        tag_ids: Optional[List[int]] = None,
    ) -> Post:
        """更新文章。

        Args:
            post: 文章对象（已附加到 session）。
            tag_ids: 新的标签 ID 列表（None 表示不修改标签）。

        Returns:
            更新后的文章对象。
        """
        if tag_ids is not None:
            tags_result = await self.db.execute(
                select(Tag).where(Tag.id.in_(tag_ids))
            )
            tags = list(tags_result.scalars().all())
            post.tags = tags

        await self.db.commit()
        await self.db.refresh(post)

        # 提交后重新加载关联数据，避免序列化时触发懒加载
        result = await self.db.execute(
            select(Post)
            .where(Post.id == post.id)
            .options(
                selectinload(Post.author),
                selectinload(Post.category),
                selectinload(Post.tags),
            )
        )
        return result.scalar_one()

    async def delete(self, post: Post) -> None:
        """删除文章。

        Args:
            post: 文章对象。
        """
        await self.db.delete(post)
        await self.db.commit()

    async def increment_view_count(self, post_id: int) -> None:
        """原子增加文章阅读数。

        Args:
            post_id: 文章 ID。
        """
        await self.db.execute(
            Post.__table__.update()
            .where(Post.id == post_id)
            .values(view_count=Post.view_count + 1)
        )
        await self.db.commit()

    async def increment_comment_count(self, post_id: int) -> None:
        """原子增加文章评论数。

        Args:
            post_id: 文章 ID。
        """
        await self.db.execute(
            Post.__table__.update()
            .where(Post.id == post_id)
            .values(comment_count=Post.comment_count + 1)
        )
        await self.db.commit()

    async def decrement_comment_count(self, post_id: int) -> None:
        """原子减少文章评论数（不低于 0）。

        Args:
            post_id: 文章 ID。
        """
        from sqlalchemy import case

        await self.db.execute(
            Post.__table__.update()
            .where(Post.id == post_id)
            .values(
                comment_count=case(
                    (Post.comment_count > 0, Post.comment_count - 1),
                    else_=0,
                )
            )
        )
        await self.db.commit()

    async def count_by_status(self, status: Optional[str] = None) -> int:
        """统计文章数量。

        Args:
            status: 状态筛选，None 表示全部。

        Returns:
            文章数量。
        """
        query = select(func.count(Post.id))
        if status:
            query = query.where(Post.status == status)
        result = await self.db.execute(query)
        return result.scalar_one()
