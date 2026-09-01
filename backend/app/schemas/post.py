from pydantic import BaseModel
from datetime import datetime

class PostCreate(BaseModel):
    title: str
    slug: str
    content: str
    excerpt: str | None = None

class PostOut(BaseModel):
    id: int
    title: str
    slug: str
    content: str
    excerpt: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}