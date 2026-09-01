"""管理后台 - 分类 & 标签 CRUD 路由。"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies import get_db, require_admin
from ..schemas.category import CategoryCreate, CategoryOut, CategoryUpdate
from ..schemas.tag import TagCreate, TagOut, TagUpdate
from ..services.category_service import CategoryService, TagService

router = APIRouter(prefix="/api/admin", tags=["管理 - 分类 & 标签"])


# ---- 分类 ----

@router.post(
    "/categories",
    response_model=CategoryOut,
    summary="创建分类",
    status_code=201,
)
async def admin_create_category(
    body: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
) -> CategoryOut:
    """创建新的文章分类。"""
    service = CategoryService(db)
    category = await service.create_category(
        name=body.name,
        slug=body.slug,
        description=body.description,
        sort_order=body.sort_order,
    )
    return category


@router.put(
    "/categories/{category_id}",
    response_model=CategoryOut,
    summary="更新分类",
)
async def admin_update_category(
    category_id: int,
    body: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
) -> CategoryOut:
    """更新分类信息。"""
    service = CategoryService(db)
    category = await service.update_category(
        category_id=category_id,
        name=body.name,
        slug=body.slug,
        description=body.description,
        sort_order=body.sort_order,
    )
    return category


@router.delete(
    "/categories/{category_id}",
    summary="删除分类",
    status_code=204,
)
async def admin_delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
) -> None:
    """删除分类。

    删除后，该分类下的文章 category_id 将变为 NULL。
    """
    service = CategoryService(db)
    await service.delete_category(category_id)
    return None


# ---- 标签 ----

@router.post(
    "/tags",
    response_model=TagOut,
    summary="创建标签",
    status_code=201,
)
async def admin_create_tag(
    body: TagCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
) -> TagOut:
    """创建新的文章标签。"""
    service = TagService(db)
    tag = await service.create_tag(name=body.name, slug=body.slug)
    return tag


@router.put(
    "/tags/{tag_id}",
    response_model=TagOut,
    summary="更新标签",
)
async def admin_update_tag(
    tag_id: int,
    body: TagUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
) -> TagOut:
    """更新标签名称或 slug。"""
    service = TagService(db)
    tag = await service.update_tag(
        tag_id=tag_id,
        name=body.name,
        slug=body.slug,
    )
    return tag


@router.delete(
    "/tags/{tag_id}",
    summary="删除标签",
    status_code=204,
)
async def admin_delete_tag(
    tag_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
) -> None:
    """删除标签。

    删除后，相关文章与该标签的关联也会自动解除。
    """
    service = TagService(db)
    await service.delete_tag(tag_id)
    return None
