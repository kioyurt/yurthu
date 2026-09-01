"""文章-标签多对多关联表。"""

from sqlalchemy import Column, ForeignKey, Index, Integer, Table

from ..database import Base

post_tags = Table(
    "post_tags",
    Base.metadata,
    Column(
        "post_id",
        Integer,
        ForeignKey("posts.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
        comment="文章 ID",
    ),
    Column(
        "tag_id",
        Integer,
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
        comment="标签 ID",
    ),
    Index("ix_post_tags_tag_id", "tag_id"),
    comment="文章-标签多对多关联表",
)
