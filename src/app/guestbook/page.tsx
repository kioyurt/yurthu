// src/app/guestbook/page.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import GlassCard from "@/components/ui/GlassCard";
import { useT } from "@/hooks/useT";
import { Send, Heart, Reply, Sparkles } from "lucide-react";

const initialMessages = [
  {
    id: 1,
    name: "Alice",
    avatar: "🦊",
    content: "博客做得好漂亮！UI 设计太棒了 ✨",
    date: "2026-08-05",
    likes: 12,
    replies: [
      { id: 101, name: "博主", avatar: "✦", content: "谢谢！花了很久调的哈哈", date: "2026-08-05" },
    ],
  },
  {
    id: 2,
    name: "Bob",
    avatar: "🐱",
    content: "请问这个博客用什么技术栈搭建的？想学习一下",
    date: "2026-08-03",
    likes: 8,
    replies: [],
  },
  {
    id: 3,
    name: "Charlie",
    avatar: "🌸",
    content: "从友链过来的，文章质量很高，已收藏！",
    date: "2026-08-01",
    likes: 15,
    replies: [],
  },
];

export default function GuestbookPage() {
  const { tr } = useT();
  const [messages, setMessages] = useState(initialMessages);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [likedIds, setLikedIds] = useState<number[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    
    const newMsg = {
      id: Date.now(),
      name,
      avatar: "😊",
      content,
      date: new Date().toISOString().split("T")[0],
      likes: 0,
      replies: [],
    };
    setMessages([newMsg, ...messages]);
    setName("");
    setContent("");
  };

  const handleLike = (id: number) => {
    if (likedIds.includes(id)) return;
    setLikedIds([...likedIds, id]);
    setMessages(messages.map((m) => (m.id === id ? { ...m, likes: m.likes + 1 } : m)));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-24">
      <SectionTitle title={tr("留言板")} subtitle={tr("在这里留下你的足迹 💫")} />

      {/* Submit Form */}
      <GlassCard className="mb-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder={tr("你的昵称")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>
          <textarea
            placeholder={tr("写点什么吧...")}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <Sparkles size={14} /> {tr("友善交流，互相尊重")}
            </span>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Send size={16} /> {tr("发布")}
            </button>
          </div>
        </form>
      </GlassCard>

      {/* Messages */}
      <AnimatePresence>
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-xl shrink-0">
                    {msg.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{msg.name}</span>
                      <span className="text-xs text-gray-400">{msg.date}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{tr(msg.content)}</p>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-3">
                      <button
                        onClick={() => handleLike(msg.id)}
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          likedIds.includes(msg.id)
                            ? "text-red-500"
                            : "text-gray-400 hover:text-red-500"
                        }`}
                      >
                        <Heart size={14} className={likedIds.includes(msg.id) ? "fill-red-500" : ""} />
                        {msg.likes}
                      </button>
                      <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-500 transition-colors">
                        <Reply size={14} /> {tr("回复")}
                      </button>
                    </div>

                    {/* Replies */}
                    {msg.replies.length > 0 && (
                      <div className="mt-3 pl-4 border-l-2 border-indigo-200 dark:border-indigo-800 space-y-2">
                        {msg.replies.map((reply) => (
                          <div key={reply.id} className="text-sm">
                            <span className="font-medium text-indigo-500">{reply.avatar} {tr(reply.name)}：</span>
                            <span className="text-gray-600 dark:text-gray-300">{tr(reply.content)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
