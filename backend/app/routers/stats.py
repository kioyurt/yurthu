"""公共统计路由。"""

from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies import get_db
from ..schemas.stats import StatsOverview, TrendItem
from ..services.stats_service import StatsService

router = APIRouter(prefix="/api/stats", tags=["统计（公共）"])


@router.get(
    "/overview",
    response_model=StatsOverview,
    summary="站点概览统计",
)
async def get_stats_overview(
    db: AsyncSession = Depends(get_db),
) -> StatsOverview:
    """获取站点公开概览统计数据。"""
    service = StatsService(db)
    return await service.get_overview()


@router.get(
    "/activity",
    response_model=List[TrendItem],
    summary="获取站点活跃度",
)
async def get_public_activity(
    days: int = Query(
        default=112,
        ge=7,
        le=366,
        description="统计天数",
    ),
    db: AsyncSession = Depends(get_db),
) -> List[TrendItem]:
    """
    获取站点过去 N 天的真实访问活跃度。

    返回完整日期序列：
    即使某一天没有访问，也返回 count=0。
    """
    service = StatsService(db)

    return await service.get_public_activity(days=days)