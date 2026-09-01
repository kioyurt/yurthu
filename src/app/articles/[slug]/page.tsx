// src/app/articles/[slug]/page.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Eye, Heart, ArrowLeft, Share2, Bookmark, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useT } from "@/hooks/useT";

const articleData = {
  title: "2026年前端开发趋势：AI 驱动的新范式",
  date: "2026-08-01",
  category: "前端",
  tags: ["React", "AI", "2026", "趋势"],
  views: 1234,
  likes: 89,
  readTime: "8 分钟",
  cover: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=500&fit=crop",
  content: `
## 引言

2026年的前端开发正在经历一场深刻的变革。AI不再只是一个辅助工具，而是深度融入了开发的每一个环节。

## AI 驱动的代码生成

现代 IDE 已经内置了强大的 AI 助手，它们能够：

- **理解上下文**：分析整个项目结构
- **生成组件**：根据描述自动创建 React 组件
- **自动重构**：识别性能瓶颈并给出优化建议
- **编写测试**：自动生成单元测试和 E2E 测试

## React Server Components 成为主流

\`\`\`tsx
// Server Component - 直接在服务端获取数据
async function ArticleList() {
  const articles = await db.query('SELECT * FROM articles');
  return (
    <ul>
      {articles.map(a => <li key={a.id}>{a.title}</li>)}
    </ul>
  );
}
\`\`\`

## 边缘计算与全栈融合

| 技术 | 用途 | 成熟度 |
|------|------|--------|
| Edge Functions | 低延迟 API | ⭐⭐⭐⭐⭐ |
| WebAssembly | 高性能计算 | ⭐⭐⭐⭐ |
| AI Inference | 端侧推理 | ⭐⭐⭐ |

## 总结

前端开发正在从「写界面」进化为「编排体验」。掌握 AI 工具、理解全栈架构、关注性能优化，将是 2026 年前端开发者的核心竞争力。

> "The best way to predict the future is to invent it." — Alan Kay
`,
};

export default function ArticleDetailPage() {
  const { tr } = useT();
  const [liked, setLiked] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress((window.scrollY / total) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Reading Progress */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-gray-200 dark:bg-gray-800">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        {/* Back */}
        <Link href="/articles" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-500 transition-colors mb-8">
          <ArrowLeft size={16} /> {tr("返回文章列表")}
        </Link>

        {/* Header */}
        <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-xs bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              {tr(articleData.category)}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-6">{tr(articleData.title)}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
            <span className="flex items-center gap-1"><Calendar size={14} /> {articleData.date}</span>
            <span className="flex items-center gap-1"><Eye size={14} /> {articleData.views}</span>
            <span className="flex items-center gap-1"><Clock size={14} /> {tr(articleData.readTime)}</span>
          </div>
        </motion.header>

        {/* Cover */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="my-8 rounded-2xl overflow-hidden"
        >
          <img src={articleData.cover} alt="" className="w-full h-64 md:h-80 object-cover" />
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="markdown-body prose prose-lg dark:prose-invert max-w-none"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {tr(articleData.content)}
          </ReactMarkdown>
        </motion.div>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
          {articleData.tags.map((tag) => (
            <span key={tag} className="px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              #{tr(tag)}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-6 mt-10 py-6">
          <button
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
              liked
                ? "bg-red-50 dark:bg-red-500/10 text-red-500"
                : "glass hover:bg-red-50 dark:hover:bg-red-500/10"
            }`}
          >
            <Heart size={18} className={liked ? "fill-red-500" : ""} />
            {liked ? tr("已点赞") : tr("点赞")} ({articleData.likes + (liked ? 1 : 0)})
          </button>
          <button className="flex items-center gap-2 px-6 py-3 glass hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all">
            <Share2 size={18} /> {tr("分享")}
          </button>
          <button className="flex items-center gap-2 px-6 py-3 glass hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all">
            <Bookmark size={18} /> {tr("收藏")}
          </button>
        </div>
      </div>
    </div>
  );
}
