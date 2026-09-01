// src/app/archives/page.tsx
"use client";
import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import GlassCard from "@/components/ui/GlassCard";
import { useT } from "@/hooks/useT";
import { Calendar } from "lucide-react";

const archiveData = [
  {
    year: 2026,
    months: [
      {
        month: "8月",
        articles: [
          { title: "2026年前端开发趋势", date: "08-01", tags: ["前端", "AI"] },
        ],
      },
      {
        month: "7月",
        articles: [
          { title: "用 Rust 重写博客引擎", date: "07-28", tags: ["Rust"] },
          { title: "AI 绘画工作流", date: "07-20", tags: ["AI", "创作"] },
          { title: "京都赏枫摄影", date: "07-15", tags: ["摄影", "旅行"] },
          { title: "HomeLab 搭建记录", date: "07-10", tags: ["运维"] },
          { title: "开源一年记录", date: "07-05", tags: ["开源"] },
        ],
      },
      {
        month: "6月",
        articles: [
          { title: "Next.js 16 新特性解读", date: "06-25", tags: ["Next.js"] },
          { title: "Docker 多阶段构建优化", date: "06-18", tags: ["Docker", "运维"] },
          { title: "我的阅读清单", date: "06-10", tags: ["读书"] },
        ],
      },
      {
        month: "5月",
        articles: [
          { title: "PostgreSQL 性能调优", date: "05-22", tags: ["数据库"] },
          { title: "CSS 动画技巧合集", date: "05-15", tags: ["CSS", "前端"] },
        ],
      },
    ],
  },
  {
    year: 2025,
    months: [
      {
        month: "12月",
        articles: [
          { title: "2025 年终总结", date: "12-31", tags: ["总结"] },
          { title: "年度最佳工具推荐", date: "12-20", tags: ["工具"] },
        ],
      },
      {
        month: "10月",
        articles: [
          { title: "从零学习 Kubernetes", date: "10-15", tags: ["K8s", "运维"] },
          { title: "TypeScript 高级类型体操", date: "10-08", tags: ["TypeScript"] },
        ],
      },
    ],
  },
];

export default function ArchivesPage() {
  const { tr } = useT();
  const totalArticles = archiveData.reduce(
    (sum, year) => sum + year.months.reduce((s, m) => s + m.articles.length, 0),
    0
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-24">
      <SectionTitle title={tr("归档")} subtitle={tr("共 {count} 篇文章，记录成长的每一步", { count: totalArticles })} />

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500" />

        {archiveData.map((yearData) => (
          <div key={yearData.year} className="mb-12">
            {/* Year */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative pl-12 mb-6"
            >
              <div className="absolute left-2.5 top-1 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white dark:border-gray-900" />
              <h2 className="text-2xl font-bold text-indigo-500">{yearData.year}</h2>
            </motion.div>

            {yearData.months.map((monthData) => (
              <div key={monthData.month} className="mb-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="relative pl-12 mb-3"
                >
                  <div className="absolute left-3 top-1.5 w-2.5 h-2.5 rounded-full bg-purple-400 border-2 border-white dark:border-gray-900" />
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Calendar size={14} className="text-purple-400" />
                    {tr(monthData.month)}
                    <span className="text-xs text-gray-400 font-normal">
                      ({monthData.articles.length} {tr("篇")})
                    </span>
                  </h3>
                </motion.div>

                <div className="pl-12 space-y-3">
                  {monthData.articles.map((article, i) => (
                    <motion.div
                      key={article.title}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <GlassCard className="!p-4 cursor-pointer group">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm group-hover:text-indigo-500 transition-colors truncate">
                              {tr(article.title)}
                            </h4>
                            <div className="flex gap-1.5 mt-1.5">
                              {article.tags.map((tag) => (
                                <span key={tag} className="text-xs text-indigo-500/70">
                                  #{tr(tag)}
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-gray-400 font-mono shrink-0 ml-3">
                            {article.date}
                          </span>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}