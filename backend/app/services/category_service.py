"""分类与标签业务逻辑。"""

from typing import List, Optional, Tuple

from sqlalchemy.ext.asyncio import AsyncSession

from ..core.exceptions import (
    CategoryNotFoundException,
    DuplicateNameException,
    DuplicateSlugException,
    TagNotFoundException,
)
from ..core.logging import get_logger
from ..models.category import Category
from ..models.tag import Tag
from ..repositories.category_repository import CategoryRepository
from ..repositories.tag_repository import TagRepository

logger = get_logger(__name__)


class CategoryService:
    """分类服务类。"""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.category_repo = CategoryRepository(db)

    async def get_category(self, category_id: int) -> Optional[Category]:
        """按 ID 获取分类。

        Args:
            category_id: 分类 ID。

        Returns:
            分类对象或 None。
        """
        return await self.category_repo.get_by_id(category_id)

    async def get_category_by_slug(self, slug: str) -> Optional[Category]:
        """按 slug 获取分类。

        Args:
            slug: 分类 slug。

        Returns:
            分类对象或 None。
        """
        return await self.category_repo.get_by_slug(slug)

    async def list_categories(self) -> List[Category]:
        """获取所有分类列表。

        Returns:
            分类列表。
        """
        return await self.category_repo.list_all()

    async def list_categories_with_count(
        self, published_only: bool = True
    ) -> List[Tuple[Category, int]]:
        """获取所有分类及对应文章数。

        Args:
            published_only: 是否只统计已发布文章。

        Returns:
            (分类对象, 文章数) 列表。
        """
        return await self.category_repo.list_with_post_count(
            published_only=published_only
        )

    async def create_category(
        self,
        name: str,
        slug: str,
        description: Optional[str] = None,
        sort_order: int = 0,
    ) -> Category:
        """创建分类。

        Args:
            name: 分类名称。
            slug: URL slug。
            description: 分类描述。
            sort_order: 排序权重。

        Returns:
            创建后的分类对象。

        Raises:
            DuplicateNameException: 名称已存在。
            DuplicateSlugException: slug 已存在。
        """
        # 检查名称唯一性
        existing_name = await self.category_repo.get_by_name(name)
        if existing_name is not None:
            raise DuplicateNameException(name=name, resource="分类")

        # 检查 slug 唯一性
        existing_slug = await self.category_repo.get_by_slug(slug)
        if existing_slug is not None:
            raise DuplicateSlugException(slug=slug)

        category = Category(
            name=name,
            slug=slug,
            description=description,
            sort_order=sort_order,
        )
        category = await self.category_repo.create(category)
        logger.info(f"Category created: id={category.id}, name={name}")
        return category

    async def update_category(
        self,
        category_id: int,
        name: Optional[str] = None,
        slug: Optional[str] = None,
        description: Optional[str] = None,
        sort_order: Optional[int] = None,
    ) -> Category:
        """更新分类。

        Args:
            category_id: 分类 ID。
            name: 新名称。
            slug: 新 slug。
            description: 新描述。
            sort_order: 新排序权重。

        Returns:
            更新后的分类对象。

        Raises:
            CategoryNotFoundException: 分类不存在。
            DuplicateNameException: 名称已被其他分类使用。
            DuplicateSlugException: slug 已被其他分类使用。
        """
        category = await self.category_repo.get_by_id(category_id)
        if category is None:
            raise CategoryNotFoundException()

        if name is not None and name != category.name:
            existing = await self.category_repo.get_by_name(name)
            if existing is not None and existing.id != category_id:
                raise DuplicateNameException(name=name, resource="分类")
            category.name = name

        if slug is not None and slug != category.slug:
            existing = await self.category_repo.get_by_slug(slug)
            if existing is not None and existing.id != category_id:
                raise DuplicateSlugException(slug=slug)
            category.slug = slug

        if description is not None:
            category.description = description

        if sort_order is not None:
            category.sort_order = sort_order

        category = await self.category_repo.update(category)
        logger.info(f"Category updated: id={category_id}")
        return category

    async def delete_category(self, category_id: int) -> None:
        """删除分类。

        Args:
            category_id: 分类 ID。

        Raises:
            CategoryNotFoundException: 分类不存在。
        """
        category = await self.category_repo.get_by_id(category_id)
        if category is None:
            raise CategoryNotFoundException()

        await self.category_repo.delete(category)
        logger.info(f"Category deleted: id={category_id}")


