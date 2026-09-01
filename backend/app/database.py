"""数据库配置：异步引擎、会话工厂、Base 模型基类。

引擎与会话工厂采用懒加载模式：首次访问时根据 settings 创建，
这样测试环境可以在导入阶段使用 SQLite 内存库而不需要 PostgreSQL 驱动。
"""

from collections.abc import AsyncGenerator
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from .core.config import Settings, settings


class Base(DeclarativeBase):
    """SQLAlchemy 声明式基类。

    所有模型都继承自此基类，方便 Alembic 统一收集 metadata。
    """

    pass


_engine: Optional[object] = None
_async_session_factory: Optional[async_sessionmaker] = None


def init_engine(config: Optional[Settings] = None) -> None:
    """初始化数据库引擎与会话工厂。

    可以在应用启动或测试设置时显式调用，传入自定义配置。
    如果不传参数，则使用全局 settings。

    Args:
        config: 配置实例。为 None 时使用全局 settings。
    """
    global _engine, _async_session_factory

    cfg = config if config is not None else settings
    pool_size = getattr(cfg, "database_pool_size", 10)
    max_overflow = getattr(cfg, "database_max_overflow", 20)

    extra = {}
    if "sqlite" not in str(cfg.database_url):
        extra["pool_pre_ping"] = True
        extra["pool_size"] = pool_size
        extra["max_overflow"] = max_overflow
        extra["pool_recycle"] = 3600

    _engine = create_async_engine(
        cfg.database_url,
        echo=cfg.debug,
        **extra,
    )
    _async_session_factory = async_sessionmaker(
        _engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
    )


def _get_engine():
    """获取引擎实例，懒加载初始化。

    Returns:
        异步引擎实例。
    """
    global _engine
    if _engine is None:
        init_engine()
    return _engine


def _get_session_factory() -> async_sessionmaker:
    """获取异步会话工厂，懒加载初始化。

    Returns:
        异步会话工厂。
    """
    global _async_session_factory
    if _async_session_factory is None:
        init_engine()
    return _async_session_factory


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI 依赖注入：获取数据库会话。

    每次请求创建一个新的会话，请求结束后自动关闭。

    Yields:
        AsyncSession: 异步数据库会话。
    """
    factory = _get_session_factory()
    async with factory() as session:
        try:
            yield session
        finally:
            await session.close()
