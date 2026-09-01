"""管理后台 - 文章 CRUD 路由。"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.pagination import PaginatedResponse
from ..dependencies import get_db, require_admin
from ..models.user import User
from ..schemas.post import PostCreate, PostDetailOut, PostListOut, PostUpdate
from ..services.post_service import PostService

router = APIRouter(prefix="/api/admin/posts", tags=["管理 - 文章"])


@router.get(
    "",
    response_model=PaginatedResponse[PostListOut],
    summary="管理后台文章列表",
    dependencies=[Depends(require_admin)],
)
async def admin_list_posts(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    status: Optional[str] = Query(None, description="状态筛选"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[PostListOut]:
    """管理后台文章列表。

    - 可查看所有状态的文章（draft / published / archived）
    - 支持按状态筛选、关键词搜索
    - 按创建时间倒序
    """
    post_service = PostService(db)
    items, total = await post_service.list_posts(
        page=page,
        page_size=page_size,
        status=status,
        search=search,
        include_unpublished=True,
    )
    return PaginatedResponse[PostListOut].create(
        items=items, total=total, page=page, page_size=page_size
    )


@router.post(
    "",
    response_model=PostDetailOut,
    summary="创建文章",
    status_code=201,
)
async def admin_create_post(
    body: PostCreate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> PostDetailOut:
    """创建新文章。

    - 默认状态为 draft（草稿）
    - 可同时关联分类和多个标签
    - 设为 published 时自动写入发布时间
    """
    post_service = PostService(db)
    post = await post_service.create_post(
        title=body.title,
        slug=body.slug,
        content=body.content,
        author_id=current_user.id,
        excerpt=body.excerpt,
        cover_image=body.cover_image,
        status=body.status,
        category_id=body.category_id,
        is_pinned=body.is_pinned,
        allow_comments=body.allow_comments,
        tag_ids=body.tag_ids,
    )
    return post


@router.get(
    "/{post_id}",
    response_model=PostDetailOut,
    summary="获取文章详情（管理端）",
    dependencies=[Depends(require_admin)],
)
async def admin_get_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
) -> PostDetailOut:
    """根据 ID 获取文章详情（管理端，可查看任意状态）。"""
    post_service = PostService(db)
    post = await post_service.get_post_by_id(post_id)
    if post is None:
        from ..core.exceptions import PostNotFoundException

        raise PostNotFoundException()
    return post


@router.put(
    "/{post_id}",
    response_model=PostDetailOut,
    summary="更新文章",
)
async def admin_update_post(
    post_id: int,
    body: PostUpdate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> PostDetailOut:
    """更新文章信息。

    可修改：标题、slug、内容、摘要、封面、状态、分类、标签、置顶、评论开关。
    """
    post_service = PostService(db)
    post = await post_service.update_post(
        post_id=post_id,
        title=body.title,
        slug=body.slug,
        content=body.content,
        excerpt=body.excerpt,
        cover_image=body.cover_image,
        status=body.status,
        category_id=body.category_id,
        is_pinned=body.is_pinned,
        allow_comments=body.allow_comments,
        tag_ids=body.tag_ids,
    )
    return post


@router.delete(
    "/{post_id}",
    summary="删除文章",
    status_code=204,
)
async def admin_delete_post(
    post_id: int,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> None:
    """删除文章（硬删除，评论会级联删除）。"""
    post_service = PostService(db)
    await post_service.delete_post(post_id)
    return None
