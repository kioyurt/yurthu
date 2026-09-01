"""文章业务逻辑：创建、更新、发布、搜索等。"""

from datetime import datetime, timezone
from typing import List, Optional, Tuple

from sqlalchemy.ext.asyncio import AsyncSession

from ..core.exceptions import (
    DuplicateSlugException,
    PostNotFoundException,
)
from ..core.logging import get_logger
from ..models.post import Post
from ..models.user import User
from ..repositories.post_repository import PostRepository

logger = get_logger(__name__)


class PostService:
    """文章服务类。"""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.post_repo = PostRepository(db)

    async def get_post_by_id(self, post_id: int) -> Optional[Post]:
        """按 ID 获取文章。

        Args:
            post_id: 文章 ID。

        Returns:
            文章对象或 None。
        """
        return await self.post_repo.get_by_id(post_id)

    async def get_post_by_slug(self, slug: str) -> Optional[Post]:
        """按 slug 获取文章。

        Args:
            slug: 文章 slug。

        Returns:
            文章对象或 None。
        """
        return await self.post_repo.get_by_slug(slug)

    async def get_post_detail_by_slug(self, slug: str, require_published: bool = True) -> Post:
        """按 slug 获取文章详情（不存在时抛异常）。

        Args:
            slug: 文章 slug。
            require_published: 是否要求文章已发布。

        Returns:
            文章对象。

        Raises:
            PostNotFoundException: 文章不存在或状态不符合要求。
        """
        post = await self.post_repo.get_by_slug(slug)
        if post is None:
            raise PostNotFoundException()
        if require_published and post.status != "published":
            raise PostNotFoundException()
        return post

    async def list_posts(
        self,
        page: int = 1,
        page_size: int = 10,
        status: Optional[str] = None,
        category_id: Optional[int] = None,
        tag_id: Optional[int] = None,
        search: Optional[str] = None,
        include_unpublished: bool = False,
    ) -> Tuple[List[Post], int]:
        """分页获取文章列表。

        Args:
            page: 页码。
            page_size: 每页数量。
            status: 状态筛选（优先级高于 include_unpublished）。
            category_id: 分类 ID 筛选。
            tag_id: 标签 ID 筛选。
            search: 搜索关键词。
            include_unpublished: 是否包含未发布文章（管理后台用）。

        Returns:
            (文章列表, 总数)。
        """
        # 默认只返回已发布文章，除非显式指定 status 或 include_unpublished
        effective_status = status
        if effective_status is None and not include_unpublished:
            effective_status = "published"

        return await self.post_repo.list_paginated(
            page=page,
            page_size=page_size,
            status=effective_status,
            category_id=category_id,
            tag_id=tag_id,
            search=search,
        )

    async def create_post(
        self,
        title: str,
        slug: str,
        content: str,
        author_id: int,
        excerpt: Optional[str] = None,
        cover_image: Optional[str] = None,
        status: str = "draft",
        category_id: Optional[int] = None,
        is_pinned: bool = False,
        allow_comments: bool = True,
        tag_ids: Optional[List[int]] = None,
    ) -> Post:
        """创建文章。

        Args:
            title: 标题。
            slug: URL slug。
            content: 正文。
            author_id: 作者 ID。
            excerpt: 摘要。
            cover_image: 封面图。
            status: 状态。
            category_id: 分类 ID。
            is_pinned: 是否置顶。
            allow_comments: 是否允许评论。
            tag_ids: 标签 ID 列表。

        Returns:
            创建后的文章对象。

        Raises:
            DuplicateSlugException: slug 已存在。
        """
        # 检查 slug 唯一性
        existing = await self.post_repo.get_by_slug(slug)
        if existing is not None:
            raise DuplicateSlugException(slug=slug)

        # 自动生成摘要（如果未提供）
        if not excerpt and content:
            excerpt = self._generate_excerpt(content)

        # 设置发布时间
        published_at = None
        if status == "published":
            published_at = datetime.now(timezone.utc)

        post = Post(
            title=title,
            slug=slug,
            content=content,
            excerpt=excerpt,
            cover_image=cover_image,
            status=status,
            category_id=category_id,
            author_id=author_id,
            view_count=0,
            comment_count=0,
            published_at=published_at,
            is_pinned=is_pinned,
            allow_comments=allow_comments,
        )

        post = await self.post_repo.create(post, tag_ids=tag_ids)
        logger.info(f"Post created: id={post.id}, slug={post.slug}, status={status}")
        return post

    async def update_post(
        self,
        post_id: int,
        title: Optional[str] = None,
        slug: Optional[str] = None,
        content: Optional[str] = None,
        excerpt: Optional[str] = None,
        cover_image: Optional[str] = None,
        status: Optional[str] = None,
        category_id: Optional[int] = None,
        is_pinned: Optional[bool] = None,
        allow_comments: Optional[bool] = None,
        tag_ids: Optional[List[int]] = None,
    ) -> Post:
        """更新文章。

        Args:
            post_id: 文章 ID。
            title: 新标题（None 表示不修改）。
            slug: 新 slug。
            content: 新正文。
            excerpt: 新摘要。
            cover_image: 新封面图。
            status: 新状态。
            category_id: 新分类 ID。
            is_pinned: 新置顶状态。
            allow_comments: 新评论开关。
            tag_ids: 新标签 ID 列表。

        Returns:
            更新后的文章对象。

        Raises:
            PostNotFoundException: 文章不存在。
            DuplicateSlugException: slug 已被其他文章使用。
        """
        post = await self.post_repo.get_by_id(post_id)
        if post is None:
            raise PostNotFoundException()

        # 检查 slug 唯一性（如果修改了 slug）
        if slug is not None and slug != post.slug:
            existing = await self.post_repo.get_by_slug(slug)
            if existing is not None and existing.id != post_id:
                raise DuplicateSlugException(slug=slug)
            post.slug = slug

        if title is not None:
            post.title = title
        if content is not None:
            post.content = content
            # 内容修改时自动重新生成摘要（如果原来没有）
            if not post.excerpt:
                post.excerpt = self._generate_excerpt(content)
        if excerpt is not None:
            post.excerpt = excerpt
        if cover_image is not None:
            post.cover_image = cover_image
        if status is not None:
            # 状态从非 published 变为 published 时，写入 published_at
            if status == "published" and post.status != "published" and post.published_at is None:
                post.published_at = datetime.now(timezone.utc)
            post.status = status
        if category_id is not None:
            post.category_id = category_id
        if is_pinned is not None:
            post.is_pinned = is_pinned
        if allow_comments is not None:
            post.allow_comments = allow_comments

        post = await self.post_repo.update(post, tag_ids=tag_ids)
        logger.info(f"Post updated: id={post.id}, status={post.status}")
        return post

    async def delete_post(self, post_id: int) -> None:
        """删除文章。

        Args:
            post_id: 文章 ID。

        Raises:
            PostNotFoundException: 文章不存在。
        """
        post = await self.post_repo.get_by_id(post_id)
        if post is None:
            raise PostNotFoundException()

        await self.post_repo.delete(post)
        logger.info(f"Post deleted: id={post_id}")

    def _generate_excerpt(self, content: str, max_length: int = 200) -> str:
        """从 Markdown 内容中自动生成摘要。

        去除 Markdown 标记，截取前 max_length 个字符。

        Args:
            content: Markdown 正文内容。
            max_length: 摘要最大长度。

        Returns:
            摘要字符串。
        """
        import re

        # 移除 Markdown 标题标记
        text = re.sub(r"^#{1,6}\s+", "", content, flags=re.MULTILINE)
        # 移除粗体/斜体标记
        text = re.sub(r"[*_]{1,3}([^*_]+)[*_]{1,3}", r"\1", text)
        # 移除链接标记 ![](...) 和 [...](...)
        text = re.sub(r"!\[([^\]]*)\]\([^)]*\)", r"\1", text)
        text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)
        # 移除代码块
        text = re.sub(r"```[\s\S]*?```", "", text)
        # 移除行内代码
        text = re.sub(r"`([^`]+)`", r"\1", text)
        # 移除 HTML 标签
        text = re.sub(r"<[^>]+>", "", text)
        # 合并连续空白
        text = re.sub(r"\s+", " ", text).strip()

        if len(text) > max_length:
            text = text[:max_length] + "..."

        return text
