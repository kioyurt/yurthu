// src/hooks/useRealTimeStats.ts
import { useState, useEffect, useCallback } from "react";

interface StatItem {
  label: string;
  value: number;
  icon: string;
  href: string;
  trend?: number; // 相比上周的增长
}

interface ActivityData {
  date: string;
  count: number;
}

interface TimelineItem {
  id: string;
  type: "article" | "code" | "photo" | "music";
  title: string;
  date: string;
  href: string;
}

export function useRealTimeStats() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [activity, setActivity] = useState<ActivityData[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      // 🔧 实际项目中替换为真实 API
      // const res = await fetch("/api/stats");
      // const data = await res.json();

      // 模拟数据（替换为真实接口）
      await new Promise((r) => setTimeout(r, 600));

      setStats([
        { label: "文章", value: 128, icon: "FileText", href: "/articles", trend: 3 },
        { label: "照片", value: 256, icon: "Camera", href: "/gallery", trend: 12 },
        { label: "音乐", value: 64, icon: "Music", href: "/music", trend: 2 },
        { label: "开源项目", value: 32, icon: "Github", href: "/projects", trend: 1 },
      ]);

      // 生成过去 16 周的热力图数据
      const actData: ActivityData[] = [];
      const now = new Date();
      for (let i = 111; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        actData.push({
          date: d.toISOString().split("T")[0],
          count: Math.floor(Math.random() * 8),
        });
      }
      setActivity(actData);

      setTimeline([
        { id: "1", type: "article", title: "2026年前端趋势：AI驱动开发", date: "2026-08-01", href: "/articles/1" },
        { id: "2", type: "code", title: "blog-engine v2.3.0 发布", date: "2026-07-30", href: "/projects/blog-engine" },
        { id: "3", type: "photo", title: "周末骑行 · 城市夜景", date: "2026-07-28", href: "/gallery/ride" },
        { id: "4", type: "music", title: "新增 3 首歌曲到「深夜编程」歌单", date: "2026-07-27", href: "/music" },
        { id: "5", type: "article", title: "用 Rust 重写我的博客引擎", date: "2026-07-25", href: "/articles/2" },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, activity, timeline, loading };
}