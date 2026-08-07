// src/app/video/page.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import GlassCard from "@/components/ui/GlassCard";
import { Play, Clock, Eye, ThumbsUp, X, ExternalLink } from "lucide-react";

/* ────────────────────────────────────────────
   平台配置
   ──────────────────────────────────────────── */
const platforms = [
  {
    name: "抖音",
    url: "https://www.douyin.com/user/self?from_tab_name=main",
    color: "hover:bg-[#fe2c55] hover:text-white hover:border-[#fe2c55]",
    label: "Douyin",
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@breakgam-hd7tt",
    color: "hover:bg-[#ff0000] hover:text-white hover:border-[#ff0000]",
    label: "YouTube",
  },
  {
    name: "Bilibili",
    url: "https://space.bilibili.com/247027161?spm_id_from=333.1007.0.0",
    color: "hover:bg-[#00a1d6] hover:text-white hover:border-[#00a1d6]",
    label: "B站",
  },
] as const;

type PlatformName = (typeof platforms)[number]["name"];

/* ────────────────────────────────────────────
   数据 & 分类
   ──────────────────────────────────────────── */
const categories = ["全部", "技术分享", "Vlog", "教程", "音乐"];

interface Video {
  id: number;
  title: string;
  thumbnail: string;
  category: string;
  duration: string;
  views: number;
  likes: number;
  date: string;
  platform?: PlatformName;       // ✅ 新增：标记该视频首发平台
  externalUrl?: string;          // ✅ 新增：可选的直链
}

const videos: Video[] = [
  {
    id: 1,
    title: "用 Next.js 16 搭建博客全流程",
    thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=640&h=360&fit=crop",
    category: "教程",
    duration: "25:30",
    views: 12500,
    likes: 890,
    date: "2026-07-20",
    platform: "YouTube",
    externalUrl: "https://www.youtube.com/@breakgam-hd7tt",
  },
  {
    id: 2,
    title: "我的 HomeLab 之旅 | 2026 Edition",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=640&h=360&fit=crop",
    category: "Vlog",
    duration: "18:45",
    views: 8900,
    likes: 650,
    date: "2026-07-10",
    platform: "Bilibili",
    externalUrl: "https://space.bilibili.com/247027161",
  },
  {
    id: 3,
    title: "React Server Components 深度解析",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=640&h=360&fit=crop",
    category: "技术分享",
    duration: "32:15",
    views: 15600,
    likes: 1200,
    date: "2026-06-28",
    platform: "YouTube",
    externalUrl: "https://www.youtube.com/@breakgam-hd7tt",
  },
  {
    id: 4,
    title: "Lo-Fi 编程音乐 | 2小时专注",
    thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=640&h=360&fit=crop",
    category: "音乐",
    duration: "2:00:00",
    views: 45000,
    likes: 3200,
    date: "2026-06-15",
    platform: "Bilibili",
    externalUrl: "https://space.bilibili.com/247027161",
  },
  {
    id: 5,
    title: "Docker 从入门到实战",
    thumbnail: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=640&h=360&fit=crop",
    category: "教程",
    duration: "42:00",
    views: 23000,
    likes: 1800,
    date: "2026-05-20",
    platform: "抖音",
    externalUrl: "https://www.douyin.com/user/self?from_tab_name=main",
  },
  {
    id: 6,
    title: "周末骑行 Vlog | 环湖之旅",
    thumbnail: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=640&h=360&fit=crop",
    category: "Vlog",
    duration: "12:30",
    views: 5600,
    likes: 420,
    date: "2026-05-08",
    platform: "抖音",
    externalUrl: "https://www.douyin.com/user/self?from_tab_name=main",
  },
];

/* ────────────────────────────────────────────
   平台颜色映射（用于卡片徽章）
   ──────────────────────────────────────────── */
const platformBadgeColor: Record<string, string> = {
  "抖音": "bg-[#fe2c55]/10 text-[#fe2c55]",
  YouTube: "bg-[#ff0000]/10 text-[#ff0000]",
  Bilibili: "bg-[#00a1d6]/10 text-[#00a1d6]",
};

/* ────────────────────────────────────────────
   页面组件
   ──────────────────────────────────────────── */
export default function VideoPage() {
  const [activeCategory, setActiveCategory] = useState("全部");
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);

  const filtered =
    activeCategory === "全部"
      ? videos
      : videos.filter((v) => v.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 py-24">
      <SectionTitle title="视频" subtitle="用影像记录技术与生活 🎬" />

      {/* ✅ 新增：平台链接栏 */}
      <div className="flex justify-center gap-3 flex-wrap mb-10">
        {platforms.map((p) => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium
              border border-gray-200 dark:border-gray-700
              glass transition-all duration-300
              ${p.color}
            `}
          >
            {p.label}
            <ExternalLink size={14} />
          </a>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 justify-center flex-wrap mb-10">
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

      {/* Video Grid */}
      <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((video, i) => {
            // ✅ 如果有外链，点击直接跳转；否则打开模态播放器
            const Wrapper = video.externalUrl ? "a" : "div";
            const wrapperProps = video.externalUrl
              ? {
                  href: video.externalUrl,
                  target: "_blank" as const,
                  rel: "noopener noreferrer",
                }
              : {
                  onClick: () => setPlayingVideo(video),
                };

            return (
              <motion.div
                key={video.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className={`group ${!video.externalUrl ? "cursor-pointer" : ""}`}
              >
                
                <Wrapper {...wrapperProps}>
                  <GlassCard className="!p-0 overflow-hidden h-full">
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl"
                        >
                          {video.externalUrl ? (
                            <ExternalLink size={22} className="text-indigo-600" />
                          ) : (
                            <Play size={24} className="text-indigo-600 ml-1" />
                          )}
                        </motion.div>
                      </div>
                      {/* Duration badge */}
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-xs font-mono">
                        {video.duration}
                      </span>
                      {/* ✅ 平台徽章 */}
                      {video.platform && (
                        <span
                          className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm ${
                            platformBadgeColor[video.platform] ?? "bg-gray-500/20 text-gray-300"
                          }`}
                        >
                          {video.platform}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-medium text-sm line-clamp-2 group-hover:text-indigo-500 transition-colors">
                        {video.title}
                      </h3>
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                        <span>{video.category}</span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye size={12} /> {(video.views / 1000).toFixed(1)}k
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp size={12} /> {video.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </Wrapper>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Video Player Modal（仅对无外链的视频生效） */}
      <AnimatePresence>
        {playingVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => setPlayingVideo(null)}
          >
            <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold">{playingVideo.title}</h3>
                <button
                  onClick={() => setPlayingVideo(null)}
                  className="text-white/70 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Play size={48} className="mx-auto mb-4 text-indigo-500" />
                  <p>视频播放器区域</p>
                  <p className="text-sm mt-2">
                    （集成 ReactPlayer / YouTube / Bilibili 嵌入）
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 mt-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Eye size={14} /> {playingVideo.views} 次观看
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp size={14} /> {playingVideo.likes}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {playingVideo.date}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}