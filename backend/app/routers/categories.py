"""分类与标签公共读路由。"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies import get_db
from ..schemas.category import CategoryWithCountOut
from ..schemas.tag import TagWithCountOut
from ..services.category_service import CategoryService, TagService

router = APIRouter(tags=["分类 & 标签（公共）"])


@router.get(
    "/api/categories",
    response_model=list[CategoryWithCountOut],
    summary="获取全部分类（含文章数）",
)
async def list_categories(
    db: AsyncSession = Depends(get_db),
) -> list[CategoryWithCountOut]:
    """获取所有文章分类，按排序权重排列。

    每个分类附带该分类下的已发布文章数量。
    """
    category_service = CategoryService(db)
    items_with_count = await category_service.list_categories_with_count(
        published_only=True
    )

    result = []
    for category, count in items_with_count:
        cat_data = CategoryWithCountOut.model_validate(category)
        cat_data.post_count = count
        result.append(cat_data)

    return result


@router.get(
    "/api/tags",
    response_model=list[TagWithCountOut],
    summary="获取全部标签（含文章数）",
)
async def list_tags(
    db: AsyncSession = Depends(get_db),
) -> list[TagWithCountOut]:
    """获取所有文章标签，按文章数量倒序排列。

    每个标签附带该标签下的已发布文章数量。
    """
    tag_service = TagService(db)
    items_with_count = await tag_service.list_tags_with_count(published_only=True)

    result = []
    for tag, count in items_with_count:
        tag_data = TagWithCountOut.model_validate(tag)
        tag_data.post_count = count
        result.append(tag_data)

    return result
