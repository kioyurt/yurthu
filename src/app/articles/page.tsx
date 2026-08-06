// src/app/articles/page.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { Search, Calendar, Eye, Heart, Tag } from "lucide-react";

const categories = ["全部", "前端", "后端", "AI", "生活", "摄影", "开源"];

const articles = [
  {
    id: 1,
    title: "2026年前端开发趋势：AI 驱动的新范式",
    summary: "探索 AI 如何改变前端开发流程，从代码生成到智能调试...",
    cover: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
    category: "前端",
    tags: ["React", "AI", "2026"],
    date: "2026-08-01",
    views: 1234,
    likes: 89,
    readTime: "8 min",
  },
  {
    id: 2,
    title: "从零搭建 Rust + WebAssembly 高性能服务",
    summary: "使用 Rust 编写核心逻辑，编译为 WASM 在浏览器中运行...",
    cover: "https://images.unsplash.com/photo-1515879218367-8466d910auj7?w=600&h=400&fit=crop",
    category: "后端",
    tags: ["Rust", "WASM", "性能"],
    date: "2026-07-28",
    views: 856,
    likes: 67,
    readTime: "12 min",
  },
  {
    id: 3,
    title: "我的 AI 绘画工作流分享",
    summary: "从 Stable Diffusion 到 ComfyUI，打造个人创作管线...",
    cover: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
    category: "AI",
    tags: ["Stable Diffusion", "创作"],
    date: "2026-07-20",
    views: 2341,
    likes: 156,
    readTime: "6 min",
  },
  {
    id: 4,
    title: "京都赏枫摄影手记",
    summary: "十一月的京都，红叶如火。用镜头记录这座古都的秋色...",
    cover: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&h=400&fit=crop",
    category: "摄影",
    tags: ["旅行", "日本", "风光"],
    date: "2026-07-15",
    views: 3102,
    likes: 234,
    readTime: "5 min",
  },
  {
    id: 5,
    title: "HomeLab 2026：我的家庭服务器集群",
    summary: "从单台 N100 到 3 节点 K8s 集群的进化之路...",
    cover: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop",
    category: "后端",
    tags: ["HomeLab", "K8s", "运维"],
    date: "2026-07-10",
    views: 1876,
    likes: 145,
    readTime: "15 min",
  },
  {
    id: 6,
    title: "开源一年：我的 GitHub 成长记录",
    summary: "从第一个 PR 到维护 3 个千星项目的心路历程...",
    cover: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&h=400&fit=crop",
    category: "开源",
    tags: ["GitHub", "开源", "成长"],
    date: "2026-07-05",
    views: 2890,
    likes: 312,
    readTime: "10 min",
  },
];

export default function ArticlesPage() {
  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = articles.filter((a) => {
    const matchCat = activeCategory === "全部" || a.category === activeCategory;
    const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-24">
      <SectionTitle title="文章" subtitle="记录技术探索与生活感悟" />

      {/* Search & Filter */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="搜索文章..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl glass outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
        <div className="flex gap-2 justify-center flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                  : "glass hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Article Grid */}
      <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((article, i) => (
            <motion.div
              key={article.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="h-full overflow-hidden !p-0 group cursor-pointer">
                {/* Cover */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.cover}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-indigo-500 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                    {article.summary}
                  </p>

                  {/* Tags */}
                  <div className="flex gap-2 flex-wrap mb-4">
                    {article.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {article.date}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {article.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={12} /> {article.likes}
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">🔍</p>
          <p>没有找到相关文章</p>
        </div>
      )}
    </div>
  );
}
