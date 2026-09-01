"""Article (Post) CRUD tests.

Covers:
- Public listing endpoint with filters
- Public detail endpoint with slug lookup
- View count increment on detail view
- Admin create / update / delete flows
- Slug uniqueness enforcement
- Search filter
"""

from __future__ import annotations

from datetime import timedelta

import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.models import Category, Post, Tag, User
from app.security import create_access_token


pytestmark = pytest.mark.asyncio


def _auth_headers(user: User, settings: Settings) -> dict[str, str]:
    """Build Authorization header for a test user."""
    token = create_access_token(
        data={"sub": str(user.id), "type": "access"},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )
    return {"Authorization": f"Bearer {token}"}


class TestPublicPostListing:
    """Public GET /api/posts tests."""

    async def test_list_empty(self, client: AsyncClient) -> None:
        """When no posts exist, the list endpoint returns an empty payload."""
        response = await client.get("/api/posts")
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert body["items"] == []
        assert body["total"] == 0

    async def test_list_published_only(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        test_admin_user: User,
        test_category: Category,
    ) -> None:
        """Only published posts are returned to the public listing."""
        published = Post(
            title="已发布文章",
            slug="published-post",
            content="content",
            status="published",
            category_id=test_category.id,
            author_id=test_admin_user.id,
        )
        draft = Post(
            title="草稿文章",
            slug="draft-post",
            content="content",
            status="draft",
            category_id=test_category.id,
            author_id=test_admin_user.id,
        )
        db_session.add_all([published, draft])
        await db_session.commit()

        response = await client.get("/api/posts")
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert body["total"] == 1
        assert body["items"][0]["title"] == "已发布文章"

    async def test_list_with_category_filter(
        self,
        client: AsyncClient,
        test_post: Post,
        test_category: Category,
    ) -> None:
        """Filtering by category slug returns only posts in that category."""
        response = await client.get(f"/api/posts?category={test_category.slug}")
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert body["total"] >= 1

    async def test_list_with_tag_filter(
        self,
        client: AsyncClient,
        test_post: Post,
        test_tag: Tag,
    ) -> None:
        """Filtering by tag slug returns only posts with that tag."""
        response = await client.get(f"/api/posts?tag={test_tag.slug}")
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert body["total"] >= 1

    async def test_list_with_search(
        self,
        client: AsyncClient,
        test_post: Post,
    ) -> None:
        """Search keyword matches title / content / excerpt."""
        response = await client.get("/api/posts?search=测试文章")
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert body["total"] >= 1

    async def test_list_pagination(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        test_admin_user: User,
        test_category: Category,
    ) -> None:
        """Pagination metadata is returned correctly."""
        for i in range(5):
            db_session.add(
                Post(
                    title=f"分页测试文章{i}",
                    slug=f"pagination-post-{i}",
                    content="body",
                    status="published",
                    category_id=test_category.id,
                    author_id=test_admin_user.id,
                )
            )
        await db_session.commit()

        response = await client.get("/api/posts?page=1&page_size=2")
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert len(body["items"]) == 2
        assert body["page"] == 1
        assert body["page_size"] == 2
        assert body["total"] == 5
        assert body["total_pages"] == 3


