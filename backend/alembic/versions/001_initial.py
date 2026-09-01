"""initial schema

Revision ID: 001_initial
Revises:
Create Date: 2026-09-01 00:00:00.000000

"""

from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create the initial database schema with all tables and indexes."""
    # Users table
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("github_id", sa.Integer(), nullable=False, unique=True),
        sa.Column("username", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("avatar_url", sa.String(length=512), nullable=True),
        sa.Column("bio", sa.String(length=500), nullable=True),
        sa.Column("role", sa.String(length=20), nullable=False, server_default="user"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
        sa.Index("ix_users_github_id", "github_id", unique=True),
        sa.Index("ix_users_role", "role"),
    )

    # Categories table
    op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(length=100), nullable=False, unique=True),
        sa.Column("slug", sa.String(length=100), nullable=False, unique=True),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Index("ix_categories_name", "name", unique=True),
        sa.Index("ix_categories_slug", "slug", unique=True),
        sa.Index("ix_categories_sort_order", "sort_order"),
    )

    # Tags table
    op.create_table(
        "tags",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(length=50), nullable=False, unique=True),
        sa.Column("slug", sa.String(length=50), nullable=False, unique=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Index("ix_tags_name", "name", unique=True),
        sa.Index("ix_tags_slug", "slug", unique=True),
    )

    # Posts table
    op.create_table(
        "posts",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False, unique=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("excerpt", sa.String(length=500), nullable=True),
        sa.Column("cover_image", sa.String(length=512), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="draft"),
        sa.Column("category_id", sa.Integer(), sa.ForeignKey("categories.id"), nullable=True),
        sa.Column("author_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("view_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("comment_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_pinned", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("allow_comments", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
        sa.Index("ix_posts_slug", "slug", unique=True),
        sa.Index("ix_posts_status_published", "status", "published_at"),
        sa.Index("ix_posts_author_id", "author_id"),
        sa.Index("ix_posts_category_id", "category_id"),
        sa.Index("ix_posts_is_pinned", "is_pinned"),
    )

    # Post tags association table
    op.create_table(
        "post_tags",
        sa.Column(
            "post_id",
            sa.Integer(),
            sa.ForeignKey("posts.id", ondelete="CASCADE"),
            nullable=False,
            primary_key=True,
        ),
        sa.Column(
            "tag_id",
            sa.Integer(),
            sa.ForeignKey("tags.id", ondelete="CASCADE"),
            nullable=False,
            primary_key=True,
        ),
        sa.Index("ix_post_tags_tag_id", "tag_id"),
    )

    # Comments table
    op.create_table(
        "comments",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("post_id", sa.Integer(), sa.ForeignKey("posts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("parent_id", sa.Integer(), sa.ForeignKey("comments.id", ondelete="CASCADE"), nullable=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("guest_name", sa.String(length=50), nullable=True),
        sa.Column("guest_email", sa.String(length=255), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="pending"),
        sa.Column("ip_hash", sa.String(length=64), nullable=True),
        sa.Column("user_agent", sa.String(length=512), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
        sa.Index("ix_comments_post_id", "post_id"),
        sa.Index("ix_comments_parent_id", "parent_id"),
        sa.Index("ix_comments_user_id", "user_id"),
        sa.Index("ix_comments_status", "status"),
        sa.Index("ix_comments_ip_hash", "ip_hash"),
    )

    # Media table
    op.create_table(
        "media",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("stored_filename", sa.String(length=255), nullable=False, unique=True),
        sa.Column("filepath", sa.String(length=512), nullable=False),
        sa.Column("url_path", sa.String(length=512), nullable=False),
        sa.Column("mime_type", sa.String(length=100), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("width", sa.Integer(), nullable=True),
        sa.Column("height", sa.Integer(), nullable=True),
        sa.Column("uploader_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Index("ix_media_stored_filename", "stored_filename", unique=True),
        sa.Index("ix_media_uploader_id", "uploader_id"),
        sa.Index("ix_media_mime_type", "mime_type"),
    )

    # Guestbook entries table
    op.create_table(
        "guestbook_entries",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("guest_name", sa.String(length=50), nullable=True),
        sa.Column("guest_email", sa.String(length=255), nullable=True),
        sa.Column("content", sa.String(length=1000), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="pending"),
        sa.Column("ip_hash", sa.String(length=64), nullable=True),
        sa.Column("user_agent", sa.String(length=512), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
        sa.Index("ix_guestbook_entries_user_id", "user_id"),
        sa.Index("ix_guestbook_entries_status", "status"),
        sa.Index("ix_guestbook_entries_ip_hash", "ip_hash"),
    )

    # Post views table
    op.create_table(
        "post_views",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("post_id", sa.Integer(), sa.ForeignKey("posts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("session_id", sa.String(length=64), nullable=True),
        sa.Column("ip_hash", sa.String(length=64), nullable=True),
        sa.Column("referer", sa.String(length=512), nullable=True),
        sa.Column("user_agent", sa.String(length=512), nullable=True),
        sa.Column(
            "viewed_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Index("ix_post_views_post_viewed", "post_id", "viewed_at"),
        sa.Index("ix_post_views_session_id", "session_id"),
        sa.Index("ix_post_views_ip_hash", "ip_hash"),
    )


def downgrade() -> None:
    """Drop all tables in reverse order to respect foreign key constraints."""
    op.drop_table("post_views")
    op.drop_table("guestbook_entries")
    op.drop_table("media")
    op.drop_table("comments")
    op.drop_table("post_tags")
    op.drop_table("posts")
    op.drop_table("tags")
    op.drop_table("categories")
    op.drop_table("users")
