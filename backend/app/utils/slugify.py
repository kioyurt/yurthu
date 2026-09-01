"""Slug 生成工具。"""

import re
from typing import Optional

from slugify import slugify as python_slugify


def generate_slug(text: str, max_length: int = 200) -> str:
    """从文本生成 URL 友好的 slug。

    - 中文会被转成拼音（python-slugify 处理）
    - 所有字符转小写，空格转连字符
    - 去除特殊字符
    - 限制最大长度

    Args:
        text: 原始文本（标题等）。
        max_length: 最大长度，默认 200。

    Returns:
        生成的 slug 字符串。
    """
    slug = python_slugify(text)
    if len(slug) > max_length:
        slug = slug[:max_length].rstrip("-")
    return slug


def is_valid_slug(slug: str) -> bool:
    """检查 slug 是否符合 URL 友好格式。

    规则：只能包含小写字母、数字、连字符，长度 1-200。

    Args:
        slug: 待检查的 slug。

    Returns:
        是否合法。
    """
    if not slug or len(slug) > 200:
        return False
    pattern = r"^[a-z0-9]+(?:-[a-z0-9]+)*$"
    return bool(re.match(pattern, slug))
