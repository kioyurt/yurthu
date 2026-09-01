"""认证业务逻辑：GitHub OAuth2 流程、JWT 生成与校验、用户同步。"""

import secrets
from datetime import datetime, timezone
from typing import Optional, Tuple
from urllib.parse import urlencode

import httpx
from fastapi import Response
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import settings
from ..core.exceptions import (
    AdminRequiredException,
    InvalidStateException,
    InvalidTokenException,
    UnauthorizedException,
)
from ..models.user import User
from ..repositories.user_repository import UserRepository
from ..security import create_access_token, decode_access_token
from ..core.logging import get_logger

logger = get_logger(__name__)


class AuthService:
    """认证服务类。"""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.user_repo = UserRepository(db)

    def generate_github_auth_url(self) -> Tuple[str, str]:
        """生成 GitHub OAuth 授权 URL 和 state 令牌。

        Returns:
            (授权 URL, state 令牌)。
        """
        state = secrets.token_urlsafe(32)
        params = {
            "client_id": settings.github_client_id,
            "redirect_uri": settings.github_redirect_uri,
            "scope": "read:user user:email",
            "state": state,
            "allow_signup": "true",
        }
        auth_url = (
            f"https://github.com/login/oauth/authorize?{urlencode(params)}"
        )
        return auth_url, state

    async def exchange_github_code(self, code: str) -> str:
        """用授权码换取 GitHub access_token。

        Args:
            code: GitHub 回调返回的授权码。

        Returns:
            GitHub access_token 字符串。

        Raises:
            UnauthorizedException: 换 token 失败。
        """
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                resp = await client.post(
                    "https://github.com/login/oauth/access_token",
                    json={
                        "client_id": settings.github_client_id,
                        "client_secret": settings.github_client_secret,
                        "code": code,
                        "redirect_uri": settings.github_redirect_uri,
                    },
                    headers={"Accept": "application/json"},
                )
                resp.raise_for_status()
                data = resp.json()
            except httpx.HTTPError as exc:
                logger.error(f"GitHub token exchange HTTP error: {exc}")
                raise UnauthorizedException(message="GitHub 认证失败，请稍后重试")

        if "access_token" not in data:
            error_desc = data.get("error_description", "未知错误")
            logger.error(f"GitHub token exchange failed: {error_desc}")
            raise UnauthorizedException(message=f"GitHub 认证失败：{error_desc}")

        return data["access_token"]

    async def fetch_github_user(self, access_token: str) -> Tuple[dict, list]:
        """获取 GitHub 用户信息和邮箱列表。

        Args:
            access_token: GitHub access_token。

        Returns:
            (用户信息字典, 邮箱列表)。

        Raises:
            UnauthorizedException: 获取用户信息失败。
        """
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github.v3+json",
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                user_resp = await client.get(
                    "https://api.github.com/user", headers=headers
                )
                user_resp.raise_for_status()
                gh_user = user_resp.json()

                emails_resp = await client.get(
                    "https://api.github.com/user/emails", headers=headers
                )
                emails_resp.raise_for_status()
                gh_emails = emails_resp.json()
            except httpx.HTTPError as exc:
                logger.error(f"GitHub user info fetch error: {exc}")
                raise UnauthorizedException(message="获取 GitHub 用户信息失败")

        return gh_user, gh_emails

    async def upsert_user(self, gh_user: dict, gh_emails: list) -> User:
        """按 github_id 查找或创建用户，并同步最新信息。

        Args:
            gh_user: GitHub 用户信息字典。
            gh_emails: GitHub 邮箱列表。

        Returns:
            本地用户对象。
        """
        github_id = gh_user.get("id")
        if not github_id:
            raise UnauthorizedException(message="GitHub 用户信息不完整")

        # 提取主邮箱
        primary_email = None
        if gh_emails:
            for email_entry in gh_emails:
                if email_entry.get("primary") and email_entry.get("verified"):
                    primary_email = email_entry.get("email")
                    break
            if not primary_email:
                primary_email = gh_emails[0].get("email")

        # 角色判定：与环境变量中的 admin ID 比对
        is_admin = github_id == settings.github_admin_id
        role = "admin" if is_admin else "user"

        user = await self.user_repo.get_by_github_id(github_id)
        now = datetime.now(timezone.utc)

        if user is None:
            # 新用户
            user = User(
                github_id=github_id,
                username=gh_user.get("login", ""),
                display_name=gh_user.get("name"),
                email=primary_email,
                avatar_url=gh_user.get("avatar_url"),
                bio=gh_user.get("bio"),
                role=role,
                is_active=True,
                last_login_at=now,
            )
            user = await self.user_repo.create(user)
            logger.info(f"New user registered: github_id={github_id}, role={role}")
        else:
            # 已存在用户，同步最新信息
            user.username = gh_user.get("login", user.username)
            if gh_user.get("name"):
                user.display_name = gh_user.get("name")
            if primary_email:
                user.email = primary_email
            if gh_user.get("avatar_url"):
                user.avatar_url = gh_user.get("avatar_url")
            if gh_user.get("bio") is not None:
                user.bio = gh_user.get("bio")
            # 每次登录同步角色（环境变量可能变更）
            user.role = role
            user.last_login_at = now
            user.is_active = True
            user = await self.user_repo.update(user)
            logger.info(f"User login: id={user.id}, role={role}")

        return user

    async def validate_state(self, cookie_state: Optional[str], query_state: str) -> None:
        """校验 OAuth state 参数，防止 CSRF 攻击。

        Args:
            cookie_state: Cookie 中存储的 state。
            query_state: URL 参数中的 state。

        Raises:
            InvalidStateException: state 校验失败。
        """
        if not cookie_state or cookie_state != query_state:
            raise InvalidStateException()

    def set_session_cookie(self, response: Response, token: str) -> None:
        """将 JWT 写入 HttpOnly Cookie。

        Args:
            response: FastAPI 响应对象。
            token: JWT 字符串。
        """
        response.set_cookie(
            key=settings.session_cookie_name,
            value=token,
            httponly=True,
            samesite="lax",
            secure=settings.session_cookie_secure,
            path="/",
            max_age=settings.access_token_expire_minutes * 60,
            domain=settings.session_cookie_domain if settings.is_production else None,
        )

    def clear_session_cookie(self, response: Response) -> None:
        """清除会话 Cookie（登出）。

        Args:
            response: FastAPI 响应对象。
        """
        response.delete_cookie(
            key=settings.session_cookie_name,
            path="/",
            domain=settings.session_cookie_domain if settings.is_production else None,
        )

    def generate_token_for_user(self, user: User) -> str:
        """为用户生成 JWT Access Token。

        Args:
            user: 用户对象。

        Returns:
            JWT 字符串。
        """
        token_data = {
            "sub": str(user.id),
            "username": user.username,
            "role": user.role,
        }
        return create_access_token(token_data)

    async def get_user_from_token(self, token: str) -> User:
        """从 JWT token 中解析并获取用户对象。

        Args:
            token: JWT 字符串。

        Returns:
            用户对象。

        Raises:
            InvalidTokenException: token 无效或用户不存在。
        """
        try:
            payload = decode_access_token(token)
        except Exception as exc:
            logger.warning(f"Invalid token: {exc}")
            raise InvalidTokenException()

        user_id_str = payload.get("sub")
        if not user_id_str:
            raise InvalidTokenException()

        try:
            user_id = int(user_id_str)
        except (ValueError, TypeError):
            raise InvalidTokenException()

        user = await self.user_repo.get_by_id(user_id)
        if user is None or not user.is_active:
            raise InvalidTokenException(message="用户不存在或已被禁用")

        return user
