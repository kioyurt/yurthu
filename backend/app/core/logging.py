"""日志配置：结构化日志 + 请求 ID 中间件。

统一使用 JSON 格式日志，包含请求 ID、时间、级别等字段，
便于 ELK / Loki 等日志系统采集分析。
"""

import json
import logging
import sys
import uuid
from datetime import datetime, timezone
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp


class JsonFormatter(logging.Formatter):
    """JSON 格式日志格式化器。

    将日志记录格式化为 JSON，包含时间、级别、logger、消息等字段。
    """

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        # 附加上下文信息（请求 ID 等）
        if hasattr(record, "request_id"):
            log_entry["request_id"] = record.request_id
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_entry, ensure_ascii=False)


def setup_logging(level: str = "INFO") -> None:
    """初始化全局日志配置。

    Args:
        level: 日志级别，默认 INFO。
    """
    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # 清除已有 handler，避免重复输出
    root_logger.handlers.clear()

    # 控制台输出 handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(JsonFormatter())
    root_logger.addHandler(console_handler)

    # 降低第三方库日志级别，避免噪音
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """获取命名日志器。

    Args:
        name: 日志器名称，建议传 __name__。

    Returns:
        配置好的 Logger 实例。
    """
    return logging.getLogger(name)


class RequestIdMiddleware(BaseHTTPMiddleware):
    """请求 ID 中间件。

    为每个请求生成唯一的 request_id，注入到请求对象和日志中，
    便于追踪一次请求的完整链路。

    响应头会携带 X-Request-Id。
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = request.headers.get("X-Request-Id") or str(uuid.uuid4())
        request.state.request_id = request_id

        # 在响应头中返回 request_id
        response = await call_next(request)
        response.headers["X-Request-Id"] = request_id
        return response
