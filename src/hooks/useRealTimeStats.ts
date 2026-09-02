// src/hooks/useRealTimeStats.ts

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getActivityStats,
  getPosts,
  getStatsOverview,
  type ActivityItem,
  type StatsOverview,
} from "@/lib/api";

export interface StatItem {
  label: string;
  value: number;
  icon: string;
  href: string;
}

export interface TimelineItem {
  id: string;
  type: "article" | "code" | "photo" | "music";
  title: string;
  date: string;
  href: string;
}

interface UseRealTimeStatsOptions {
  refreshInterval?: number;
}

interface UseRealTimeStatsResult {
  stats: StatItem[];
  activity: ActivityItem[];
  timeline: TimelineItem[];
  latestPosts: Awaited<ReturnType<typeof getPosts>>["items"];
  overview: StatsOverview | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useRealTimeStats(
  options: UseRealTimeStatsOptions = {},
): UseRealTimeStatsResult {
  const refreshInterval = options.refreshInterval ?? 60_000;

  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [latestPosts, setLatestPosts] = useState<
    Awaited<ReturnType<typeof getPosts>>["items"]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildStats = useCallback(
    (data: StatsOverview): StatItem[] => [
      {
        label: "文章",
        value: data.total_posts,
        icon: "FileText",
        href: "/articles",
      },
      {
        label: "媒体",
        value: data.total_media,
        icon: "Camera",
        href: "/gallery",
      },
      {
        label: "阅读",
        value: data.total_views,
        icon: "Eye",
        href: "/articles",
      },
      {
        label: "留言",
        value: data.total_guestbook,
        icon: "MessageCircle",
        href: "/guestbook",
      },
    ],
    [],
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);

    try {
      const [overviewData, activityData, latestPostData] =
        await Promise.all([
          getStatsOverview(),
          getActivityStats({ days: 112 }),
          getPosts({
            page: 1,
            pageSize: 5,
          }),
        ]);

      setOverview(overviewData);
      setActivity(activityData);
      setLatestPosts(latestPostData.items);

      const generatedTimeline: TimelineItem[] = latestPostData.items.map(
        (post) => ({
          id: String(post.id),
          type: "article",
          title: post.title,
          date: post.published_at || post.created_at,
          href: `/articles/${post.slug}`,
        }),
      );

      setTimeline(generatedTimeline);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "加载站点统计失败";

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void refresh();

    const timer = window.setInterval(() => {
      if (!cancelled) {
        void refresh();
      }
    }, refreshInterval);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [refresh, refreshInterval]);

  const stats = overview ? buildStats(overview) : [];

  return {
    stats,
    activity,
    timeline,
    latestPosts,
    overview,
    loading,
    refreshing,
    error,
    refresh,
  };
}