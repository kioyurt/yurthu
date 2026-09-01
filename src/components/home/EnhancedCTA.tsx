// src/components/home/EnhancedCTA.tsx
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen, User, Mail, Rss, FolderOpen, MessageCircle,
} from "lucide-react";
import { useT } from "@/hooks/useT";
import { useState } from "react";

export default function EnhancedCTA() {
  const { tr } = useT();
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 对接实际订阅服务
    setSubscribed(true);
    setTimeout(() => setShowSubscribe(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 主 CTA 行 */}
      <div className="flex gap-4 justify-center flex-wrap">
        <Link
          href="/articles"
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2"
        >
          <BookOpen size={18} />
          {tr("开始阅读")} →
        </Link>
        <Link
          href="/about"
          className="px-6 py-3 glass font-medium hover:bg-white/80 dark:hover:bg-white/10 transition-all flex items-center gap-2"
        >
          <User size={18} />
          {tr("关于我")}
        </Link>
        <Link
          href="/projects"
          className="px-6 py-3 glass font-medium hover:bg-white/80 dark:hover:bg-white/10 transition-all flex items-center gap-2"
        >
          <FolderOpen size={18} />
          {tr("作品集")}
        </Link>
      </div>

      {/* 次 CTA 行：低门槛互动 */}
      <div className="flex gap-3 justify-center flex-wrap">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.open("mailto:hello@kioyurt.dev")}
          className="px-4 py-2 text-sm glass rounded-full flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-indigo-500 transition-colors"
        >
          <Mail size={14} />
          {tr("给我发条消息")}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSubscribe(true)}
          className="px-4 py-2 text-sm glass rounded-full flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-indigo-500 transition-colors"
        >
          <Rss size={14} />
          {tr("订阅更新")}
        </motion.button>

        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="/guestbook"
          className="px-4 py-2 text-sm glass rounded-full flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-indigo-500 transition-colors"
        >
          <MessageCircle size={14} />
          {tr("留言墙")}
        </motion.a>
      </div>

      {/* 订阅弹窗 */}
      {showSubscribe && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowSubscribe(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            {subscribed ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">🎉</div>
                <p className="font-medium">{tr("订阅成功！")}</p>
                <p className="text-sm text-gray-500 mt-1">{tr("新文章发布时会通知你")}</p>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-lg mb-2">{tr("📬 订阅更新")}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {tr("每月最多 2 封邮件，绝不打扰")}
                </p>
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all"
                  >
                    {tr("订阅")}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}