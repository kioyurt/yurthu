"""安全工具：JWT 编码/解码、密码哈希、IP 哈希等。"""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from .core.config import settings

# 密码哈希上下文（预留，当前系统用 GitHub OAuth 不存密码）
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None,
    token_type: str = "access",
) -> str:
    """创建 JWT Access Token。

    Args:
        data: 要编码到 token 中的数据（如 sub, username, role）。
        expires_delta: 过期时间增量，为 None 时使用配置中的默认值。
        token_type: token 类型标识，默认为 "access"。

    Returns:
        编码后的 JWT 字符串。
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.access_token_expire_minutes
        )
    to_encode.update({"exp": expire, "type": token_type})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> Dict[str, Any]:
    """解码并校验 JWT Access Token。

    验证 token 类型必须为 "access"。

    Args:
        token: JWT 字符串。

    Returns:
        解码后的 payload 字典。

    Raises:
        JWTError: token 无效、过期或签名错误。
        ValueError: token 类型不是 access。
    """
    payload = jwt.decode(
        token,
        settings.secret_key,
        algorithms=[settings.algorithm],
    )
    if payload.get("type") != "access":
        raise ValueError("Invalid token type")
    return payload


def hash_password(password: str) -> str:
    """哈希明文密码。

    Args:
        password: 明文密码。

    Returns:
        bcrypt 哈希后的字符串。
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码是否匹配。

    Args:
        plain_password: 明文密码。
        hashed_password: 哈希后的密码。

    Returns:
        是否匹配。
    """
    return pwd_context.verify(plain_password, hashed_password)


def generate_state_token() -> str:
    """生成 OAuth state 参数（防 CSRF）。

    Returns:
        32 字节的 URL 安全随机字符串。
    """
    return secrets.token_urlsafe(32)


def hash_ip(ip_address: str) -> str:
    """对 IP 地址进行 SHA256 哈希（用于反垃圾，不存明文）。

    Args:
        ip_address: IP 地址字符串。

    Returns:
        64 字符的十六进制哈希字符串。
    """
    return hashlib.sha256(ip_address.encode("utf-8")).hexdigest()


def generate_session_id() -> str:
    """生成会话 ID（用于访问计数去重）。

    Returns:
        32 字节的 URL 安全随机字符串。
    """
    return secrets.token_urlsafe(32)
