"""Pydantic Schema 层：请求/响应数据模型。

所有模型在此统一导出，按模块分文件组织。
"""

from .common import PaginatedParams, PaginatedResponse, SuccessResponse
from .auth import UserOut, LoginResponse, UserCreate, UserUpdate
from .post import (
    PostCreate,
    PostUpdate,
    PostOut,
    PostListOut,
    PostDetailOut,
)
from .category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryOut,
    CategoryWithCountOut,
)
from .tag import TagCreate, TagUpdate, TagOut, TagWithCountOut
from .comment import (
    CommentCreate,
    CommentOut,
    CommentTreeOut,
    CommentStatusUpdate,
    GuestCommentCreate,
)
from .media import MediaOut, MediaUploadOut
from .guestbook import (
    GuestbookCreate,
    GuestbookOut,
    GuestbookEntryCreate,
)
from .stats import StatsOverview, DashboardStats, PostStatsItem

__all__ = [
    "PaginatedParams",
    "PaginatedResponse",
    "SuccessResponse",
    "UserOut",
    "LoginResponse",
    "UserCreate",
    "UserUpdate",
    "PostCreate",
    "PostUpdate",
    "PostOut",
    "PostListOut",
    "PostDetailOut",
    "CategoryCreate",
    "CategoryUpdate",
    "CategoryOut",
    "CategoryWithCountOut",
    "TagCreate",
    "TagUpdate",
    "TagOut",
    "TagWithCountOut",
    "CommentCreate",
    "CommentOut",
    "CommentTreeOut",
    "CommentStatusUpdate",
    "GuestCommentCreate",
    "MediaOut",
    "MediaUploadOut",
    "GuestbookCreate",
    "GuestbookOut",
    "GuestbookEntryCreate",
    "StatsOverview",
    "DashboardStats",
    "PostStatsItem",
]
