"""访问计数与统计业务逻辑：阅读计数去重、站点概览、仪表盘统计。"""

from datetime import datetime, timedelta, timezone
from typing import List, Optional, Tuple

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.logging import get_logger
from ..models.post_view import PostView
from ..models.post import Post
from ..models.comment import Comment
from ..models.category import Category
from ..models.tag import Tag
from ..models.media import Media
from ..models.guestbook import GuestbookEntry
from ..repositories.post_view_repository import PostViewRepository
from ..repositories.post_repository import PostRepository
from ..repositories.comment_repository import CommentRepository
from ..repositories.category_repository import CategoryRepository
from ..repositories.tag_repository import TagRepository
from ..repositories.media_repository import MediaRepository
from ..repositories.guestbook_repository import GuestbookRepository
from ..schemas.stats import (
    StatsOverview,
    DashboardStats,
    TrendItem,
    TopPostItem,
    CategoryDistributionItem,
    PostStatsItem,
)
from ..security import generate_session_id, hash_ip

logger = get_logger(__name__)


class ViewService:
    """访问计数服务类。"""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.view_repo = PostViewRepository(db)
        self.post_repo = PostRepository(db)

    async def record_view(
        self,
        post_id: int,
        session_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        referer: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Tuple[bool, Optional[str]]:
        """记录文章访问，并按 session 去重更新阅读计数。

        同一会话同一文章 24 小时内只计数一次。

        Args:
            post_id: 文章 ID。
            session_id: 会话 ID（若为 None 则生成一个新的）。
            ip_address: 访问者 IP。
            referer: 来源页。
            user_agent: 浏览器 UA。

        Returns:
            (是否计入了阅读数, 会话 ID)。
        """
        # 生成或使用 session_id
        if not session_id:
            session_id = generate_session_id()

        ip_hashed = hash_ip(ip_address) if ip_address else None

        # 检查去重：同 session 同文章 24h 内是否已访问
        already_counted = await self.view_repo.exists_by_session_and_post(
            session_id=session_id, post_id=post_id, within_hours=24
        )

        # 无论是否去重，都写入一条访问记录（用于统计分析）
        view = PostView(
            post_id=post_id,
            session_id=session_id,
            ip_hash=ip_hashed,
            referer=referer,
            user_agent=user_agent,
        )
        await self.view_repo.create(view)

        # 只有首次访问（24h 内去重）才增加计数
        if not already_counted:
            await self.post_repo.increment_view_count(post_id)
            return True, session_id

        return False, session_id


class StatsService:
    """统计服务类。"""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.view_repo = PostViewRepository(db)
        self.post_repo = PostRepository(db)
        self.comment_repo = CommentRepository(db)
        self.category_repo = CategoryRepository(db)
        self.tag_repo = TagRepository(db)
        self.media_repo = MediaRepository(db)
        self.guestbook_repo = GuestbookRepository(db)

    async def get_overview(self) -> StatsOverview:
        """获取站点概览统计。

        Returns:
            站点概览统计数据。
        """
        total_posts = await self.post_repo.count_by_status(status="published")
        total_comments = await self.comment_repo.count_by_status(status="approved")
        total_views = await self.view_repo.get_total_views()
        total_categories = await self.category_repo.count_all()
        total_tags = await self.tag_repo.count_all()
        total_media = await self.media_repo.count_all()
        total_guestbook = await self.guestbook_repo.count_by_status(status="approved")

        return StatsOverview(
            total_posts=total_posts,
            total_comments=total_comments,
            total_views=total_views,
            total_categories=total_categories,
            total_tags=total_tags,
            total_media=total_media,
            total_guestbook=total_guestbook,
        )

    async def get_dashboard_stats(self) -> DashboardStats:
        """获取管理员仪表盘统计数据。

        Returns:
            仪表盘统计数据。
        """
        overview = await self.get_overview()

        # 阅读趋势（7天、30天）
        views_trend_7d = await self._get_views_trend(days=7)
        views_trend_30d = await self._get_views_trend(days=30)

        # 评论趋势（7天）
        comments_trend_7d = await self._get_comments_trend(days=7)

        # 热门文章 Top10
        top_posts_data = await self.view_repo.get_top_posts(days=30, limit=10)
        top_posts: List[TopPostItem] = []
        for post_id, view_count in top_posts_data:
            post = await self.post_repo.get_by_id(post_id, include_relations=False)
            if post:
                top_posts.append(
                    TopPostItem(
                        id=post.id,
                        title=post.title,
                        slug=post.slug,
                        view_count=view_count,
                    )
                )

        # 分类文章分布
        category_data = await self.category_repo.list_with_post_count(published_only=True)
        category_distribution = [
            CategoryDistributionItem(
                category_id=cat.id,
                category_name=cat.name,
                post_count=count,
            )
            for cat, count in category_data
        ]

        # 待审核数量
        pending_comments = await self.comment_repo.count_by_status(status="pending")
        pending_guestbook = await self.guestbook_repo.count_by_status(status="pending")

        # 今日新评论数
        today_start = datetime.now(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        recent_comments_result = await self.db.execute(
            select(func.count(Comment.id)).where(Comment.created_at >= today_start)
        )
        recent_comments = recent_comments_result.scalar_one()

        return DashboardStats(
            overview=overview,
            views_trend_7d=views_trend_7d,
            views_trend_30d=views_trend_30d,
            comments_trend_7d=comments_trend_7d,
            top_posts=top_posts,
            category_distribution=category_distribution,
            recent_comments=recent_comments,
            pending_comments=pending_comments,
            pending_guestbook=pending_guestbook,
        )

    async def get_post_daily_stats(
        self, post_id: int, days: int = 30
    ) -> List[PostStatsItem]:
        """获取单篇文章的每日阅读趋势。

        Args:
            post_id: 文章 ID。
            days: 统计天数。

        Returns:
            每日阅读数据列表。
        """
        end_date = datetime.now(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        ) + timedelta(days=1)
        start_date = end_date - timedelta(days=days)

        views_by_date = await self.view_repo.get_views_by_date_range(
            start_date=start_date, end_date=end_date, post_id=post_id
        )

        # 构建完整日期序列（补零）
        stats_map = {date_str: count for date_str, count in views_by_date}
        result: List[PostStatsItem] = []
        current = start_date
        while current < end_date:
            date_str = current.strftime("%Y-%m-%d")
            result.append(
                PostStatsItem(date=date_str, views=stats_map.get(date_str, 0))
            )
            current += timedelta(days=1)

        return result

    async def _get_views_trend(self, days: int) -> List[TrendItem]:
        """获取阅读趋势（按日聚合）。

        Args:
            days: 统计天数。

        Returns:
            趋势数据列表（按日期升序）。
        """
        end_date = datetime.now(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        ) + timedelta(days=1)
        start_date = end_date - timedelta(days=days)

        views_by_date = await self.view_repo.get_views_by_date_range(
            start_date=start_date, end_date=end_date
        )

        # 构建完整日期序列（补零）
        stats_map = {date_str: count for date_str, count in views_by_date}
        result: List[TrendItem] = []
        current = start_date
        while current < end_date:
            date_str = current.strftime("%Y-%m-%d")
            result.append(
                TrendItem(date=date_str, count=stats_map.get(date_str, 0))
            )
            current += timedelta(days=1)

        return result

    async def _get_comments_trend(self, days: int) -> List[TrendItem]:
        """获取评论趋势（按日聚合）。

        Args:
            days: 统计天数。

        Returns:
            趋势数据列表。
        """
        from sqlalchemy import cast, Date

        end_date = datetime.now(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        ) + timedelta(days=1)
        start_date = end_date - timedelta(days=days)

        result_stmt = await self.db.execute(
            select(
                cast(Comment.created_at, Date).label("date"),
                func.count(Comment.id).label("count"),
            )
            .where(
                Comment.created_at >= start_date,
                Comment.created_at < end_date,
            )
            .group_by(cast(Comment.created_at, Date))
            .order_by("date")
        )
        comments_by_date = [(row[0].strftime("%Y-%m-%d"), row[1]) for row in result_stmt.all()]

        # 构建完整日期序列
        stats_map = {date_str: count for date_str, count in comments_by_date}
        result: List[TrendItem] = []
        current = start_date
        while current < end_date:
            date_str = current.strftime("%Y-%m-%d")
            result.append(
                TrendItem(date=date_str, count=stats_map.get(date_str, 0))
            )
            current += timedelta(days=1)

        return result