class TestPublicPostDetail:
    """Public GET /api/posts/{slug} tests."""

    async def test_detail_by_slug(self, client: AsyncClient, test_post: Post) -> None:
        """A published post is accessible by its slug."""
        response = await client.get(f"/api/posts/{test_post.slug}")
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert body["title"] == test_post.title
        assert body["slug"] == test_post.slug

    async def test_detail_not_found(self, client: AsyncClient) -> None:
        """A non-existent slug returns 404 with consistent error structure."""
        response = await client.get("/api/posts/does-not-exist-slug")
        assert response.status_code == status.HTTP_404_NOT_FOUND
        body = response.json()
        assert body["success"] is False
        assert "message" in body

    async def test_view_count_incremented(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        test_post: Post,
    ) -> None:
        """Viewing a post increments the cached view_count."""
        initial = test_post.view_count
        await client.get(f"/api/posts/{test_post.slug}")
        await db_session.refresh(test_post)
        assert test_post.view_count == initial + 1

    async def test_draft_not_public(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        test_admin_user: User,
        test_category: Category,
    ) -> None:
        """A draft post is not visible through the public detail endpoint."""
        post = Post(
            title="未发布",
            slug="unpublished-draft",
            content="secret",
            status="draft",
            category_id=test_category.id,
            author_id=test_admin_user.id,
        )
        db_session.add(post)
        await db_session.commit()

        response = await client.get("/api/posts/unpublished-draft")
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestAdminPostCRUD:
    """Admin post CRUD endpoint tests."""

    async def test_create_post(
        self,
        client: AsyncClient,
        test_admin_user: User,
        test_category: Category,
        test_tag: Tag,
        test_settings: Settings,
    ) -> None:
        """Admin can create a new post via POST /api/admin/posts."""
        headers = _auth_headers(test_admin_user, test_settings)
        payload = {
            "title": "新文章",
            "slug": "brand-new-post",
            "content": "# 新文章正文\n\n内容。",
            "status": "published",
            "category_id": test_category.id,
            "tag_ids": [test_tag.id],
        }
        response = await client.post("/api/admin/posts", json=payload, headers=headers)
        assert response.status_code in (status.HTTP_200_OK, status.HTTP_201_CREATED)
        body = response.json()
        assert body["title"] == "新文章"
        assert body["slug"] == "brand-new-post"

    async def test_create_duplicate_slug_fails(
        self,
        client: AsyncClient,
        test_post: Post,
        test_admin_user: User,
        test_category: Category,
        test_settings: Settings,
    ) -> None:
        """Creating a post with an existing slug returns a 409 conflict."""
        headers = _auth_headers(test_admin_user, test_settings)
        payload = {
            "title": "重复slug",
            "slug": test_post.slug,
            "content": "body",
            "status": "draft",
            "category_id": test_category.id,
            "tag_ids": [],
        }
        response = await client.post("/api/admin/posts", json=payload, headers=headers)
        assert response.status_code == status.HTTP_409_CONFLICT
        body = response.json()
        assert body["success"] is False

    async def test_update_post(
        self,
        client: AsyncClient,
        test_post: Post,
        test_admin_user: User,
        test_settings: Settings,
    ) -> None:
        """Admin can update a post's title via PUT."""
        headers = _auth_headers(test_admin_user, test_settings)
        payload = {
            "title": "更新后的标题",
            "content": test_post.content,
            "status": test_post.status,
            "tag_ids": [],
        }
        response = await client.put(
            f"/api/admin/posts/{test_post.id}",
            json=payload,
            headers=headers,
        )
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert body["title"] == "更新后的标题"

    async def test_delete_post(
        self,
        client: AsyncClient,
        test_post: Post,
        test_admin_user: User,
        test_settings: Settings,
    ) -> None:
        """Admin can delete a post; afterwards it returns 404."""
        headers = _auth_headers(test_admin_user, test_settings)
        response = await client.delete(
            f"/api/admin/posts/{test_post.id}",
            headers=headers,
        )
        assert response.status_code == status.HTTP_200_OK

        detail = await client.get(f"/api/posts/{test_post.slug}")
        assert detail.status_code == status.HTTP_404_NOT_FOUND

    async def test_admin_list_includes_drafts(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        test_admin_user: User,
        test_category: Category,
        test_settings: Settings,
    ) -> None:
        """The admin listing endpoint shows both draft and published posts."""
        db_session.add_all(
            [
                Post(
                    title="已发布A",
                    slug="admin-list-pub",
                    content="body",
                    status="published",
                    category_id=test_category.id,
                    author_id=test_admin_user.id,
                ),
                Post(
                    title="草稿A",
                    slug="admin-list-draft",
                    content="body",
                    status="draft",
                    category_id=test_category.id,
                    author_id=test_admin_user.id,
                ),
            ]
        )
        await db_session.commit()

        headers = _auth_headers(test_admin_user, test_settings)
        response = await client.get("/api/admin/posts", headers=headers)
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert body["total"] >= 2
        statuses = {item["status"] for item in body["items"]}
        assert "draft" in statuses
        assert "published" in statuses
