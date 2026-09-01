"""管理后台 - 统计仪表盘路由。"""

from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies import get_db, require_admin
from ..schemas.stats import DashboardStats, PostStatsItem
from ..services.stats_service import StatsService

router = APIRouter(prefix="/api/admin/stats", tags=["管理 - 统计"])


@router.get(
    "/dashboard",
    response_model=DashboardStats,
    summary="管理员仪表盘统计",
    dependencies=[Depends(require_admin)],
)
async def admin_dashboard_stats(
    db: AsyncSession = Depends(get_db),
) -> DashboardStats:
    """获取管理员仪表盘完整统计数据。

    包括：总览、阅读趋势（7天/30天）、评论趋势、热门文章、分类分布、待审核数量等。
    """
    service = StatsService(db)
    return await service.get_dashboard_stats()


@router.get(
    "/posts/{post_id}",
    response_model=List[PostStatsItem],
    summary="单篇文章阅读趋势",
    dependencies=[Depends(require_admin)],
)
async def admin_post_stats(
    post_id: int,
    days: int = Query(30, ge=1, le=365, description="统计天数"),
    db: AsyncSession = Depends(get_db),
) -> List[PostStatsItem]:
    """获取单篇文章的每日阅读趋势数据。"""
    service = StatsService(db)
    return await service.get_post_daily_stats(post_id=post_id, days=days)
