from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.post import Post
from app.schemas.post import PostCreate, PostOut

router = APIRouter()

@router.get("/", response_model=list[PostOut])
async def list_posts(skip: int = 0, limit: int = 20, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Post).order_by(Post.created_at.desc()).offset(skip).limit(limit))
    return result.scalars().all()

@router.post("/", response_model=PostOut, status_code=201)
async def create_post(payload: PostCreate, db: AsyncSession = Depends(get_db)):
    post = Post(**payload.model_dump())
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post

@router.get("/{slug}", response_model=PostOut)
async def get_post(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Post).where(Post.slug == slug))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(404, "Post not found")
    return post