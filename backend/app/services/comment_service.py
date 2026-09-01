"""评论业务逻辑：发表、树形组装、审核、反垃圾。"""

from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.exceptions import (
    CommentNotFoundException,
    CommentsDisabledException,
    PostNotFoundException,
    ValidationException,
)
from ..core.logging import get_logger
from ..models.comment import Comment
from ..models.user import User
from ..repositories.comment_repository import CommentRepository
from ..repositories.post_repository import PostRepository
from ..security import hash_ip

logger = get_logger(__name__)

# 反垃圾：同一 IP 评论频率限制（每分钟最多 1 条）
RATE_LIMIT_WINDOW_SECONDS = 60
RATE_LIMIT_MAX_COMMENTS = 1


class CommentService:
    """评论服务类。"""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.comment_repo = CommentRepository(db)
        self.post_repo = PostRepository(db)

    async def get_comments_tree(
        self, post_id: int, status: Optional[str] = "approved"
    ) -> List[dict]:
        """获取文章的评论树形结构（2 层）。

        Args:
            post_id: 文章 ID。
            status: 状态筛选，None 表示全部。

        Returns:
            树形结构的评论列表（dict 形式，便于转 Pydantic）。
        """
        comments = await self.comment_repo.list_by_post(
            post_id=post_id, status=status, include_user=True
        )

        # 构建字典便于查找
        comment_map: Dict[int, dict] = {}
        for comment in comments:
            comment_map[comment.id] = {
                "id": comment.id,
                "post_id": comment.post_id,
                "parent_id": comment.parent_id,
                "content": comment.content,
                "status": comment.status,
                "created_at": comment.created_at,
                "updated_at": comment.updated_at,
                "user": comment.user if comment.user else None,
                "guest_name": comment.guest_name,
                "guest_website": comment.guest_website,
                "replies": [],
            }

        # 组装树形结构
        tree: List[dict] = []
        for item in comment_map.values():
            if item["parent_id"] is None:
                # 顶层评论
                tree.append(item)
            else:
                # 回复：挂到父评论下
                parent = comment_map.get(item["parent_id"])
                if parent is not None:
                    parent["replies"].append(item)

        # 顶层按时间倒序，回复按时间正序
        tree.sort(key=lambda x: x["created_at"], reverse=True)
        for item in tree:
            item["replies"].sort(key=lambda x: x["created_at"])

        return tree

    async def list_comments(
        self,
        page: int = 1,
        page_size: int = 20,
        status: Optional[str] = None,
        post_id: Optional[int] = None,
        search: Optional[str] = None,
    ) -> tuple:
        """分页查询评论列表（管理后台用）。

        Args:
            page: 页码。
            page_size: 每页数量。
            status: 状态筛选。
            post_id: 文章 ID 筛选。
            search: 搜索关键词。

        Returns:
            (评论列表, 总数)。
        """
        return await self.comment_repo.list_paginated(
            page=page,
            page_size=page_size,
            status=status,
            post_id=post_id,
            search=search,
        )

    async def create_guest_comment(
        self,
        post_slug: str,
        content: str,
        guest_name: str,
        guest_email: Optional[str] = None,
        guest_website: Optional[str] = None,
        parent_id: Optional[int] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Comment:
        """匿名用户发表评论。

        匿名评论默认 status=pending，需要博主审核后展示。

        Args:
            post_slug: 文章 slug。
            content: 评论内容。
            guest_name: 昵称。
            guest_email: 邮箱。
            guest_website: 网站。
            parent_id: 父评论 ID。
            ip_address: 评论者 IP（用于反垃圾）。
            user_agent: 浏览器 UA。

        Returns:
            创建后的评论对象。

        Raises:
            PostNotFoundException: 文章不存在。
            CommentsDisabledException: 文章已关闭评论。
            ValidationException: 内容为空或频率超限。
        """
        post = await self.post_repo.get_by_slug(post_slug)
        if post is None:
            raise PostNotFoundException()
        if post.status != "published":
            raise PostNotFoundException()
        if not post.allow_comments:
            raise CommentsDisabledException()

        # 校验内容
        content = content.strip()
        if not content:
            raise ValidationException(message="评论内容不能为空")
        if not guest_name or not guest_name.strip():
            raise ValidationException(message="请填写昵称")

        # 反垃圾：IP 频率限制
        if ip_address:
            ip_hashed = hash_ip(ip_address)
            if not await self._check_rate_limit(ip_hashed):
                raise ValidationException(message="评论过于频繁，请稍后再试")
        else:
            ip_hashed = None

        # 校验父评论
        if parent_id is not None:
            parent = await self.comment_repo.get_by_id(parent_id)
            if parent is None or parent.post_id != post.id:
                raise ValidationException(message="回复的评论不存在")

        comment = Comment(
            post_id=post.id,
            parent_id=parent_id,
            user_id=None,
            guest_name=guest_name.strip(),
            guest_email=guest_email,
            guest_website=guest_website,
            content=content,
            status="pending",
            ip_hash=ip_hashed,
            user_agent=user_agent,
        )

        comment = await self.comment_repo.create(comment)
        logger.info(f"Guest comment created: id={comment.id}, post_id={post.id}")
        return comment

    async def create_logged_in_comment(
        self,
        post_slug: str,
        content: str,
        user: User,
        parent_id: Optional[int] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Comment:
        """登录用户发表评论。

        登录用户的评论自动 approved。

        Args:
            post_slug: 文章 slug。
            content: 评论内容。
            user: 当前登录用户。
            parent_id: 父评论 ID。
            ip_address: 评论者 IP。
            user_agent: 浏览器 UA。

        Returns:
            创建后的评论对象。

        Raises:
            PostNotFoundException: 文章不存在。
            CommentsDisabledException: 文章已关闭评论。
            ValidationException: 内容为空。
        """
        post = await self.post_repo.get_by_slug(post_slug)
        if post is None:
            raise PostNotFoundException()
        if post.status != "published":
            raise PostNotFoundException()
        if not post.allow_comments:
            raise CommentsDisabledException()

        # 校验内容
        content = content.strip()
        if not content:
            raise ValidationException(message="评论内容不能为空")

        # 校验父评论
        if parent_id is not None:
            parent = await self.comment_repo.get_by_id(parent_id)
            if parent is None or parent.post_id != post.id:
                raise ValidationException(message="回复的评论不存在")

        ip_hashed = hash_ip(ip_address) if ip_address else None

        comment = Comment(
            post_id=post.id,
            parent_id=parent_id,
            user_id=user.id,
            guest_name=None,
            guest_email=None,
            guest_website=None,
            content=content,
            status="approved",
            ip_hash=ip_hashed,
            user_agent=user_agent,
        )

        comment = await self.comment_repo.create(comment)

        # 更新文章评论计数
        await self.post_repo.increment_comment_count(post.id)

        logger.info(
            f"User comment created: id={comment.id}, post_id={post.id}, user_id={user.id}"
        )
        return comment

    async def update_comment_status(self, comment_id: int, status: str) -> Comment:
        """更新评论状态（审核操作）。

        Args:
            comment_id: 评论 ID。
            status: 新状态（approved / pending / spam / trashed）。

        Returns:
            更新后的评论对象。

        Raises:
            CommentNotFoundException: 评论不存在。
            ValidationException: 状态值无效。
        """
        valid_statuses = {"approved", "pending", "spam", "trashed"}
        if status not in valid_statuses:
            raise ValidationException(
                message=f"无效的评论状态，必须是以下之一：{', '.join(sorted(valid_statuses))}"
            )

        comment = await self.comment_repo.get_by_id(comment_id)
        if comment is None:
            raise CommentNotFoundException()

        old_status = comment.status
        comment = await self.comment_repo.update_status(comment, status)

        # 如果从非 approved 变为 approved，增加评论计数
        if old_status != "approved" and status == "approved":
            await self.post_repo.increment_comment_count(comment.post_id)
        # 如果从 approved 变为非 approved，减少评论计数
        elif old_status == "approved" and status != "approved":
            await self.post_repo.decrement_comment_count(comment.post_id)

        logger.info(
            f"Comment status updated: id={comment_id}, {old_status} -> {status}"
        )
        return comment

    async def delete_comment(self, comment_id: int) -> None:
        """删除评论。

        Args:
            comment_id: 评论 ID。

        Raises:
            CommentNotFoundException: 评论不存在。
        """
        comment = await self.comment_repo.get_by_id(comment_id)
        if comment is None:
            raise CommentNotFoundException()

        # 如果是已审核评论，减少计数
        if comment.status == "approved":
            await self.post_repo.decrement_comment_count(comment.post_id)

        await self.comment_repo.delete(comment)
        logger.info(f"Comment deleted: id={comment_id}")

    async def _check_rate_limit(self, ip_hash: str) -> bool:
        """检查 IP 频率限制。

        Args:
            ip_hash: IP 哈希值。

        Returns:
            True 表示允许评论，False 表示频率超限。
        """
        since = datetime.now(timezone.utc) - timedelta(seconds=RATE_LIMIT_WINDOW_SECONDS)
        result = await self.db.execute(
            select(func.count(Comment.id)).where(
                and_(
                    Comment.ip_hash == ip_hash,
                    Comment.created_at >= since,
                )
            )
        )
        count = result.scalar_one()
        return count < RATE_LIMIT_MAX_COMMENTS
