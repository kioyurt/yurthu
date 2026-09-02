// src/app/articles/[slug]/page.tsx

"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Clock,
  Eye,
  Share2,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useT } from "@/hooks/useT";
import {
  ApiException,
  getPostBySlug,
  type PostDetail,
} from "@/lib/api";

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
    month: "long",
    day: "numeric",
  });
}

function calculateReadingTime(content: string): number {
  const chineseChars = (
    content.match(/[\u4e00-\u9fff]/g) || []
  ).length;

  const latinWords = (
    content
      .replace(/[\u4e00-\u9fff]/g, " ")
      .match(/[A-Za-z0-9]+/g) || []
  ).length;

  const totalUnits = chineseChars + latinWords;

  return Math.max(1, Math.ceil(totalUnits / 400));
}

function ArticleLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
      <div className="h-5 w-32 rounded bg-gray-100 dark:bg-gray-800 animate-pulse mb-8" />
      <div className="h-12 w-full rounded bg-gray-100 dark:bg-gray-800 animate-pulse mb-4" />
      <div className="h-6 w-2/3 rounded bg-gray-100 dark:bg-gray-800 animate-pulse mb-10" />
      <div className="h-80 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse mb-10" />
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-5 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

function ArticleNotFound({
  message,
}: {
  message: string;
}) {
  const { tr } = useT();

  return (
    <div className="max-w-3xl mx-auto px-4 pt-32 pb-24 text-center">
      <div className="text-6xl mb-6">404</div>

      <h1 className="text-2xl font-bold mb-4">
        {tr("文章不存在")}
      </h1>

      <p className="text-gray-500 mb-8">
        {message}
      </p>

      <Link
        href="/articles"
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
      >
        <ArrowLeft size={16} />
        {tr("返回文章列表")}
      </Link>
    </div>
  );
}

export default function ArticleDetailPage() {
  const params = useParams<{ slug: string }>();
  const { tr } = useT();

  const slug = params?.slug || "";

  const [article, setArticle] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bookmarked, setBookmarked] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!slug) {
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);

    getPostBySlug(slug)
      .then((data) => {
        if (!cancelled) {
          setArticle(data);
        }
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }

        if (err instanceof ApiException && err.status === 404) {
          setError("找不到这篇文章");
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "文章加载失败",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const total =
        document.documentElement.scrollHeight -
        window.innerHeight;

      if (total <= 0) {
        setProgress(0);
        return;
      }

      setProgress(
        Math.min(
          100,
          Math.max(0, (window.scrollY / total) * 100),
        ),
      );
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    handleScroll();

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      );
    };
  }, []);

  const readingMinutes = useMemo(
    () =>
      article
        ? calculateReadingTime(article.content)
        : 0,
    [article],
  );

  if (loading) {
    return <ArticleLoading />;
  }

  if (!article) {
    return (
      <ArticleNotFound
        message={error || tr("文章不存在")}
      />
    );
  }

  const cover = article.cover_image?.trim();

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: article.title,
        text: article.excerpt || article.title,
        url,
      });
      return;
    }

    await navigator.clipboard.writeText(url);
  };

  return (
    <div className="min-h-screen">
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-gray-200 dark:bg-gray-800">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-150"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-500 transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          {tr("返回文章列表")}
        </Link>

        <motion.header
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >
          <div className="flex flex-wrap gap-2 mb-4">
            {article.category ? (
              <span className="px-3 py-1 rounded-full text-xs bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                {tr(article.category.name)}
              </span>
            ) : null}

            {article.is_pinned ? (
              <span className="px-3 py-1 rounded-full text-xs bg-indigo-500 text-white">
                {tr("置顶")}
              </span>
            ) : null}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            {tr(article.title)}
          </h1>

          {article.excerpt ? (
            <p className="text-gray-500 dark:text-gray-400 text-base leading-7 mb-6">
              {tr(article.excerpt)}
            </p>
          ) : null}

          <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(article.published_at)}
            </span>

            <span className="flex items-center gap-1">
              <Eye size={14} />
              {article.view_count}
            </span>

            <span className="flex items-center gap-1">
              <Clock size={14} />
              {readingMinutes} {tr("分钟")}
            </span>
          </div>
        </motion.header>

        {cover ? (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: 0.1,
            }}
            className="my-8 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800"
          >
            <img
              src={cover}
              alt={tr(article.title)}
              className="w-full max-h-[520px] object-cover"
            />
          </motion.div>
        ) : null}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.15,
          }}
          className="markdown-body prose prose-lg dark:prose-invert max-w-none"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
          >
            {tr(article.content)}
          </ReactMarkdown>
        </motion.div>

        {article.tags.length > 0 ? (
          <div className="flex gap-2 flex-wrap mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
            {article.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/articles?tag=${encodeURIComponent(tag.slug)}`}
                className="px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 hover:text-indigo-500 transition-colors"
              >
                #{tr(tag.name)}
              </Link>
            ))}
          </div>
        ) : null}

        <div className="flex items-center justify-center gap-4 mt-10 py-6">
          <button
            type="button"
            onClick={() => setBookmarked((value) => !value)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
              bookmarked
                ? "bg-amber-50 dark:bg-amber-500/10 text-amber-500"
                : "glass hover:bg-amber-50 dark:hover:bg-amber-500/10"
            }`}
          >
            <Bookmark
              size={18}
              className={
                bookmarked ? "fill-amber-500" : ""
              }
            />
            {bookmarked
              ? tr("已收藏")
              : tr("收藏")}
          </button>

          <button
            type="button"
            onClick={() => {
              void handleShare();
            }}
            className="flex items-center gap-2 px-6 py-3 glass hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
          >
            <Share2 size={18} />
            {tr("分享")}
          </button>
        </div>
      </div>
    </div>
  );
}