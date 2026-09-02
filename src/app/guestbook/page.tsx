// src/app/guestbook/page.tsx

"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Sparkles,
} from "lucide-react";

import SectionTitle from "@/components/ui/SectionTitle";
import GlassCard from "@/components/ui/GlassCard";
import { useT } from "@/hooks/useT";

import {
  createGuestbookEntry,
  getGuestbook,
  type GuestbookEntry,
} from "@/lib/api";

const PAGE_SIZE = 20;

function formatDate(value: string): string {
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

function getDisplayName(entry: GuestbookEntry): string {
  return (
    entry.user?.display_name ||
    entry.user?.username ||
    entry.guest_name ||
    "访客"
  );
}

function getAvatar(entry: GuestbookEntry): string | null {
  return entry.user?.avatar_url || null;
}

export default function GuestbookPage() {
  const { tr } = useT();

  const [messages, setMessages] = useState<GuestbookEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] =
    useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getGuestbook({
        page,
        pageSize: PAGE_SIZE,
      });

      setMessages(response.items);
      setTotalPages(response.total_pages);
      setTotal(response.total);
    } catch (err) {
      setMessages([]);
      setTotalPages(0);
      setTotal(0);

      setError(
        err instanceof Error
          ? err.message
          : "留言加载失败",
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const normalizedName =
      name.trim();

    const normalizedContent =
      content.trim();

    if (!normalizedName || !normalizedContent) {
      setSubmitMessage(
        tr("请填写昵称和留言内容"),
      );
      return;
    }

    if (normalizedName.length > 50) {
      setSubmitMessage(
        tr("昵称不能超过 50 个字符"),
      );
      return;
    }

    if (normalizedContent.length > 1000) {
      setSubmitMessage(
        tr("留言不能超过 1000 个字符"),
      );
      return;
    }

    setSubmitting(true);
    setSubmitMessage(null);

    try {
      await createGuestbookEntry({
        guest_name: normalizedName,
        guest_email: email.trim() || undefined,
        content: normalizedContent,
      });

      setName("");
      setEmail("");
      setContent("");

      setPage(1);

      setSubmitMessage(
        tr(
          "留言已提交，匿名留言需要审核后才会显示。",
        ),
      );

      await loadMessages();
    } catch (err) {
      setSubmitMessage(
        err instanceof Error
          ? err.message
          : "留言提交失败",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-24">
      <SectionTitle
        title={tr("留言板")}
        subtitle={tr("在这里留下你的足迹 💫")}
      />

      <GlassCard className="mb-10">
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              maxLength={50}
              placeholder={tr("你的昵称")}
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />

            <input
              type="email"
              maxLength={255}
              placeholder={tr("邮箱（可选）")}
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          <textarea
            maxLength={1000}
            placeholder={tr("写点什么吧...")}
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            rows={5}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
          />

          <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
            <div className="text-sm text-gray-400 flex items-center gap-1">
              <Sparkles size={14} />

              {tr("友善交流，互相尊重")}

              <span className="ml-2">
                {content.length}/1000
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send size={16} />

              {submitting
                ? tr("提交中...")
                : tr("发布")}
            </button>
          </div>

          {submitMessage ? (
            <div className="text-sm text-indigo-500">
              {submitMessage}
            </div>
          ) : null}
        </form>
      </GlassCard>

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-medium text-gray-500">
          {total} {tr("条留言")}
        </h2>
      </div>

      {error ? (
        <GlassCard className="mb-6">
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">
              {error}
            </p>

            <button
              type="button"
              onClick={() => void loadMessages()}
              className="px-5 py-2 rounded-xl bg-indigo-500 text-white"
            >
              {tr("重新加载")}
            </button>
          </div>
        </GlassCard>
      ) : null}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-32 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
              />
            ),
          )}
        </div>
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {messages.map((message, index) => {
                const avatar =
                  getAvatar(message);

                return (
                  <motion.div
                    key={message.id}
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: Math.min(
                        index * 0.04,
                        0.2,
                      ),
                    }}
                  >
                    <GlassCard>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center overflow-hidden shrink-0">
                          {avatar ? (
                            <img
                              src={avatar}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">
                              💬
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="font-medium text-sm">
                              {tr(
                                getDisplayName(
                                  message,
                                ),
                              )}
                            </span>

                            <span className="text-xs text-gray-400">
                              {formatDate(
                                message.created_at,
                              )}
                            </span>
                          </div>

                          <p className="text-sm leading-7 text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                            {tr(message.content)}
                          </p>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>

          {messages.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              {tr("还没有公开留言，来留下第一句话吧。")}
            </div>
          ) : null}

          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage((value) =>
                    Math.max(1, value - 1),
                  )
                }
                className="p-2 rounded-lg glass disabled:opacity-40"
                aria-label={tr("上一页")}
              >
                <ChevronLeft size={18} />
              </button>

              <span className="text-sm text-gray-500">
                {page} / {totalPages}
              </span>

              <button
                type="button"
                disabled={
                  page >= totalPages
                }
                onClick={() =>
                  setPage((value) =>
                    Math.min(
                      totalPages,
                      value + 1,
                    ),
                  )
                }
                className="p-2 rounded-lg glass disabled:opacity-40"
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