class TagService:
    """标签服务类。"""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.tag_repo = TagRepository(db)

    async def get_tag(self, tag_id: int) -> Optional[Tag]:
        """按 ID 获取标签。

        Args:
            tag_id: 标签 ID。

        Returns:
            标签对象或 None。
        """
        return await self.tag_repo.get_by_id(tag_id)

    async def get_tag_by_slug(self, slug: str) -> Optional[Tag]:
        """按 slug 获取标签。

        Args:
            slug: 标签 slug。

        Returns:
            标签对象或 None。
        """
        return await self.tag_repo.get_by_slug(slug)

    async def list_tags(self) -> List[Tag]:
        """获取所有标签列表。

        Returns:
            标签列表。
        """
        return await self.tag_repo.list_all()

    async def list_tags_with_count(
        self, published_only: bool = True
    ) -> List[Tuple[Tag, int]]:
        """获取所有标签及对应文章数（按文章数倒序）。

        Args:
            published_only: 是否只统计已发布文章。

        Returns:
            (标签对象, 文章数) 列表。
        """
        return await self.tag_repo.list_with_post_count(published_only=published_only)

    async def create_tag(self, name: str, slug: str) -> Tag:
        """创建标签。

        Args:
            name: 标签名称。
            slug: URL slug。

        Returns:
            创建后的标签对象。

        Raises:
            DuplicateNameException: 名称已存在。
            DuplicateSlugException: slug 已存在。
        """
        existing_name = await self.tag_repo.get_by_name(name)
        if existing_name is not None:
            raise DuplicateNameException(name=name, resource="标签")

        existing_slug = await self.tag_repo.get_by_slug(slug)
        if existing_slug is not None:
            raise DuplicateSlugException(slug=slug)

        tag = Tag(name=name, slug=slug)
        tag = await self.tag_repo.create(tag)
        logger.info(f"Tag created: id={tag.id}, name={name}")
        return tag

    async def update_tag(
        self,
        tag_id: int,
        name: Optional[str] = None,
        slug: Optional[str] = None,
    ) -> Tag:
        """更新标签。

        Args:
            tag_id: 标签 ID。
            name: 新名称。
            slug: 新 slug。

        Returns:
            更新后的标签对象。

        Raises:
            TagNotFoundException: 标签不存在。
            DuplicateNameException: 名称已被其他标签使用。
            DuplicateSlugException: slug 已被其他标签使用。
        """
        tag = await self.tag_repo.get_by_id(tag_id)
        if tag is None:
            raise TagNotFoundException()

        if name is not None and name != tag.name:
            existing = await self.tag_repo.get_by_name(name)
            if existing is not None and existing.id != tag_id:
                raise DuplicateNameException(name=name, resource="标签")
            tag.name = name

        if slug is not None and slug != tag.slug:
            existing = await self.tag_repo.get_by_slug(slug)
            if existing is not None and existing.id != tag_id:
                raise DuplicateSlugException(slug=slug)
            tag.slug = slug

        tag = await self.tag_repo.update(tag)
        logger.info(f"Tag updated: id={tag_id}")
        return tag

    async def delete_tag(self, tag_id: int) -> None:
        """删除标签。

        Args:
            tag_id: 标签 ID。

        Raises:
            TagNotFoundException: 标签不存在。
        """
        tag = await self.tag_repo.get_by_id(tag_id)
        if tag is None:
            raise TagNotFoundException()

        await self.tag_repo.delete(tag)
        logger.info(f"Tag deleted: id={tag_id}")
