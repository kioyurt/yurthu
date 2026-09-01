"""留言板公共路由：读 + 发表。"""

from typing import Optional

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.pagination import PaginatedResponse
from ..dependencies import (
    get_client_ip,
    get_current_user_optional,
    get_db,
)
from ..models.user import User
from ..schemas.guestbook import GuestbookEntryCreate, GuestbookOut
from ..services.guestbook_service import GuestbookService

router = APIRouter(prefix="/api/guestbook", tags=["留言板（公共）"])


@router.get(
    "",
    response_model=PaginatedResponse[GuestbookOut],
    summary="分页获取留言列表",
)
async def list_guestbook(
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[GuestbookOut]:
    """获取已审核的留言列表，按时间倒序排列。"""
    service = GuestbookService(db)
    items, total = await service.list_entries(
        page=page, page_size=page_size, status="approved"
    )
    return PaginatedResponse[GuestbookOut].create(
        items=items, total=total, page=page, page_size=page_size
    )


@router.post(
    "",
    response_model=GuestbookOut,
    summary="发表留言（登录或匿名）",
)
async def create_guestbook_entry(
    body: GuestbookEntryCreate,
    request: Request,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
    client_ip: Optional[str] = Depends(get_client_ip),
) -> GuestbookOut:
    """发表留言。

    - 登录用户：自动 approved
    - 匿名用户：默认 pending，需要审核
    """
    service = GuestbookService(db)

    if current_user is not None:
        entry = await service.create_logged_in_entry(
            content=body.content,
            user=current_user,
            ip_address=client_ip,
        )
    else:
        entry = await service.create_guest_entry(
            content=body.content,
            guest_name=body.guest_name,
            guest_email=body.guest_email,
            ip_address=client_ip,
        )

    return entry
