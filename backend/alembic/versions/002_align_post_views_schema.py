"""align post_views schema with ORM model

Revision ID: 002_align_post_views_schema
Revises: 001_initial
Create Date: 2026-09-02 00:00:00.000000

"""

from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision: str = "002_align_post_views_schema"
down_revision: Union[str, None] = "001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    将 post_views 旧数据库结构对齐到当前 PostView ORM 模型。

    旧结构：
        viewed_at

    当前 ORM：
        created_at

    同时同步：
        - 主键 id: INTEGER -> BIGINT
        - referer: VARCHAR(512) -> VARCHAR(500)
        - user_agent: VARCHAR(512) -> VARCHAR(500)
        - 索引名称
    """

    # ------------------------------------------------------------------
    # 1. viewed_at -> created_at
    #
    # PostgreSQL rename 不会丢失数据，同时保留原来的 DEFAULT now()
    # 和 NOT NULL 属性。
    # ------------------------------------------------------------------
    op.alter_column(
        "post_views",
        "viewed_at",
        new_column_name="created_at",
        existing_type=sa.DateTime(timezone=True),
        existing_nullable=False,
        existing_server_default=sa.func.now(),
    )

    # ------------------------------------------------------------------
    # 2. 主键 INTEGER -> BIGINT
    #
    # ORM 中 PostView.id 使用 BigInteger。
    # ------------------------------------------------------------------
    op.alter_column(
        "post_views",
        "id",
        existing_type=sa.Integer(),
        type_=sa.BigInteger(),
        existing_nullable=False,
    )

    # ------------------------------------------------------------------
    # 3. referer 长度与 ORM 对齐
    # ------------------------------------------------------------------
    op.alter_column(
        "post_views",
        "referer",
        existing_type=sa.String(length=512),
        type_=sa.String(length=500),
        existing_nullable=True,
    )

    # ------------------------------------------------------------------
    # 4. user_agent 长度与 ORM 对齐
    # ------------------------------------------------------------------
    op.alter_column(
        "post_views",
        "user_agent",
        existing_type=sa.String(length=512),
        type_=sa.String(length=500),
        existing_nullable=True,
    )

    # ------------------------------------------------------------------
    # 5. 索引名称与当前 ORM 对齐
    #
    # 旧：
    #   ix_post_views_post_viewed(post_id, viewed_at)
    #
    # 新：
    #   idx_post_views_post_created(post_id, created_at)
    #
    # PostgreSQL 在列重命名时会自动更新索引内部列引用，
    # 所以这里主要是同步索引名称。
    # ------------------------------------------------------------------
    op.execute(
        sa.text(
            """
            ALTER INDEX IF EXISTS ix_post_views_post_viewed
            RENAME TO idx_post_views_post_created
            """
        )
    )


def downgrade() -> None:
    """恢复到 001_initial 的 post_views 结构。"""

    # 恢复索引名称
    op.execute(
        sa.text(
            """
            ALTER INDEX IF EXISTS idx_post_views_post_created
            RENAME TO ix_post_views_post_viewed
            """
        )
    )

    # 恢复 user_agent 长度
    op.alter_column(
        "post_views",
        "user_agent",
        existing_type=sa.String(length=500),
        type_=sa.String(length=512),
        existing_nullable=True,
    )

    # 恢复 referer 长度
    op.alter_column(
        "post_views",
        "referer",
        existing_type=sa.String(length=500),
        type_=sa.String(length=512),
        existing_nullable=True,
    )

    # BIGINT -> INTEGER
    op.alter_column(
        "post_views",
        "id",
        existing_type=sa.BigInteger(),
        type_=sa.Integer(),
        existing_nullable=False,
    )

    # created_at -> viewed_at
    op.alter_column(
        "post_views",
        "created_at",
        new_column_name="viewed_at",
        existing_type=sa.DateTime(timezone=True),
        existing_nullable=False,
        existing_server_default=sa.func.now(),
    )