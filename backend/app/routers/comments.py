"""公共评论路由：读 + 发表（登录/匿名双模式）。"""

from typing import List, Optional

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies import (
    get_client_ip,
    get_current_user_optional,
    get_db,
)
from ..models.user import User
from ..schemas.comment import CommentTreeOut, GuestCommentCreate, CommentOut
from ..services.comment_service import CommentService

router = APIRouter(prefix="/api/posts", tags=["评论（公共）"])


@router.get(
    "/{slug}/comments",
    response_model=List[CommentTreeOut],
    summary="获取文章的评论列表（树形）",
)
async def list_post_comments(
    slug: str,
    db: AsyncSession = Depends(get_db),
) -> List[CommentTreeOut]:
    """获取指定文章的已审核评论列表，以 2 层树形结构返回。

    - 顶层评论按时间倒序
    - 回复按时间正序
    - 仅返回已审核（approved）的评论
    """
    from ..services.post_service import PostService

    # 先通过 slug 找到文章
    post_service = PostService(db)
    post = await post_service.get_post_by_slug(slug)
    if post is None or post.status != "published":
        return []

    comment_service = CommentService(db)
    tree_data = await comment_service.get_comments_tree(
        post_id=post.id, status="approved"
    )
    return tree_data


@router.post(
    "/{slug}/comments",
    response_model=CommentOut,
    summary="发表评论（登录或匿名）",
)
async def create_post_comment(
    slug: str,
    request: Request,
    body: GuestCommentCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
    client_ip: Optional[str] = Depends(get_client_ip),
) -> CommentOut:
    """发表文章评论。

    - 登录用户：自动 approved，显示头像和用户名
    - 匿名用户：默认 pending，需要博主审核后展示
    - 支持回复（传 parent_id），嵌套深度建议 2 层
    """
    user_agent = request.headers.get("User-Agent")

    comment_service = CommentService(db)

    if current_user is not None:
        # 登录用户评论
        comment = await comment_service.create_logged_in_comment(
            post_slug=slug,
            content=body.content,
            user=current_user,
            parent_id=body.parent_id,
            ip_address=client_ip,
            user_agent=user_agent,
        )
    else:
        # 匿名评论
        comment = await comment_service.create_guest_comment(
            post_slug=slug,
            content=body.content,
            guest_name=body.guest_name,
            guest_email=body.guest_email,
            guest_website=body.guest_website,
            parent_id=body.parent_id,
            ip_address=client_ip,
            user_agent=user_agent,
        )

    return comment
