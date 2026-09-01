"""业务异常类与统一错误响应结构。

所有业务层异常均继承自 BusinessException，由全局异常处理器统一捕获，
返回格式一致的错误响应：
{
    "code": 40001,
    "message": "错误描述",
    "detail": {...}  # 可选，附加细节
}
"""

from typing import Any, Dict, Optional


class BusinessException(Exception):
    """业务异常基类。

    Attributes:
        code: 业务错误码（HTTP 状态码 * 100 + 细分码）
        message: 错误描述
        detail: 附加详细信息
        status_code: 对应的 HTTP 状态码
    """

    def __init__(
        self,
        code: int,
        message: str,
        detail: Optional[Dict[str, Any]] = None,
        status_code: int = 400,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.detail = detail or {}
        self.status_code = status_code


# ---- 认证相关异常 (401xx / 403xx) ----

class UnauthorizedException(BusinessException):
    """未认证异常（401）。"""

    def __init__(self, message: str = "未登录或登录已过期", detail: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(code=40101, message=message, detail=detail, status_code=401)


class InvalidTokenException(BusinessException):
    """Token 无效异常（401）。"""

    def __init__(self, message: str = "无效的访问令牌", detail: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(code=40102, message=message, detail=detail, status_code=401)


class ForbiddenException(BusinessException):
    """权限不足异常（403）。"""

    def __init__(self, message: str = "权限不足", detail: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(code=40301, message=message, detail=detail, status_code=403)


class AdminRequiredException(BusinessException):
    """需要管理员权限异常（403）。"""

    def __init__(self, message: str = "需要管理员权限", detail: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(code=40302, message=message, detail=detail, status_code=403)


# ---- 资源相关异常 (404xx) ----

class NotFoundException(BusinessException):
    """资源不存在异常（404）。"""

    def __init__(self, message: str = "资源不存在", detail: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(code=40401, message=message, detail=detail, status_code=404)


class UserNotFoundException(BusinessException):
    """用户不存在异常（404）。"""

    def __init__(self, message: str = "用户不存在", detail: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(code=40402, message=message, detail=detail, status_code=404)


class PostNotFoundException(BusinessException):
    """文章不存在异常（404）。"""

    def __init__(self, message: str = "文章不存在", detail: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(code=40403, message=message, detail=detail, status_code=404)


class CategoryNotFoundException(BusinessException):
    """分类不存在异常（404）。"""

    def __init__(self, message: str = "分类不存在", detail: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(code=40404, message=message, detail=detail, status_code=404)


class TagNotFoundException(BusinessException):
    """标签不存在异常（404）。"""

    def __init__(self, message: str = "标签不存在", detail: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(code=40405, message=message, detail=detail, status_code=404)


class CommentNotFoundException(BusinessException):
    """评论不存在异常（404）。"""

    def __init__(self, message: str = "评论不存在", detail: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(code=40406, message=message, detail=detail, status_code=404)


class MediaNotFoundException(BusinessException):
    """媒体文件不存在异常（404）。"""

    def __init__(self, message: str = "媒体文件不存在", detail: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(code=40407, message=message, detail=detail, status_code=404)


# ---- 冲突/重复异常 (409xx) ----

class ConflictException(BusinessException):
    """资源冲突异常（409）。"""

    def __init__(self, code: int = 40901, message: str = "资源冲突", detail: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(code=code, message=message, detail=detail, status_code=409)


class DuplicateSlugException(BusinessException):
    """Slug 重复异常（409）。"""

    def __init__(self, slug: str, message: Optional[str] = None) -> None:
        msg = message or f"标识 '{slug}' 已存在，请使用其他标识"
        super().__init__(code=40902, message=msg, detail={"slug": slug}, status_code=409)


class DuplicateNameException(BusinessException):
    """名称重复异常（409）。"""

    def __init__(self, name: str, resource: str = "资源") -> None:
        super().__init__(
            code=40903,
            message=f"{resource}名称 '{name}' 已存在",
            detail={"name": name, "resource": resource},
            status_code=409,
        )


# ---- 校验失败异常 (422xx) ----

class ValidationException(BusinessException):
    """参数校验失败异常（422）。"""

    def __init__(self, message: str = "参数校验失败", detail: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(code=42201, message=message, detail=detail, status_code=422)


class FileTooLargeException(BusinessException):
    """文件过大异常（413）。"""

    def __init__(self, max_size_mb: int = 10) -> None:
        super().__init__(
            code=41301,
            message=f"文件大小超过限制，最大支持 {max_size_mb}MB",
            detail={"max_size_mb": max_size_mb},
            status_code=413,
        )


class InvalidStateException(BusinessException):
    """OAuth state 校验失败异常（400）。"""

    def __init__(self, message: str = "无效的 state 参数，可能存在 CSRF 攻击") -> None:
        super().__init__(code=40001, message=message, status_code=400)


class CommentsDisabledException(BusinessException):
    """文章已关闭评论异常（403）。"""

    def __init__(self, message: str = "该文章已关闭评论") -> None:
        super().__init__(code=40303, message=message, status_code=403)
