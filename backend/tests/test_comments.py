"""Comment flow tests.

Covers:
- Empty comment list for a post
- Guest comment creation
- Comment tree structure (two-level nesting)
- Comment status moderation flow (pending -> approved)
- Comment count on post updates when status changes
- Comment deletion by admin
- Disabled comments on a post
"""

from __future__ import annotations

from datetime import timedelta

import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.models import Comment, Post, User
from app.security import create_access_token


pytestmark = pytest.mark.asyncio


def _auth_headers(user: User, settings: Settings) -> dict[str, str]:
    """Build Authorization header for a test user."""
    token = create_access_token(
        data={"sub": str(user.id), "type": "access"},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )
    return {"Authorization": f"Bearer {token}"}


class TestCommentListing:
    """Public GET /api/posts/{slug}/comments tests."""

    async def test_empty_comments(self, client: AsyncClient, test_post: Post) -> None:
        """A post with no comments returns an empty tree."""
        response = await client.get(f"/api/posts/{test_post.slug}/comments")
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert body["items"] == []

    async def test_comment_tree_structure(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        test_post: Post,
    ) -> None:
        """Top-level comments with replies form a two-level tree."""
        parent = Comment(
            post_id=test_post.id,
            content="父评论",
            guest_name="访客甲",
            guest_email="guest1@example.com",
            status="approved",
            ip_hash="hash1",
        )
        db_session.add(parent)
        await db_session.flush()

        child = Comment(
            post_id=test_post.id,
            parent_id=parent.id,
            content="回复评论",
            guest_name="访客乙",
            guest_email="guest2@example.com",
            status="approved",
            ip_hash="hash2",
        )
        db_session.add(child)
        await db_session.commit()

        response = await client.get(f"/api/posts/{test_post.slug}/comments")
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        items = body["items"]
        assert len(items) == 1
        assert items[0]["content"] == "父评论"
        assert "replies" in items[0]
        assert len(items[0]["replies"]) == 1
        assert items[0]["replies"][0]["content"] == "回复评论"

    async def test_only_approved_shown(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        test_post: Post,
    ) -> None:
        """Pending comments are hidden from the public listing."""
        approved = Comment(
            post_id=test_post.id,
            content="已审核",
            guest_name="访客",
            guest_email="a@example.com",
            status="approved",
            ip_hash="hash_a",
        )
        pending = Comment(
            post_id=test_post.id,
            content="待审核",
            guest_name="访客",
            guest_email="b@example.com",
            status="pending",
            ip_hash="hash_b",
        )
        db_session.add_all([approved, pending])
        await db_session.commit()

        response = await client.get(f"/api/posts/{test_post.slug}/comments")
        items = response.json()["items"]
        assert len(items) == 1
        assert items[0]["content"] == "已审核"


class TestGuestCommentCreation:
    """Public POST /api/posts/{slug}/comments (guest mode)."""

    async def test_create_guest_comment(
        self,
        client: AsyncClient,
        test_post: Post,
    ) -> None:
        """A guest can submit a comment; it starts in pending status."""
        payload = {
            "guest_name": "评论访客",
            "guest_email": "commenter@example.com",
            "content": "这是一条访客评论。",
        }
        response = await client.post(
            f"/api/posts/{test_post.slug}/comments",
            json=payload,
        )
        assert response.status_code in (status.HTTP_200_OK, status.HTTP_201_CREATED)
        body = response.json()
        assert body["status"] == "pending"
        assert body["guest_name"] == "评论访客"

    async def test_guest_comment_missing_name(
        self,
        client: AsyncClient,
        test_post: Post,
    ) -> None:
        """A guest comment without a name fails validation."""
        payload = {
            "guest_email": "no-name@example.com",
            "content": "没有名字",
        }
        response = await client.post(
            f"/api/posts/{test_post.slug}/comments",
            json=payload,
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_comment_on_nonexistent_post(self, client: AsyncClient) -> None:
        """Commenting on a non-existent post returns 404."""
        payload = {
            "guest_name": "访客",
            "guest_email": "x@example.com",
            "content": "test",
        }
        response = await client.post("/api/posts/no-such-post/comments", json=payload)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    async def test_disabled_comments_rejected(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        test_admin_user: User,
        test_category: Category,
    ) -> None:
        """A post with allow_comments=False rejects new comments."""
        post = Post(
            title="关闭评论",
            slug="no-comments-post",
            content="body",
            status="published",
            category_id=test_category.id,
            author_id=test_admin_user.id,
            allow_comments=False,
        )
        db_session.add(post)
        await db_session.commit()

        payload = {
            "guest_name": "访客",
            "guest_email": "x@example.com",
            "content": "尝试评论",
        }
        response = await client.post(f"/api/posts/{post.slug}/comments", json=payload)
        assert response.status_code in (status.HTTP_400_BAD_REQUEST, status.HTTP_403_FORBIDDEN)
        body = response.json()
        assert body.get("success", True) is False


class TestAdminCommentManagement:
    """Admin comment moderation endpoints."""

    async def test_admin_list_comments(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        test_post: Post,
        test_admin_user: User,
        test_settings: Settings,
    ) -> None:
        """Admin can list all comments including pending ones."""
        db_session.add_all(
            [
                Comment(
                    post_id=test_post.id,
                    content="已审核1",
                    status="approved",
                    guest_name="a",
                    guest_email="a@a.com",
                    ip_hash="h1",
                ),
                Comment(
                    post_id=test_post.id,
                    content="待审核1",
                    status="pending",
                    guest_name="b",
                    guest_email="b@b.com",
                    ip_hash="h2",
                ),
            ]
        )
        await db_session.commit()

        headers = _auth_headers(test_admin_user, test_settings)
        response = await client.get("/api/admin/comments", headers=headers)
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert body["total"] >= 2

    async def test_approve_comment_increments_count(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        test_post: Post,
        test_admin_user: User,
        test_settings: Settings,
    ) -> None:
        """Approving a pending comment bumps the post.comment_count."""
        comment = Comment(
            post_id=test_post.id,
            content="待审核评论",
            status="pending",
            guest_name="c",
            guest_email="c@c.com",
            ip_hash="h_approve",
        )
        db_session.add(comment)
        await db_session.commit()
        await db_session.refresh(test_post)
        initial_count = test_post.comment_count

        headers = _auth_headers(test_admin_user, test_settings)
        response = await client.patch(
            f"/api/admin/comments/{comment.id}/status",
            json={"status": "approved"},
            headers=headers,
        )
        assert response.status_code == status.HTTP_200_OK
        await db_session.refresh(test_post)
        assert test_post.comment_count == initial_count + 1

    async def test_delete_comment(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        test_post: Post,
        test_admin_user: User,
        test_settings: Settings,
    ) -> None:
        """Admin can delete a comment."""
        comment = Comment(
            post_id=test_post.id,
            content="待删除",
            status="approved",
            guest_name="d",
            guest_email="d@d.com",
            ip_hash="h_delete",
        )
        db_session.add(comment)
        await db_session.commit()

        headers = _auth_headers(test_admin_user, test_settings)
        response = await client.delete(
            f"/api/admin/comments/{comment.id}",
            headers=headers,
        )
        assert response.status_code == status.HTTP_200_OK

        list_response = await client.get("/api/admin/comments", headers=headers)
        contents = [c["content"] for c in list_response.json()["items"]]
        assert "待删除" not in contents
