"""FastAPI 主应用入口。

包含：应用初始化、中间件、异常处理器、路由注册、静态文件服务。
"""

from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from .core.config import Settings, settings as global_settings
from .core.exceptions import BusinessException
from .core.logging import RequestIdMiddleware, get_logger, setup_logging
from .database import init_engine
from .routers import (
    admin_categories as admin_categories_router,
    admin_comments as admin_comments_router,
    admin_guestbook as admin_guestbook_router,
    admin_media as admin_media_router,
    admin_posts as admin_posts_router,
    admin_stats as admin_stats_router,
    auth as auth_router,
    categories as categories_router,
    comments as comments_router,
    guestbook as guestbook_router,
    posts as posts_router,
    stats as stats_router,
)


def _build_app(
    config: Settings,
) -> FastAPI:
    """根据给定的配置构建 FastAPI 应用实例。

    这是一个内部工厂方法，所有具体的配置、中间件、异常处理器和
    路由注册都在这个函数里完成。

    Args:
        config: 应用配置实例。

    Returns:
        配置好的 FastAPI 应用实例。
    """
    logger = get_logger(__name__)

    def _ensure_media_dir() -> None:
        media_path = Path(config.media_root)
        media_path.mkdir(parents=True, exist_ok=True)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        """应用生命周期管理。

        - 启动时：初始化日志、确保媒体目录存在、初始化数据库引擎
        - 关闭时：清理资源
        """
        setup_logging(level="DEBUG" if config.debug else "INFO")
        init_engine(config)
        _ensure_media_dir()
        logger.info(f"Application starting: {config.app_name} (env={config.app_env})")
        yield
        logger.info("Application shutting down")

    app = FastAPI(
        title=config.app_name,
        description="yurthu 博客 CMS 后端 API",
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/api/docs" if not config.is_production else None,
        redoc_url="/api/redoc" if not config.is_production else None,
        openapi_url="/api/openapi.json" if not config.is_production else None,
    )

    # ---- 中间件 ----
    app.add_middleware(RequestIdMiddleware)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Request-Id"],
    )

    # ---- 全局异常处理器 ----
    @app.exception_handler(BusinessException)
    async def business_exception_handler(
        request: Request, exc: BusinessException
    ) -> JSONResponse:
        """业务异常统一处理。"""
        request_id = getattr(request.state, "request_id", "")
        logger.warning(
            f"Business exception: code={exc.code}, message={exc.message}, "
            f"path={request.url.path}, request_id={request_id}"
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "code": exc.code,
                "message": exc.message,
                "detail": exc.detail,
                "request_id": request_id,
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        """参数校验异常统一处理。"""
        request_id = getattr(request.state, "request_id", "")
        errors = []
        for error in exc.errors():
            errors.append({
                "field": ".".join(str(loc) for loc in error.get("loc", [])),
                "message": error.get("msg", ""),
                "type": error.get("type", ""),
            })

        logger.warning(
            f"Validation error: path={request.url.path}, "
            f"errors={len(errors)}, request_id={request_id}"
        )

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "code": 42201,
                "message": "参数校验失败",
                "detail": {"errors": errors},
                "request_id": request_id,
            },
        )

    @app.exception_handler(status.HTTP_404_NOT_FOUND)
    async def not_found_handler(
        request: Request, exc: Any
    ) -> JSONResponse:
        """404 统一处理。"""
        request_id = getattr(request.state, "request_id", "")
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "success": False,
                "code": 40400,
                "message": "资源不存在",
                "detail": {"path": request.url.path},
                "request_id": request_id,
            },
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        """未捕获异常统一处理（兜底）。"""
        request_id = getattr(request.state, "request_id", "")
        logger.error(
            f"Unhandled exception: {type(exc).__name__}: {exc}, "
            f"path={request.url.path}, request_id={request_id}",
            exc_info=True,
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "code": 50000,
                "message": "服务器内部错误",
                "detail": {"request_id": request_id},
                "request_id": request_id,
            },
        )

    # ---- 路由注册 ----
    app.include_router(auth_router.router)
    app.include_router(posts_router.router)
    app.include_router(categories_router.router)
    app.include_router(comments_router.router)
    app.include_router(guestbook_router.router)
    app.include_router(stats_router.router)
    app.include_router(admin_posts_router.router)
    app.include_router(admin_categories_router.router)
    app.include_router(admin_comments_router.router)
    app.include_router(admin_media_router.router)
    app.include_router(admin_stats_router.router)
    app.include_router(admin_guestbook_router.router)

    # ---- 静态文件服务（媒体文件） ----
    media_path = Path(config.media_root).resolve()
    media_url = config.media_url.rstrip("/")
    try:
        app.mount(
            media_url,
            StaticFiles(directory=str(media_path)),
            name="media",
        )
    except RuntimeError:
        # 目录不存在时先创建再挂载
        media_path.mkdir(parents=True, exist_ok=True)
        app.mount(
            media_url,
            StaticFiles(directory=str(media_path)),
            name="media",
        )

    # ---- 健康检查 ----
    @app.get("/api/health", summary="健康检查", tags=["系统"])
    async def health_check() -> Dict[str, Any]:
        """服务健康检查接口。"""
        return {
            "success": True,
            "data": {
                "status": "ok",
                "app": config.app_name,
                "version": "1.0.0",
                "env": config.app_env,
            },
        }

    return app


def create_app(settings: Optional[Settings] = None) -> FastAPI:
    """创建并配置 FastAPI 应用实例。

    这是模块公开的工厂函数。测试时可以传入自定义配置
    （例如指向 SQLite 内存库），生产环境默认使用全局 settings。

    Args:
        settings: 可选的配置实例。不传则使用从环境变量加载的全局配置。

    Returns:
        配置好的 FastAPI 应用实例。
    """
    config = settings if settings is not None else global_settings
    return _build_app(config)


app = create_app()
