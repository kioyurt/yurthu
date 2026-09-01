// src/components/home/ChangelogWidget.tsx
"use client";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { useT } from "@/hooks/useT";
import { Sparkles, ExternalLink } from "lucide-react";

interface ChangeLog {
  version: string;
  date: string;
  changes: string[];
}

const CHANGELOGS: ChangeLog[] = [
  {
    version: "v2.4.0",
    date: "2026-09-01",
    changes: ["新增全局搜索 (⌘K)", "首页动态问候语", "活跃度热力图"],
  },
  {
    version: "v2.3.2",
    date: "2026-08-25",
    changes: ["音乐播放器歌词滚动优化", "修复暗色模式闪烁"],
  },
  {
    version: "v2.3.0",
    date: "2026-08-18",
    changes: ["博客引擎迁移至 Rust", "性能提升 340%"],
  },
];

export default function ChangelogWidget() {
  const { tr } = useT();
  const latest = CHANGELOGS[0];

  return (
    <GlassCard className="!p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-amber-500" />
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
          {tr("最近更新")}
        </span>
        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-mono">
          {latest.version}
        </span>
      </div>

      <div className="space-y-1.5">
        {latest.changes.map((change, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400"
          >
            <span className="text-indigo-400 mt-0.5">•</span>
            {tr(change)}
          </motion.div>
        ))}
      </div>

      <a
        href="/changelog"
        className="inline-flex items-center gap-1 text-[11px] text-indigo-500 hover:text-indigo-600 mt-3 transition-colors"
      >
        {tr("查看完整更新日志")} <ExternalLink size={10} />
      </a>
    </GlassCard>
  );
}
