# yurthu-backend

Yurthu 博客系统后端，企业级 FastAPI + PostgreSQL 实现。

## 技术栈

- **Web 框架**: FastAPI 0.141 (async)
- **ORM**: SQLAlchemy 2.0 async (asyncpg)
- **数据库**: PostgreSQL 15+
- **数据库迁移**: Alembic
- **配置管理**: pydantic-settings
- **鉴权**: GitHub OAuth2 + JWT (HttpOnly Cookie)
- **测试**: pytest + aiosqlite (内存数据库)

## 目录结构

```
yurthu-backend/
├── alembic/                     # 数据库迁移
│   ├── versions/               # 迁移脚本
│   ├── env.py                 # Alembic 配置（async 引擎配置
│   └── script.py.mako        # 迁移模板
├── app/
│   ├── core/                 # 核心基础设施
│   │   ├── config.py       # 配置（pydantic-settings）
│   │   ├── exceptions.py  # 业务异常 + 全局异常处理器
│   │   ├── logging.py     # 结构化日志 + 请求 ID 中间件
│   │   └── pagination.py   # 统一分页封装
│   ├── models/               # SQLAlchemy 数据模型
│   ├── schemas/              # Pydantic 请求/响应模型
│   ├── repositories/       # 数据访问层（纯 CRUD）
│   ├── services/          # 业务逻辑层（事务边界）
│   ├── routers/           # 路由层（参数解析 + 调 service）
│   ├── utils/             # 工具函数
│   ├── database.py        # 数据库连接与会话
│   ├── dependencies.py    # FastAPI 依赖（get_db / get_current_user / require_admin 等）
│   ├── security.py        # JWT / 密码哈希 / 工具
│   └── main.py            # 应用工厂
├── tests/                  # pytest 测试
├── .env.example           # 环境变量模板
├── .gitignore
├── alembic.ini            # Alembic 配置
├── pytest.ini             # pytest 配置
├── requirements.txt        # Python 依赖
└── README.md
```

## 分层架构说明

| 层级 | 职责 | 禁止 |
|------|------|------|
| `routers/` | 参数解析、调用 service、返回响应 | 业务逻辑、直接写 SQL |
| `services/` | 业务逻辑、事务控制、调用 repository | 直接操作数据库 session、解析 HTTP 请求 |
| `repositories/` | 纯数据访问（CRUD / 查询） | 业务判断、事务管理 |
| `models/` | SQLAlchemy ORM 模型定义 | 业务逻辑 |
| `schemas/` | Pydantic 数据模型（Create/Update/Out | 数据库操作 |
| `core/` | 配置 / 异常 / 日志 / 分页 | 业务相关逻辑 |

## 数据模型

共 9 张表：

1. **users** - 用户表
2. **categories** - 文章分类
3. **tags** - 文章标签
4. **posts** - 文章
5. **post_tags** - 文章-标签关联（多对多）
6. **comments** - 评论（支持二级嵌套回复）
7. **media** - 媒体上传记录
8. **guestbook_entries** - 留言板
9. **post_views** - 文章访问记录

## 本地启动步骤

### 1. 创建数据库

```sql
CREATE DATABASE yurthu;
CREATE USER yurthu WITH PASSWORD 'yurthu';
GRANT ALL PRIVILEGES ON DATABASE yurthu TO yurthu;
```

### 2. 安装依赖

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env，填入真实的配置
```

### 4. 执行数据库迁移

```bash
alembic upgrade head
```

### 5. 启动服务

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

服务启动后访问：
- API 文档: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## GitHub OAuth 应用配置步骤

### 1. 创建 GitHub OAuth App

1. 登录 GitHub，进入 **Settings → Developer settings → OAuth Apps → New OAuth App
2. 填写信息：
   - **Application name**: Yurthu Blog
   - **Homepage URL**: `http://localhost:8000`
   - **Application description**: 本地开发环境
   - **Authorization callback URL**: `http://localhost:8000/api/auth/github/callback`
