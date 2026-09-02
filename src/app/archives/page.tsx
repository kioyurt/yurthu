// src/app/archives/page.tsx

"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

import SectionTitle from "@/components/ui/SectionTitle";
import GlassCard from "@/components/ui/GlassCard";
import { useT } from "@/hooks/useT";
import { getPosts, type PostListItem } from "@/lib/api";

interface ArchiveMonth {
  key: string;
  label: string;
  articles: PostListItem[];
}

interface ArchiveYear {
  year: number;
  months: ArchiveMonth[];
}

function getPublishedTime(post: PostListItem): number {
  return post.published_at
    ? new Date(post.published_at).getTime()
    : new Date(post.created_at).getTime();
}

function formatMonth(monthKey: string): string {
  const month = Number(monthKey.slice(5, 7));

  return `${month}月`;
}

function formatDay(value: string | null): string {
  if (!value) {
    return "--";
  }

  return value.slice(8, 10);
}

export default function ArchivesPage() {
  const { tr } = useT();

  const [articles, setArticles] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const firstPage = await getPosts({
          page: 1,
          pageSize: 100,
        });

        const allPosts = [...firstPage.items];

        for (
          let page = 2;
          page <= firstPage.total_pages;
          page += 1
        ) {
          const response = await getPosts({
            page,
            pageSize: 100,
          });

          allPosts.push(...response.items);
        }

        allPosts.sort(
          (a, b) =>
            getPublishedTime(b) -
            getPublishedTime(a),
        );

        if (!cancelled) {
          setArticles(allPosts);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "归档加载失败",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const archives = useMemo<ArchiveYear[]>(() => {
    const years = new Map<
      number,
      Map<string, PostListItem[]>
    >();

    for (const article of articles) {
      const date =
        article.published_at ||
        article.created_at;

      const year = Number(date.slice(0, 4));
      const monthKey = date.slice(0, 7);

      if (!years.has(year)) {
        years.set(
          year,
          new Map<string, PostListItem[]>(),
        );
      }

      const monthMap = years.get(year)!;

      if (!monthMap.has(monthKey)) {
        monthMap.set(
          monthKey,
          [],
        );
      }

      monthMap.get(monthKey)!.push(article);
    }

    return [...years.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([year, monthMap]) => ({
        year,
        months: [...monthMap.entries()]
          .sort((a, b) =>
            b[0].localeCompare(a[0]),
          )
          .map(([key, monthArticles]) => ({
            key,
            label: formatMonth(key),
            articles: monthArticles.sort(
              (a, b) =>
                getPublishedTime(b) -
                getPublishedTime(a),
            ),
          })),
      }));
  }, [articles]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24">
        <SectionTitle
          title={tr("归档")}
          subtitle={tr("正在加载文章归档")}
        />

        <div className="space-y-6">
          {Array.from({ length: 5 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-28 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
              />
            ),
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24">
        <SectionTitle
          title={tr("归档")}
          subtitle={tr("文章归档加载失败")}
        />

        <GlassCard>
          <div className="py-10 text-center">
            <p className="text-red-500">
              {error}
            </p>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-24">
      <SectionTitle
        title={tr("归档")}
        subtitle={tr(
          "共 {count} 篇文章，记录成长的每一步",
          {
            count: articles.length,
          },
        )}
      />

      {articles.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          {tr("暂无已发布文章")}
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500" />

          {archives.map((yearData) => (
            <div
              key={yearData.year}
              className="mb-12"
            >
              <motion.div
                initial={{
                  opacity: 0,
                  x: -20,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                }}
                className="relative pl-12 mb-6"
              >
                <div className="absolute left-2.5 top-1 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white dark:border-gray-900" />

                <h2 className="text-2xl font-bold text-indigo-500">
                  {yearData.year}
                </h2>
              </motion.div>

              {yearData.months.map(
                (monthData) => (
                  <div
                    key={monthData.key}
                    className="mb-8"
                  >
                    <motion.div
                      initial={{
                        opacity: 0,
                        x: -20,
                      }}
                      whileInView={{
                        opacity: 1,
                        x: 0,
                      }}
                      viewport={{
                        once: true,
                      }}
                      className="relative pl-12 mb-3"
                    >
                      <div className="absolute left-3 top-1.5 w-2.5 h-2.5 rounded-full bg-purple-400 border-2 border-white dark:border-gray-900" />

                      <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Calendar
                          size={14}
                          className="text-purple-400"
                        />

                        {tr(monthData.label)}

                        <span className="text-xs text-gray-400 font-normal">
                          (
                          {
                            monthData
                              .articles
                              .length
                          }{" "}
                          {tr("篇")})
                        </span>
                      </h3>
                    </motion.div>

                    <div className="pl-12 space-y-3">
                      {monthData.articles.map(
                        (article, index) => (
                          <motion.div
                            key={article.id}
                            initial={{
                              opacity: 0,
                              x: -10,
                            }}
                            whileInView={{
                              opacity: 1,
                              x: 0,
                            }}
                            viewport={{
                              once: true,
                            }}
                            transition={{
                              delay:
                                index *
                                0.04,
                            }}
                          >
                            <Link
                              href={`/articles/${article.slug}`}
                            >
                              <GlassCard className="!p-4 cursor-pointer group">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm group-hover:text-indigo-500 transition-colors truncate">
                                      {tr(
                                        article.title,
                                      )}
                                    </h4>

                                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                                      {article.tags
                                        .slice(
                                          0,
                                          4,
                                        )
                                        .map(
                                          (
                                            tag,
                                          ) => (
                                            <span
                                              key={
                                                tag.id
                                              }
                                              className="text-xs text-indigo-500/70"
                                            >
                                              #
                                              {tr(
                                                tag.name,
                                              )}
                                            </span>
                                          ),
                                        )}
                                    </div>
                                  </div>

                                  <span className="text-xs text-gray-400 font-mono shrink-0">
                                    {formatDay(
                                      article.published_at ||
                                        article.created_at,
                                    )}
                                  </span>
                                </div>
                              </GlassCard>
                            </Link>
                          </motion.div>
                        ),
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}