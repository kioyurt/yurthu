from __future__ import annotations

import asyncio
import sys

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.database import (
    _get_engine,
)


async def main() -> int:
    """验证 Yurthu SQLAlchemy -> asyncpg -> PostgreSQL。"""

    print("=" * 72)
    print("Yurthu PostgreSQL Connection Test")
    print("=" * 72)

    engine = None

    try:
        print("[1/4] 获取 SQLAlchemy AsyncEngine...")

        engine = _get_engine()

        print("[2/4] 建立 PostgreSQL 连接...")

        async with engine.connect() as connection:

            print("[3/4] 执行 SQL...")

            result = await connection.execute(
                text(
                    """
                    SELECT
                        current_database() AS database_name,
                        current_user AS username,
                        version() AS postgres_version
                    """
                )
            )

            row = result.one()

            print()
            print(f"Database : {row.database_name}")
            print(f"User     : {row.username}")
            print(f"Version  : {row.postgres_version}")
            print()

            if row.database_name != "yurthu":
                print(
                    "ERROR: 当前数据库不是 yurthu。"
                )
                return 1

            if row.username != "yurthu":
                print(
                    "ERROR: 当前 PostgreSQL 用户不是 yurthu。"
                )
                return 1

            print(
                "[4/4] SQLAlchemy PostgreSQL connection: OK"
            )

            print("=" * 72)

            return 0

    except SQLAlchemyError as exc:
        print()
        print(
            "SQLAlchemy PostgreSQL connection: FAILED"
        )
        print()
        print(
            f"Error type: {type(exc).__name__}"
        )
        print(
            f"Error     : {exc}"
        )
        print()
        print("检查项目：")
        print("  1. PostgreSQL 容器是否运行")
        print("  2. DATABASE_URL 是否正确")
        print("  3. asyncpg 是否安装")
        print("  4. 5432 是否开放")
        print("=" * 72)

        return 1

    except Exception as exc:
        print()
        print("Unexpected error")
        print(
            f"Error type: {type(exc).__name__}"
        )
        print(
            f"Error     : {exc}"
        )
        print("=" * 72)

        return 1

    finally:
        if engine is not None:
            await engine.dispose()


if __name__ == "__main__":
    sys.exit(
        asyncio.run(main())
    )