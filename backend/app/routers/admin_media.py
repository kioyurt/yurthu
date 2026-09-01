"""管理后台 - 媒体上传路由。"""

from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import settings
from ..core.pagination import PaginatedResponse
from ..dependencies import get_db, require_admin
from ..models.user import User
from ..schemas.media import MediaOut
from ..services.media_service import MediaService

router = APIRouter(prefix="/api/admin/media", tags=["管理 - 媒体"])


@router.post(
    "/upload",
    response_model=MediaOut,
    summary="上传文件",
    status_code=201,
)
async def admin_upload_media(
    file: UploadFile = File(..., description="上传的文件"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> MediaOut:
    """上传单个文件到媒体库。

    - 支持任意类型文件（图片、文档等）
    - 图片自动获取宽高信息
    - 文件按年月分子目录存储，文件名 UUID 化
    - 超过大小限制返回 413
    """
    content = await file.read()

    service = MediaService(db)
    media = await service.upload_file(
        filename=file.filename or "upload",
        content=content,
        mime_type=file.content_type or "application/octet-stream",
        uploader_id=current_user.id,
    )
    return media


@router.get(
    "",
    response_model=PaginatedResponse[MediaOut],
    summary="媒体库列表",
    dependencies=[Depends(require_admin)],
)
async def admin_list_media(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[MediaOut]:
    """分页获取媒体库文件列表，按上传时间倒序。"""
    service = MediaService(db)
    items, total = await service.list_media(page=page, page_size=page_size)
    return PaginatedResponse[MediaOut].create(
        items=items, total=total, page=page, page_size=page_size
    )


@router.delete(
    "/{media_id}",
    summary="删除媒体文件",
    status_code=204,
)
async def admin_delete_media(
    media_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
) -> None:
    """删除媒体记录及对应的磁盘文件。"""
    service = MediaService(db)
    await service.delete_media(media_id)
    return None
