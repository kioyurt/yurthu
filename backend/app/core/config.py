"""应用配置（pydantic-settings）。

从环境变量或 .env 文件加载配置，支持类型校验和默认值。
"""

from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """全局配置类。

    所有配置项均可通过环境变量覆盖，变量名与字段名一致（不区分大小写）。
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ---- 应用基础 ----
    app_name: str = Field(default="yurthu-cms", description="应用名称")
    app_env: str = Field(default="dev", description="运行环境: dev / prod")
    debug: bool = Field(default=False, description="是否开启调试模式")

    # ---- 数据库 ----
    database_url: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/yurthu_dev",
        description="异步数据库连接串",
    )
    database_url_sync: str = Field(
        default="postgresql+psycopg2://postgres:postgres@localhost:5432/yurthu_dev",
        description="同步数据库连接串（供 Alembic 使用）",
    )

    # ---- JWT 安全 ----
    secret_key: str = Field(
        default="change-me-to-a-random-secret-key-please-change-in-production",
        description="JWT 签名密钥，生产环境必须修改",
    )
    algorithm: str = Field(default="HS256", description="JWT 签名算法")
    access_token_expire_minutes: int = Field(
        default=1440, description="Access Token 有效期（分钟），默认 24 小时"
    )

    # ---- GitHub OAuth2 ----
    github_client_id: str = Field(default="", description="GitHub OAuth Client ID")
    github_client_secret: str = Field(default="", description="GitHub OAuth Client Secret")
    github_redirect_uri: str = Field(
        default="http://localhost:8000/api/auth/github/callback",
        description="GitHub OAuth 回调地址",
    )
    github_admin_id: int = Field(
        default=0, description="博主 GitHub 数字 ID（白名单，授予 admin 角色）"
    )

    # ---- Session Cookie ----
    session_cookie_name: str = Field(
        default="access_token", description="会话 Cookie 名称"
    )
    session_cookie_domain: str = Field(
        default="localhost", description="Cookie 作用域"
    )
    session_cookie_secure: bool = Field(
        default=False, description="Cookie 是否仅 HTTPS 传输（生产环境设为 true）"
    )

    # ---- 前端 ----
    frontend_url: str = Field(
        default="http://localhost:3000", description="前端地址，登录回调后跳转"
    )

    # ---- 媒体存储 ----
    media_root: str = Field(default="./media", description="媒体文件本地存储根目录")
    media_url: str = Field(default="/media/", description="媒体文件访问 URL 前缀")
    max_upload_size: int = Field(
        default=10 * 1024 * 1024, description="最大上传文件大小（字节），默认 10MB"
    )

    # ---- CORS ----
    cors_origins: List[str] = Field(
        default_factory=lambda: ["http://localhost:3000", "http://localhost:8000"],
        description="允许的跨域源列表",
    )

    @property
    def is_production(self) -> bool:
        """是否生产环境。"""
        return self.app_env.lower() == "prod"


settings = Settings()
