// src/app/page.tsx
"use client";
import { motion } from "framer-motion";
import ParticleBackground from "@/components/ui/ParticleBackground";
import DynamicAvatar from "@/components/home/DynamicAvatar";
import EnhancedCTA from "@/components/home/EnhancedCTA";
import StatsSection from "@/components/home/StatsSection";
import ActivityHeatmap from "@/components/home/ActivityHeatmap";
import RecentTimeline from "@/components/home/RecentTimeline";
import GlobalSearch from "@/components/home/GlobalSearch";
import ChangelogWidget from "@/components/home/ChangelogWidget";
import { useVisitorContext } from "@/hooks/useVisitorContext";
import { useRealTimeStats } from "@/hooks/useRealTimeStats";
import { useT } from "@/hooks/useT";
import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";

export default function HomePage() {
  const { tr } = useT();
  const visitor = useVisitorContext();
  const { stats, activity, timeline, loading } = useRealTimeStats();

  // 根据时间调整粒子背景色调
  const isNight = visitor.theme === "night";

  const articles = [
    { title: tr("2026年前端趋势：AI驱动开发"), date: "2026-08-01", tags: [tr("前端"), tr("AI")] },
    { title: tr("用 Rust 重写我的博客引擎"), date: "2026-07-28", tags: [tr("Rust"), tr("性能")] },
    { title: tr("我的 HomeLab 搭建全记录"), date: "2026-07-20", tags: [tr("HomeLab"), tr("运维")] },
  ];

  return (
    <div className={`relative min-h-screen ${isNight ? "dark" : ""}`}>
      <ParticleBackground />

      {/* ===== Hero Section ===== */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10 max-w-2xl"
        >
          {/* 动态头像 */}
          <DynamicAvatar timePeriod={visitor.timePeriod} />

          {/* 动态问候语 */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-5xl font-bold mb-3"
          >
            {visitor.greeting}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-500 dark:text-gray-400 text-base mb-2"
          >
            {visitor.subtitle}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-400 dark:text-gray-500 text-sm mb-8"
          >
            {tr("全栈开发者 / 开源爱好者 / AI研究生")}
            <br />
            {tr("在这里分享技术、思考与生活")}
          </motion.p>

          {/* 增强 CTA */}
          <EnhancedCTA />
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 text-gray-400"
        >
          ↓
        </motion.div>
      </section>

      {/* ===== 搜索入口 ===== */}
      <section className="max-w-5xl mx-auto px-4 -mt-12 relative z-10 mb-8">
        <div className="flex justify-center">
          <GlobalSearch />
        </div>
      </section>

      {/* ===== 实时统计（可点击） ===== */}
      <section className="max-w-5xl mx-auto px-4 mb-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <StatsSection stats={stats} />
        )}
      </section>

      {/* ===== 热力图 + 时间线 + Changelog ===== */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 左：热力图 */}
          <div className="lg:col-span-2">
            <ActivityHeatmap data={activity} />
          </div>
          {/* 右：时间线 + Changelog */}
          <div className="space-y-6">
            <RecentTimeline items={timeline} />
            <ChangelogWidget />
          </div>
        </div>
      </section>

      {/* ===== 最新文章 ===== */}
      <section className="max-w-4xl mx-auto px-4 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
            {tr("最新文章")}
          </h2>
          <Link href="/articles" className="text-sm text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
            {tr("查看全部")} <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-4">
          {articles.map((article, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href="/articles"
                className="block glass rounded-2xl p-5 hover:border-indigo-400/50 transition-all hover:-translate-y-0.5 group"
              >
                <h3 className="font-medium group-hover:text-indigo-500 transition-colors">
                  {article.title}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  {article.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      {tag}
                    </span>
                  ))}
                  <span className="text-xs text-gray-400 ml-auto">{article.date}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== Footer 社交链接 ===== */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>© 2026 kioyurt · Built with Next.js & ❤️</p>
        </div>
      </footer>
    </div>
  );
}