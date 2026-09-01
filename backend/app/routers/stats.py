"""公共统计路由：站点概览。"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies import get_db
from ..schemas.stats import StatsOverview
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
    """获取站点公开概览统计数据。

    包括：文章总数、总评论数、总阅读量、分类数、标签数等。
    """
    stats_service = StatsService(db)
    return await stats_service.get_overview()