3. 点击 **Register application**
4. 复制 **Client ID** 和 **Client Secret** (生成一个新的 Client Secret）

### 2. 配置环境变量

在 `.env` 文件中填入：

```
GITHUB_CLIENT_ID=你的Client ID
GITHUB_CLIENT_SECRET=你的Client Secret
GITHUB_ADMIN_ID=你的GitHub用户ID（数字ID，不是用户名）
```

### 3. 获取 GitHub 用户 ID

```bash
curl https://api.github.com/users/你的用户名 | grep id
```

### 4. 测试登录

访问 `http://localhost:8000/api/auth/github/login`，会跳转到 GitHub 授权页面，授权后回调并设置登录 Cookie。

## 运行测试

测试使用内存 SQLite（aiosqlite），无需 PostgreSQL：

```bash
pip install pytest pytest-asyncio aiosqlite
pytest tests/ -v
```

运行指定模块：

```bash
pytest tests/test_auth.py -v
pytest tests/test_posts.py -v
pytest tests/test_comments.py -v
```

## API 接口清单

### 公共接口（无需登录）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/posts` | 文章列表（支持分页/分类/标签/搜索） |
| GET | `/api/posts/{slug}` | 文章详情 |
| GET | `/api/categories` | 分类列表 |
| GET | `/api/tags` | 标签列表 |
| GET | `/api/posts/{slug}/comments` | 评论树 |
| POST | `/api/posts/{slug}/comments` | 发表评论 |
| GET | `/api/guestbook` | 留言板列表 |
| POST | `/api/guestbook` | 发表留言 |
| GET | `/api/stats/overview` | 站点概览统计 |

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/auth/github/login` | GitHub 登录跳转 |
| GET | `/api/auth/github/callback` | GitHub 回调 |
| POST | `/api/auth/logout` | 退出登录 |
| GET | `/api/auth/me` | 当前用户信息 |

### 管理后台接口（需管理员权限）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/posts` | 文章列表（含草稿） |
| POST | `/api/admin/posts` | 创建文章 |
| GET | `/api/admin/posts/{id}` | 文章详情 |
| PUT | `/api/admin/posts/{id}` | 更新文章 |
| DELETE | `/api/admin/posts/{id}` | 删除文章 |
| GET | `/api/admin/categories` | 分类列表 |
| POST | `/api/admin/categories` | 创建分类 |
| PUT | `/api/admin/categories/{id}` | 更新分类 |
| DELETE | `/api/admin/categories/{id}` | 删除分类 |
| GET | `/api/admin/tags` | 标签列表 |
| POST | `/api/admin/tags` | 创建标签 |
| PUT | `/api/admin/tags/{id}` | 更新标签 |
| DELETE | `/api/admin/tags/{id}` | 删除标签 |
| GET | `/api/admin/comments` | 评论列表 |
| PATCH | `/api/admin/comments/{id}/status` | 评论审核 |
| DELETE | `/api/admin/comments/{id}` | 删除评论 |
| POST | `/api/admin/media/upload` | 上传媒体文件 |
| GET | `/api/admin/media` | 媒体列表 |
| DELETE | `/api/admin/media/{id}` | 删除媒体 |
| GET | `/api/admin/stats/dashboard` | 仪表盘统计 |
| GET | `/api/admin/stats/posts/{post_id}` | 单文章统计 |
| GET | `/api/admin/guestbook` | 留言列表 |
| PATCH | `/api/admin/guestbook/{id}/status` | 留言审核 |
| DELETE | `/api/admin/guestbook/{id}` | 删除留言 |

## 安全特性

- **OAuth2 state 参数**：防 CSRF 攻击
- **JWT HttpOnly Cookie**：防 XSS 攻击
- **SameSite=Lax**：防 CSRF
- **IP 哈希限速**：评论 / 留言防刷
- **角色权限控制**：admin / user 角色分离
- **统一异常处理**：一致的错误响应结构
- **请求 ID 追踪**：结构化日志 + 请求 ID

## 环境变量说明

详见 [.env.example 文件。

## 许可证

MIT
