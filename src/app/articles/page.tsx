// src/app/articles/page.tsx

"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageCircle,
  Search,
} from "lucide-react";

import GlassCard from "@/components/ui/GlassCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { useT } from "@/hooks/useT";

import {
  getCategories,
  getPosts,
  type Category,
  type PostListItem,
} from "@/lib/api";

const PAGE_SIZE = 12;

function formatDate(value: string | null): string {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getCoverImage(post: PostListItem): string | null {
  return post.cover_image?.trim() || null;
}

export default function ArticlesPage() {
  const { tr } = useT();

  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<PostListItem[]>([]);

  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);

    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getPosts({
        page,
        pageSize: PAGE_SIZE,
        category: activeCategory || undefined,
        search: searchQuery.trim() || undefined,
      });

      setPosts(response.items);
      setTotalPages(response.total_pages);
      setTotal(response.total);
    } catch (err) {
      setPosts([]);
      setTotalPages(0);
      setTotal(0);

      setError(
        err instanceof Error
          ? err.message
          : "文章加载失败",
      );
    } finally {
      setLoading(false);
    }
  }, [activeCategory, page, searchQuery]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPosts();
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadPosts]);

  const changeCategory = (slug: string) => {
    setActiveCategory(slug);
    setPage(1);
  };

  const changeSearchQuery = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-24">
      <SectionTitle
        title={tr("文章")}
        subtitle={tr("记录技术探索与生活感悟")}
      />

      <div className="mb-10 space-y-5">
        <div className="relative max-w-xl mx-auto">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              changeSearchQuery(event.target.value)
            }
            placeholder={tr("搜索文章...")}
            className="w-full pl-10 pr-4 py-3 rounded-xl glass outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>

        <div className="flex gap-2 justify-center flex-wrap">
          <button
            type="button"
            onClick={() => changeCategory("")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === ""
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                : "glass hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
            }`}
          >
            {tr("全部")}
          </button>

          {categoriesLoading ? (
            <div className="flex gap-2">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="w-20 h-9 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse"
                />
              ))}
            </div>
          ) : (
            categories.map((category) => (
              <button
                type="button"
                key={category.id}
                onClick={() => changeCategory(category.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category.slug
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                    : "glass hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                }`}
              >
                {tr(category.name)}
              </button>
            ))
          )}
        </div>

        <div className="text-center text-xs text-gray-400">
          {total} {tr("篇文章")}
        </div>
      </div>

      {error ? (
        <GlassCard className="mb-8">
          <div className="py-10 text-center">
            <p className="text-red-500 mb-4">{error}</p>

            <button
              type="button"
              onClick={() => void loadPosts()}
              className="px-5 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
            >
              {tr("重新加载")}
            </button>
          </div>
        </GlassCard>
      ) : null}

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-[420px] rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          <motion.div
            layout
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {posts.map((post, index) => {
                const cover = getCoverImage(post);

                return (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{
                      opacity: 0,
                      scale: 0.96,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.96,
                    }}
                    transition={{
                      delay: Math.min(index * 0.04, 0.2),
                    }}
                  >
                    <Link
                      href={`/articles/${post.slug}`}
                      className="block h-full"
                    >
                      <GlassCard className="h-full overflow-hidden !p-0 group cursor-pointer">
                        <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                          {cover ? (
                            <img
                              src={cover}
                              alt={tr(post.title)}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                              <span className="text-4xl font-bold text-indigo-500/40">
                                {post.title.charAt(0)}
                              </span>
                            </div>
                          )}

                          <div className="absolute top-3 left-3 flex gap-2">
                            {post.category ? (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                                {tr(post.category.name)}
                              </span>
                            ) : null}

                            {post.is_pinned ? (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500 text-white">
                                {tr("置顶")}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="p-5">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-indigo-500 transition-colors">
                            {tr(post.title)}
                          </h3>

                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4 min-h-[60px]">
                            {post.excerpt
                              ? tr(post.excerpt)
                              : tr("暂无摘要")}
                          </p>

                          <div className="flex gap-2 flex-wrap mb-5 min-h-[24px]">
                            {post.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag.id}
                                className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                              >
                                #{tr(tag.name)}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {formatDate(post.published_at)}
                            </span>

                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Eye size={12} />
                                {post.view_count}
                              </span>

                              <span className="flex items-center gap-1">
                                <MessageCircle size={12} />
                                {post.comment_count}
                              </span>
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {posts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-4">🔍</p>
              <p>{tr("没有找到相关文章")}</p>
            </div>
          ) : null}

          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage((current) => Math.max(1, current - 1))
                }
                className="p-2 rounded-lg glass disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                aria-label={tr("上一页")}
              >
                <ChevronLeft size={18} />
              </button>

              <span className="text-sm text-gray-500">
                {page} / {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((current) =>
                    Math.min(totalPages, current + 1),
                  )
                }
                className="p-2 rounded-lg glass disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                aria-label={tr("下一页")}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}