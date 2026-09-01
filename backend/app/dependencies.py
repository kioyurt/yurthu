"""全局依赖注入：数据库会话、当前用户、管理员权限、分页参数等。"""

from typing import Optional

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from .core.config import settings
from .core.exceptions import AdminRequiredException, UnauthorizedException
from .database import get_db
from .models.user import User
from .services.auth_service import AuthService


def _get_token_from_request(request: Request) -> Optional[str]:
    """从请求中提取 JWT token（优先从 Cookie，其次从 Authorization header）。

    Args:
        request: FastAPI 请求对象。

    Returns:
        JWT token 字符串，或 None。
    """
    token = request.cookies.get(settings.session_cookie_name)
    if token:
        return token

    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:]

    return None


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    """获取当前登录用户（FastAPI 依赖）。

    从 Cookie 或 Authorization header 中解析 JWT，校验有效性后返回用户对象。
    未登录或 token 无效时抛 401 异常。

    Args:
        request: FastAPI 请求对象。
        db: 数据库会话。

    Returns:
        当前登录的用户对象。

    Raises:
        UnauthorizedException: 未登录或 token 无效。
    """
    token = _get_token_from_request(request)
    if not token:
        raise UnauthorizedException()

    auth_service = AuthService(db)
    user = await auth_service.get_user_from_token(token)
    return user


async def get_current_user_optional(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """获取当前登录用户（可选，未登录返回 None）。

    用于允许匿名访问但登录用户有特权的接口（如发表评论）。

    Args:
        request: FastAPI 请求对象。
        db: 数据库会话。

    Returns:
        当前登录用户对象，未登录则返回 None。
    """
    token = _get_token_from_request(request)
    if not token:
        return None

    try:
        auth_service = AuthService(db)
        user = await auth_service.get_user_from_token(token)
        return user
    except Exception:
        return None


async def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """要求管理员权限（FastAPI 依赖）。

    当前用户必须具有 admin 角色，否则抛 403。

    Args:
        current_user: 当前登录用户。

    Returns:
        当前管理员用户对象。

    Raises:
        AdminRequiredException: 非管理员用户。
    """
    if current_user.role != "admin":
        raise AdminRequiredException()
    return current_user


def get_pagination_params(
    page: int = 1,
    page_size: int = 10,
) -> dict:
    """统一分页参数解析（FastAPI 依赖）。

    Args:
        page: 页码（从 1 开始）。
        page_size: 每页数量。

    Returns:
        包含 page、page_size、offset、limit 的字典。
    """
    page = max(1, page)
    page_size = min(100, max(1, page_size))
    return {
        "page": page,
        "page_size": page_size,
        "offset": (page - 1) * page_size,
        "limit": page_size,
    }


def get_client_ip(request: Request) -> Optional[str]:
    """获取客户端真实 IP（FastAPI 依赖）。

    优先从 X-Forwarded-For 获取（反代场景），其次取直接连接 IP。

    Args:
        request: FastAPI 请求对象。

    Returns:
        IP 地址字符串，或 None。
    """
    xff = request.headers.get("X-Forwarded-For")
    if xff:
        return xff.split(",")[0].strip()

    client = request.client
    if client:
        return client.host

    return None
