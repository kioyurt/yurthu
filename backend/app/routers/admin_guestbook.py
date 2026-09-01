"""管理后台 - 留言板管理路由。"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.pagination import PaginatedResponse
from ..dependencies import get_db, require_admin
from ..schemas.guestbook import GuestbookOut
from ..services.guestbook_service import GuestbookService

router = APIRouter(prefix="/api/admin/guestbook", tags=["管理 - 留言板"])


@router.get(
    "",
    response_model=PaginatedResponse[GuestbookOut],
    summary="留言列表（管理后台）",
    dependencies=[Depends(require_admin)],
)
async def admin_list_guestbook(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    status: Optional[str] = Query(None, description="状态筛选"),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[GuestbookOut]:
    """管理后台留言列表，支持按状态筛选。"""
    service = GuestbookService(db)
    items, total = await service.list_entries(
        page=page, page_size=page_size, status=status
    )
    return PaginatedResponse[GuestbookOut].create(
        items=items, total=total, page=page, page_size=page_size
    )


@router.delete(
    "/{entry_id}",
    summary="删除留言",
    status_code=204,
)
async def admin_delete_guestbook_entry(
    entry_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
) -> None:
    """永久删除一条留言。"""
    service = GuestbookService(db)
    await service.delete_entry(entry_id)
    return None
