"""Shared test fixtures for the yurthu backend test suite.

All tests use a file-based SQLite database (via aiosqlite) so they can run
without an external PostgreSQL instance.  The application factory is
configured with overridden settings, and each test gets a fresh database.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import Settings
from app.database import Base, get_db, init_engine
from app.main import create_app
from app.models import Category, Post, Tag, User


@pytest.fixture
def test_settings(tmp_path) -> Settings:
    """Return a Settings instance configured for test runs.

    Uses a file-based SQLite database in the pytest tmp_path so that
    all connections within a test see the same schema and data
    (in-memory SQLite creates a fresh database per connection).
    """
    db_path = tmp_path / "test.db"
    media_path = tmp_path / "media"
    media_path.mkdir(parents=True, exist_ok=True)
    return Settings(
        app_name="yurthu-test",
        app_env="test",
        debug=False,
        database_url=f"sqlite+aiosqlite:///{db_path}",
        secret_key="test-secret-key-not-for-production-use-only-for-testing",
        access_token_expire_minutes=30,
        github_client_id="test-client-id",
        github_client_secret="test-client-secret",
        github_admin_id=12345,
        frontend_url="http://test-frontend.local",
        media_root=str(media_path),
        media_url="/test-media/",
        cors_origins=["*"],
        session_cookie_name="access_token",
        session_cookie_secure=False,
    )


@pytest_asyncio.fixture
async def db_engine(test_settings: Settings):
    """Create a fresh async engine for a SQLite test database.

    Creates all tables using the test settings before yielding.
    """
    engine = create_async_engine(
        str(test_settings.database_url),
        echo=False,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Initialize the global engine so get_db() works even when called
    # outside the dependency-override path.
    init_engine(test_settings)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(db_engine) -> AsyncGenerator[AsyncSession, None]:
    """Provide an async database session for a single test.

    The session is scoped to one test and rolled back afterwards so that
    tests do not leak state into one another.
    """
    async_session = async_sessionmaker(
        bind=db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )
    async with async_session() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def test_app(
    db_session: AsyncSession,
    test_settings: Settings,
) -> FastAPI:
    """Build a FastAPI application with test database and settings.

    The get_db dependency is overridden to return the test session so
    that all route handlers use the same session as the test setup code.
    """

    async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app = create_app(settings=test_settings)
    app.dependency_overrides[get_db] = _override_get_db
    return app


@pytest_asyncio.fixture
async def client(test_app: FastAPI) -> AsyncGenerator[AsyncClient, None]:
    """Provide an async HTTP client bound to the test application."""
    transport = ASGITransport(app=test_app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def test_admin_user(db_session: AsyncSession) -> User:
    """Seed an admin user for protected endpoint tests."""
    user = User(
        github_id=12345,
        username="adminuser",
        email="admin@example.com",
        avatar_url="https://example.com/avatar.png",
        role="admin",
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def test_normal_user(db_session: AsyncSession) -> User:
    """Seed a normal (non-admin) user for role tests."""
    user = User(
        github_id=99999,
        username="normaluser",
        email="normal@example.com",
        avatar_url="https://example.com/normal.png",
        role="user",
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def test_category(db_session: AsyncSession) -> Category:
    """Seed a single category."""
    category = Category(
        name="测试分类",
        slug="test-category",
        description="用于测试的分类",
        sort_order=1,
    )
    db_session.add(category)
    await db_session.commit()
    await db_session.refresh(category)
    return category


@pytest_asyncio.fixture
async def test_tag(db_session: AsyncSession) -> Tag:
    """Seed a single tag."""
    tag = Tag(name="测试标签", slug="test-tag")
    db_session.add(tag)
    await db_session.commit()
    await db_session.refresh(tag)
    return tag


@pytest_asyncio.fixture
async def test_post(
    db_session: AsyncSession,
    test_admin_user: User,
    test_category: Category,
    test_tag: Tag,
) -> Post:
    """Seed a published post with one category and one tag."""
    post = Post(
        title="测试文章标题",
        slug="test-post-slug",
        content="# 这是测试文章\n\n正文内容。",
        excerpt="测试摘要",
        cover_image=None,
        status="published",
        category_id=test_category.id,
        author_id=test_admin_user.id,
        view_count=0,
        comment_count=0,
        is_pinned=False,
        allow_comments=True,
    )
    db_session.add(post)
    await db_session.flush()
    post.tags = [test_tag]
    await db_session.commit()
    await db_session.refresh(post)
    return post
