"""公共媒体路由。"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.pagination import PaginatedResponse
from ..dependencies import get_db
from ..schemas.media import MediaOut
from ..services.media_service import MediaService

router = APIRouter(
    prefix="/api/media",
    tags=["媒体（公共）"],
)


@router.get(
    "",
    response_model=PaginatedResponse[MediaOut],
    summary="获取公开媒体列表",
)
async def list_public_media(
    page: int = Query(
        default=1,
        ge=1,
        description="页码",
    ),
    page_size: int = Query(
        default=50,
        ge=1,
        le=100,
        description="每页数量",
    ),
    mime_type_prefix: Optional[str] = Query(
        default=None,
        max_length=50,
        description="MIME 类型前缀，例如 image/",
    ),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[MediaOut]:
    """获取公开媒体列表。

    默认按照创建时间倒序。

    Gallery 主要使用 mime_type_prefix=image/。
    """
    service = MediaService(db)

    items, total = await service.list_media(
        page=page,
        page_size=page_size,
        mime_type_prefix=mime_type_prefix,
    )

    return PaginatedResponse[MediaOut].create(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
    )