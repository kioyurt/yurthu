from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import posts

app = FastAPI(title="yurthu API", version="0.1.0")

# CORS —— 让 Next.js 能调后端
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(posts.router, prefix="/api/posts", tags=["Posts"])

@app.get("/api/health")
async def health():
    return {"status": "ok", "message": "✨ Kirameku backend is alive!"}