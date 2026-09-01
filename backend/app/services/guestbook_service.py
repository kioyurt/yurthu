"""留言板业务逻辑。"""

from datetime import datetime, timedelta, timezone
from typing import List, Optional, Tuple

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.exceptions import (
    NotFoundException,
    ValidationException,
)
from ..core.logging import get_logger
from ..models.guestbook import GuestbookEntry
from ..models.user import User
from ..repositories.guestbook_repository import GuestbookRepository
from ..security import hash_ip

logger = get_logger(__name__)

# 反垃圾：同一 IP 留言频率限制（每分钟最多 1 条）
RATE_LIMIT_WINDOW_SECONDS = 60
RATE_LIMIT_MAX_ENTRIES = 1


class GuestbookService:
    """留言板服务类。"""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.guestbook_repo = GuestbookRepository(db)

    async def list_entries(
        self,
        page: int = 1,
        page_size: int = 20,
        status: Optional[str] = None,
        include_user: bool = True,
    ) -> Tuple[List[GuestbookEntry], int]:
        """分页获取留言列表。

        Args:
            page: 页码。
            page_size: 每页数量。
            status: 状态筛选，None 表示全部。
            include_user: 是否加载关联用户。

        Returns:
            (留言列表, 总数)。
        """
        return await self.guestbook_repo.list_paginated(
            page=page,
            page_size=page_size,
            status=status,
            include_user=include_user,
        )

    async def create_guest_entry(
        self,
        content: str,
        guest_name: str,
        guest_email: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> GuestbookEntry:
        """匿名用户发表留言。

        匿名留言默认 status=pending，需要审核。

        Args:
            content: 留言内容。
            guest_name: 昵称。
            guest_email: 邮箱。
            ip_address: 访问者 IP。

        Returns:
            创建后的留言对象。

        Raises:
            ValidationException: 内容为空或频率超限。
        """
        content = content.strip()
        if not content:
            raise ValidationException(message="留言内容不能为空")
        if not guest_name or not guest_name.strip():
            raise ValidationException(message="请填写昵称")

        # 反垃圾：IP 频率限制
        if ip_address:
            ip_hashed = hash_ip(ip_address)
            if not await self._check_rate_limit(ip_hashed):
                raise ValidationException(message="留言过于频繁，请稍后再试")
        else:
            ip_hashed = None

        entry = GuestbookEntry(
            user_id=None,
            guest_name=guest_name.strip(),
            guest_email=guest_email,
            content=content,
            status="pending",
            ip_hash=ip_hashed,
        )

        entry = await self.guestbook_repo.create(entry)
        logger.info(f"Guestbook entry created (guest): id={entry.id}")
        return entry

    async def create_logged_in_entry(
        self,
        content: str,
        user: User,
        ip_address: Optional[str] = None,
    ) -> GuestbookEntry:
        """登录用户发表留言。

        登录用户的留言自动 approved。

        Args:
            content: 留言内容。
            user: 当前登录用户。
            ip_address: 访问者 IP。

        Returns:
            创建后的留言对象。

        Raises:
            ValidationException: 内容为空。
        """
        content = content.strip()
        if not content:
            raise ValidationException(message="留言内容不能为空")

        display_name = user.display_name or user.username
        ip_hashed = hash_ip(ip_address) if ip_address else None

        entry = GuestbookEntry(
            user_id=user.id,
            guest_name=display_name,
            guest_email=user.email,
            content=content,
            status="approved",
            ip_hash=ip_hashed,
        )

        entry = await self.guestbook_repo.create(entry)
        logger.info(f"Guestbook entry created (user): id={entry.id}, user_id={user.id}")
        return entry

    async def delete_entry(self, entry_id: int) -> None:
        """删除留言。

        Args:
            entry_id: 留言 ID。

        Raises:
            NotFoundException: 留言不存在。
        """
        entry = await self.guestbook_repo.get_by_id(entry_id)
        if entry is None:
            raise NotFoundException(message="留言不存在")

        await self.guestbook_repo.delete(entry)
        logger.info(f"Guestbook entry deleted: id={entry_id}")

    async def update_entry_status(
        self, entry_id: int, status: str
    ) -> GuestbookEntry:
        """更新留言状态。

        Args:
            entry_id: 留言 ID。
            status: 新状态。

        Returns:
            更新后的留言对象。

        Raises:
            NotFoundException: 留言不存在。
            ValidationException: 状态值无效。
        """
        valid_statuses = {"approved", "pending", "spam"}
        if status not in valid_statuses:
            raise ValidationException(
                message=f"无效的留言状态，必须是以下之一：{', '.join(sorted(valid_statuses))}"
            )

        entry = await self.guestbook_repo.get_by_id(entry_id)
        if entry is None:
            raise NotFoundException(message="留言不存在")

        entry = await self.guestbook_repo.update_status(entry, status)
        logger.info(f"Guestbook entry status updated: id={entry_id}, status={status}")
        return entry

    async def _check_rate_limit(self, ip_hash: str) -> bool:
        """检查 IP 频率限制。

        Args:
            ip_hash: IP 哈希值。

        Returns:
            True 表示允许，False 表示频率超限。
        """
        since = datetime.now(timezone.utc) - timedelta(seconds=RATE_LIMIT_WINDOW_SECONDS)
        result = await self.db.execute(
            select(func.count(GuestbookEntry.id)).where(
                and_(
                    GuestbookEntry.ip_hash == ip_hash,
                    GuestbookEntry.created_at >= since,
                )
            )
        )
        count = result.scalar_one()
        return count < RATE_LIMIT_MAX_ENTRIES
