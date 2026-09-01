"""统计相关 Pydantic 模型。"""

from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class StatsOverview(BaseModel):
    """站点概览统计。"""

    total_posts: int = Field(0, description="文章总数")
    total_comments: int = Field(0, description="评论总数")
    total_views: int = Field(0, description="总阅读量")
    total_categories: int = Field(0, description="分类数")
    total_tags: int = Field(0, description="标签数")
    total_media: int = Field(0, description="媒体文件数")
    total_guestbook: int = Field(0, description="留言数")


class TrendItem(BaseModel):
    """趋势数据项。"""

    date: str = Field(..., description="日期（YYYY-MM-DD）")
    count: int = Field(..., description="数量")


class TopPostItem(BaseModel):
    """热门文章项。"""

    id: int = Field(..., description="文章 ID")
    title: str = Field(..., description="文章标题")
    slug: str = Field(..., description="slug")
    view_count: int = Field(..., description="阅读数")


class CategoryDistributionItem(BaseModel):
    """分类文章分布项。"""

    category_id: int = Field(..., description="分类 ID")
    category_name: str = Field(..., description="分类名称")
    post_count: int = Field(..., description="文章数量")


class DashboardStats(BaseModel):
    """管理员仪表盘统计。"""

    overview: StatsOverview = Field(..., description="总览")
    views_trend_7d: List[TrendItem] = Field(default_factory=list, description="过去 7 天阅读趋势")
    views_trend_30d: List[TrendItem] = Field(default_factory=list, description="过去 30 天阅读趋势")
    comments_trend_7d: List[TrendItem] = Field(default_factory=list, description="过去 7 天评论趋势")
    top_posts: List[TopPostItem] = Field(default_factory=list, description="热门文章 Top10")
    category_distribution: List[CategoryDistributionItem] = Field(
        default_factory=list, description="分类文章分布"
    )
    recent_comments: int = Field(0, description="今日新评论数")
    pending_comments: int = Field(0, description="待审核评论数")
    pending_guestbook: int = Field(0, description="待审核留言数")


class PostStatsItem(BaseModel):
    """单篇文章按日聚合统计项。"""

    date: str = Field(..., description="日期（YYYY-MM-DD）")
    views: int = Field(..., description="阅读量")
