"""文章访问记录数据访问层。"""

from datetime import datetime, timedelta, timezone
from typing import List, Optional, Tuple

from sqlalchemy import and_, cast, func, select, Date
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.post_view import PostView


class PostViewRepository:
    """文章访问记录数据访问类。"""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, view: PostView) -> PostView:
        """创建访问记录。

        Args:
            view: 访问记录对象。

        Returns:
            创建后的访问记录对象。
        """
        self.db.add(view)
        await self.db.commit()
        await self.db.refresh(view)
        return view

    async def exists_by_session_and_post(
        self, session_id: str, post_id: int, within_hours: int = 24
    ) -> bool:
        """检查同一会话在指定时间内是否已访问过某文章（用于去重）。

        Args:
            session_id: 会话 ID。
            post_id: 文章 ID。
            within_hours: 时间窗口（小时），默认 24 小时。

        Returns:
            是否存在访问记录。
        """
        since = datetime.now(timezone.utc) - timedelta(hours=within_hours)
        result = await self.db.execute(
            select(func.count(PostView.id))
            .where(
                and_(
                    PostView.session_id == session_id,
                    PostView.post_id == post_id,
                    PostView.created_at >= since,
                )
            )
        )
        count = result.scalar_one()
        return count > 0

    async def get_total_views(self) -> int:
        """获取总访问量。

        Returns:
            总访问量。
        """
        result = await self.db.execute(select(func.count(PostView.id)))
        return result.scalar_one()

    async def get_views_by_date_range(
        self,
        start_date: datetime,
        end_date: datetime,
        post_id: Optional[int] = None,
    ) -> List[Tuple[str, int]]:
        """按日期聚合统计访问量。

        Args:
            start_date: 开始日期。
            end_date: 结束日期。
            post_id: 文章 ID，None 表示全部。

        Returns:
            (日期字符串, 访问量) 列表。
        """
        query = select(
            cast(PostView.created_at, Date).label("date"),
            func.count(PostView.id).label("count"),
        ).where(
            and_(
                PostView.created_at >= start_date,
                PostView.created_at < end_date,
            )
        )

        if post_id:
            query = query.where(PostView.post_id == post_id)

        query = query.group_by(cast(PostView.created_at, Date)).order_by("date")

        result = await self.db.execute(query)
        return [(row[0].strftime("%Y-%m-%d"), row[1]) for row in result.all()]

    async def get_top_posts(
        self,
        days: int = 7,
        limit: int = 10,
    ) -> List[Tuple[int, int]]:
        """获取指定时间范围内的热门文章。

        Args:
            days: 时间范围（天）。
            limit: 返回数量。

        Returns:
            (文章 ID, 访问量) 列表，按访问量倒序。
        """
        since = datetime.now(timezone.utc) - timedelta(days=days)
        result = await self.db.execute(
            select(
                PostView.post_id,
                func.count(PostView.id).label("view_count"),
            )
            .where(PostView.created_at >= since)
            .group_by(PostView.post_id)
            .order_by(desc(func.count(PostView.id)))
            .limit(limit)
        )
        return [(row[0], row[1]) for row in result.all()]
