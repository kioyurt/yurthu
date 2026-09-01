"""认证路由：GitHub OAuth2 登录、回调、登出、当前用户信息。"""

from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import settings
from ..dependencies import get_current_user, get_db
from ..models.user import User
from ..schemas.auth import UserOut
from ..services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["认证"])


@router.get("/github/login", summary="跳转到 GitHub 授权页")
async def github_login(response: Response) -> RedirectResponse:
    """302 重定向到 GitHub OAuth 授权页面。

    生成 state 参数并存入 HttpOnly Cookie，用于后续 CSRF 校验。
    """
    auth_service = AuthService.__new__(AuthService)
    auth_url, state = auth_service.generate_github_auth_url()

    redirect_response = RedirectResponse(auth_url)
    redirect_response.set_cookie(
        key="oauth_state",
        value=state,
        httponly=True,
        samesite="lax",
        secure=settings.session_cookie_secure,
        path="/",
        max_age=600,  # 10 分钟有效期
    )
    return redirect_response


@router.get("/github/callback", summary="GitHub OAuth 回调")
async def github_callback(
    code: str,
    state: str,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> RedirectResponse:
    """GitHub OAuth 回调接口。

    校验 state → 换 access_token → 取用户信息 → upsert 用户 → 签发 JWT → 写 Cookie → 跳前端。
    """
    auth_service = AuthService(db)

    # 校验 state 防 CSRF
    cookie_state = request.cookies.get("oauth_state")
    await auth_service.validate_state(cookie_state, state)

    # 换 token + 取用户信息
    gh_token = await auth_service.exchange_github_code(code)
    gh_user, gh_emails = await auth_service.fetch_github_user(gh_token)

    # upsert 本地用户
    user = await auth_service.upsert_user(gh_user, gh_emails)

    # 生成 JWT 并写入 Cookie
    access_token = auth_service.generate_token_for_user(user)
    auth_service.set_session_cookie(response, access_token)

    # 清除 state cookie
    response.delete_cookie(key="oauth_state", path="/")

    # 跳转到前端
    redirect_url = settings.frontend_url or "/"
    return RedirectResponse(url=redirect_url)


@router.post("/logout", summary="登出")
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user),
) -> dict:
    """清除会话 Cookie，退出登录。"""
    auth_service = AuthService.__new__(AuthService)
    auth_service.clear_session_cookie(response)
    return {"success": True, "message": "已退出登录"}


@router.get("/me", response_model=UserOut, summary="获取当前登录用户信息")
async def get_me(current_user: User = Depends(get_current_user)) -> User:
    """返回当前登录用户的详细信息。"""
    return current_user
