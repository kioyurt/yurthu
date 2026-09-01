"""管理后台 - 评论审核路由。"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.pagination import PaginatedResponse
from ..dependencies import get_db, require_admin
from ..schemas.comment import CommentOut, CommentStatusUpdate
from ..services.comment_service import CommentService

router = APIRouter(prefix="/api/admin/comments", tags=["管理 - 评论审核"])


@router.get(
    "",
    response_model=PaginatedResponse[CommentOut],
    summary="评论列表（管理后台）",
    dependencies=[Depends(require_admin)],
)
async def admin_list_comments(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    status: Optional[str] = Query(None, description="状态筛选"),
    post_id: Optional[int] = Query(None, description="文章 ID 筛选"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[CommentOut]:
    """管理后台评论列表。

    - 支持按状态筛选（approved / pending / spam / trashed）
    - 支持按文章 ID 和内容搜索
    - 按创建时间倒序
    """
    service = CommentService(db)
    items, total = await service.list_comments(
        page=page,
        page_size=page_size,
        status=status,
        post_id=post_id,
        search=search,
    )
    return PaginatedResponse[CommentOut].create(
        items=items, total=total, page=page, page_size=page_size
    )


@router.patch(
    "/{comment_id}/status",
    response_model=CommentOut,
    summary="更新评论状态（审核）",
)
async def admin_update_comment_status(
    comment_id: int,
    body: CommentStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
) -> CommentOut:
    """审核评论：修改评论状态。

    可选状态：approved（已通过）、pending（待审核）、spam（垃圾）、trashed（回收站）。
    """
    service = CommentService(db)
    comment = await service.update_comment_status(
        comment_id=comment_id, status=body.status
    )
    return comment


@router.delete(
    "/{comment_id}",
    summary="删除评论",
    status_code=204,
)
async def admin_delete_comment(
    comment_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
) -> None:
    """永久删除评论。"""
    service = CommentService(db)
    await service.delete_comment(comment_id)
    return None
