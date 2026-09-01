"""用户数据访问层。"""

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.user import User


class UserRepository:
    """用户数据访问类。"""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, user_id: int) -> Optional[User]:
        """按 ID 查找用户。

        Args:
            user_id: 用户 ID。

        Returns:
            用户对象或 None。
        """
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_github_id(self, github_id: int) -> Optional[User]:
        """按 GitHub ID 查找用户。

        Args:
            github_id: GitHub 用户 ID。

        Returns:
            用户对象或 None。
        """
        result = await self.db.execute(
            select(User).where(User.github_id == github_id)
        )
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> Optional[User]:
        """按用户名查找用户。

        Args:
            username: 用户名。

        Returns:
            用户对象或 None。
        """
        result = await self.db.execute(
            select(User).where(User.username == username)
        )
        return result.scalar_one_or_none()

    async def create(self, user: User) -> User:
        """创建新用户。

        Args:
            user: 用户对象。

        Returns:
            创建后的用户对象。
        """
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update(self, user: User) -> User:
        """更新用户信息。

        Args:
            user: 用户对象（已附加到 session）。

        Returns:
            更新后的用户对象。
        """
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def count_all(self) -> int:
        """统计用户总数。

        Returns:
            用户总数。
        """
        from sqlalchemy import func

        result = await self.db.execute(select(func.count(User.id)))
        return result.scalar_one()
