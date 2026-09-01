"""公共文章读路由：列表、详情。"""

from typing import Optional

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.pagination import PaginatedResponse
from ..dependencies import get_client_ip, get_db
from ..schemas.post import PostDetailOut, PostListOut
from ..services.post_service import PostService
from ..services.stats_service import ViewService
from ..security import generate_session_id

router = APIRouter(prefix="/api/posts", tags=["文章（公共）"])


@router.get(
    "",
    response_model=PaginatedResponse[PostListOut],
    summary="分页获取文章列表",
)
async def list_posts(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=100, description="每页数量"),
    category: Optional[str] = Query(None, description="分类 slug"),
    tag: Optional[str] = Query(None, description="标签 slug"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[PostListOut]:
    """公共文章列表接口。

    - 仅返回已发布（published）的文章
    - 支持按分类、标签、关键词搜索过滤
    - 按置顶优先、发布时间倒序排列
    """
    post_service = PostService(db)

    category_id = None
    tag_id = None

    # 通过 slug 查分类和标签 ID
    if category:
        from ..services.category_service import CategoryService

        category_service = CategoryService(db)
        cat = await category_service.get_category_by_slug(category)
        if cat:
            category_id = cat.id

    if tag:
        from ..services.category_service import TagService

        tag_service = TagService(db)
        t = await tag_service.get_tag_by_slug(tag)
        if t:
            tag_id = t.id

    items, total = await post_service.list_posts(
        page=page,
        page_size=page_size,
        category_id=category_id,
        tag_id=tag_id,
        search=search,
        include_unpublished=False,
    )

    return PaginatedResponse[PostListOut].create(
        items=items, total=total, page=page, page_size=page_size
    )


@router.get(
    "/{slug}",
    response_model=PostDetailOut,
    summary="获取文章详情",
)
async def get_post(
    slug: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    client_ip: Optional[str] = Depends(get_client_ip),
) -> PostDetailOut:
    """根据 slug 获取文章详情。

    - 仅返回已发布文章
    - 自动记录访问（带去重）
    - 返回分类、标签、作者等完整信息
    """
    post_service = PostService(db)
    view_service = ViewService(db)

    post = await post_service.get_post_detail_by_slug(slug, require_published=True)

    # 记录访问（带去重）
    session_id = request.cookies.get("session_id")
    referer = request.headers.get("Referer")
    user_agent = request.headers.get("User-Agent")

    is_new_view, new_session_id = await view_service.record_view(
        post_id=post.id,
        session_id=session_id,
        ip_address=client_ip,
        referer=referer,
        user_agent=user_agent,
    )

    # 如果是新 session，设置 session_id cookie（用于后续去重）
    # 注：FastAPI 返回模型时无法直接设置 cookie，
    # 这里通过 response 在中间件或调用方处理，简化起见返回时更新 view_count
    if is_new_view:
        post.view_count += 1

    return post
