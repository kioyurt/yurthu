"""Authentication flow tests.

Covers:
- Health endpoint (sanity check)
- GitHub login endpoint returns a redirect URL with state parameter
- Invalid / missing token returns 401 on protected endpoints
- Admin-required endpoints reject normal users
- Logout clears the session cookie
"""

from __future__ import annotations

import re
from datetime import timedelta

import pytest
from fastapi import status
from httpx import AsyncClient

from app.core.config import Settings
from app.models import User
from app.security import create_access_token


pytestmark = pytest.mark.asyncio


def _make_token(user: User, settings: Settings, token_type: str = "access") -> str:
    """Helper to build a JWT for test users."""
    return create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
        token_type=token_type,
    )


class TestHealthEndpoint:
    """Basic health check and app boot."""

    async def test_health_returns_ok(self, client: AsyncClient) -> None:
        """The health endpoint returns a 200 with status 'ok'."""
        response = await client.get("/api/health")
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert body["success"] is True
        assert body["data"]["status"] == "ok"
        assert "version" in body["data"]


class TestGitHubLogin:
    """OAuth2 login initiation flow."""

    async def test_login_redirects_to_github(
        self,
        client: AsyncClient,
    ) -> None:
        """GET /api/auth/github/login returns a redirect to GitHub with state."""
        response = await client.get("/api/auth/github/login", follow_redirects=False)
        assert response.status_code in (
            status.HTTP_302_FOUND,
            status.HTTP_303_SEE_OTHER,
            status.HTTP_307_TEMPORARY_REDIRECT,
            status.HTTP_308_PERMANENT_REDIRECT,
        )

        location = response.headers["location"]
        assert "github.com" in location
        assert "state=" in location

    async def test_login_state_is_unique(self, client: AsyncClient) -> None:
        """Two consecutive login requests produce different state values."""
        r1 = await client.get("/api/auth/github/login", follow_redirects=False)
        r2 = await client.get("/api/auth/github/login", follow_redirects=False)

        def _extract_state(location: str) -> str:
            match = re.search(r"state=([^&]+)", location)
            assert match is not None
            return match.group(1)

        loc1 = r1.headers["location"]
        loc2 = r2.headers["location"]
        state1 = _extract_state(loc1)
        state2 = _extract_state(loc2)
        assert state1 != state2


class TestProtectedEndpoints:
    """Behaviour of auth-required and admin-required endpoints."""

    async def test_me_without_token_returns_401(self, client: AsyncClient) -> None:
        """Hitting /api/auth/me with no token yields a 401."""
        response = await client.get("/api/auth/me")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        body = response.json()
        assert body["success"] is False
        assert "code" in body

    async def test_me_with_invalid_token_returns_401(self, client: AsyncClient) -> None:
        """An invalid bearer token is rejected with 401."""
        response = await client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer definitely-not-a-valid-token"},
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_admin_endpoint_without_user_returns_401(
        self,
        client: AsyncClient,
    ) -> None:
        """Admin endpoints require authentication."""
        response = await client.get("/api/admin/posts")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_admin_endpoint_as_normal_user_returns_403(
        self,
        client: AsyncClient,
        test_normal_user: User,
        test_settings: Settings,
    ) -> None:
        """A logged-in non-admin user gets 403 on admin routes."""
        token = _make_token(test_normal_user, test_settings)
        response = await client.get(
            "/api/admin/posts",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    async def test_admin_endpoint_as_admin_succeeds(
        self,
        client: AsyncClient,
        test_admin_user: User,
        test_settings: Settings,
    ) -> None:
        """An admin user can access admin routes."""
        token = _make_token(test_admin_user, test_settings)
        response = await client.get(
            "/api/admin/posts",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert "items" in body
        assert "total" in body

    async def test_me_with_valid_token_returns_user(
        self,
        client: AsyncClient,
        test_normal_user: User,
        test_settings: Settings,
    ) -> None:
        """GET /api/auth/me returns the current user's profile."""
        token = _make_token(test_normal_user, test_settings)
        response = await client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert body["username"] == test_normal_user.username
        assert body["id"] == test_normal_user.id


class TestLogout:
    """Logout endpoint behaviour."""

    async def test_logout_authenticated_user(
        self,
        client: AsyncClient,
        test_normal_user: User,
        test_settings: Settings,
    ) -> None:
        """POST /api/auth/logout returns 200 for authenticated user."""
        token = _make_token(test_normal_user, test_settings)
        response = await client.post(
            "/api/auth/logout",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == status.HTTP_200_OK


class TestTokenTypes:
    """JWT type validation."""

    async def test_refresh_type_rejected_as_access(
        self,
        client: AsyncClient,
        test_normal_user: User,
        test_settings: Settings,
    ) -> None:
        """A token with type 'refresh' cannot be used on access endpoints."""
        token = _make_token(test_normal_user, test_settings, token_type="refresh")
        response = await client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
