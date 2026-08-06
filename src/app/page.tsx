// src/app/page.tsx
"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import TypingText from "@/components/ui/TypingText";
import GlassCard from "@/components/ui/GlassCard";
import ParticleBackground from "@/components/ui/ParticleBackground";
import {
  FileText, Camera, Music, Sparkles,
  ArrowRight, BookOpen, CodeXml
} from "lucide-react";
import { GithubIcon } from "@/components/ui/BrandIcons";

const stats = [
  { label: "文章", value: "128", icon: FileText },
  { label: "照片", value: "256", icon: Camera },
  { label: "音乐", value: "64", icon: Music },
  { label: "开源项目", value: "32", icon: GithubIcon },
];

const features = [
  {
    icon: Sparkles,
    title: "空间展示",
    desc: "3D 可视化个人数字空间",
    href: "/space",
  },
  {
    icon: FileText,
    title: "技术文章",
    desc: "深度技术分享与实践记录",
    href: "/articles",
  },
  {
    icon: GithubIcon,
    title: "开源项目",
    desc: "GitHub 上的开源贡献",
    href: "/projects",
  },
  {
    icon: BookOpen,
    title: "AI 助手",
    desc: "智能对话与知识检索",
    href: "/ai",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <ParticleBackground />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10"
        >
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto mb-6 flex items-center justify-center text-4xl glow"
          >
            ✦
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <TypingText
              texts={[
                "你好，我是 kioyurt 👋",
                "热爱代码与设计 ✨",
                "记录生活的每一刻 📸",
                "探索 AI 的边界 🤖",
              ]}
            />
          </h1>

          <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            全栈开发者 / 开源爱好者 / 摄影爱好者
            <br />
            在这里分享技术、思考与生活
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/articles"
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
            >
              开始阅读 →
            </Link>
            <Link
              href="/about"
              className="px-6 py-3 glass font-medium hover:bg-white/80 dark:hover:bg-white/10 transition-all"
            >
              关于我
            </Link>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 text-gray-400"
        >
          ↓ 向下滚动
        </motion.div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 -mt-20 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <GlassCard key={stat.label} delay={i * 0.1} className="text-center">
              <stat.icon className="mx-auto mb-2 text-indigo-500" size={24} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <GlassCard key={f.title} delay={i * 0.1}>
              <Link href={f.href} className="group block">
                <f.icon className="text-indigo-500 mb-4 group-hover:scale-110 transition-transform" size={28} />
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
                <span className="inline-flex items-center gap-1 text-indigo-500 text-sm mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  探索 <ArrowRight size={14} />
                </span>
              </Link>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Latest Articles Preview */}
      <section className="max-w-4xl mx-auto px-4 pb-24">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
          最新文章
        </h2>
        <div className="space-y-4">
          {[
            { title: "2026年前端趋势：AI驱动开发", date: "2026-08-01", tags: ["前端", "AI"] },
            { title: "用 Rust 重写我的博客引擎", date: "2026-07-28", tags: ["Rust", "性能"] },
            { title: "我的 HomeLab 搭建全记录", date: "2026-07-20", tags: ["HomeLab", "运维"] },
          ].map((article, i) => (
            <GlassCard key={i} delay={i * 0.1}>
              <Link href="/articles" className="flex items-center justify-between group">
                <div>
                  <h3 className="font-medium group-hover:text-indigo-500 transition-colors">
                    {article.title}
                  </h3>
                  <div className="flex gap-2 mt-2">
                    {article.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-sm text-gray-400 shrink-0 ml-4">{article.date}</span>
              </Link>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  );
}