// src/app/friends/page.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import GlassCard from "@/components/ui/GlassCard";
import { useT } from "@/hooks/useT";
import { ExternalLink, Heart, Plus } from "lucide-react";

const friends = [
  {
    name: "小明的博客",
    url: "https://example.com",
    description: "前端开发 / 摄影爱好者",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=1",
    tags: ["前端", "摄影"],
  },
  {
    name: "Tech Notes",
    url: "https://example.com",
    description: "后端架构 / 分布式系统",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=2",
    tags: ["后端", "架构"],
  },
  {
    name: "设计小站",
    url: "https://example.com",
    description: "UI/UX 设计 / 插画创作",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=3",
    tags: ["设计", "插画"],
  },
  {
    name: "AI Lab",
    url: "https://example.com",
    description: "机器学习 / NLP / 论文解读",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=4",
    tags: ["AI", "NLP"],
  },
  {
    name: "游戏开发日志",
    url: "https://example.com",
    description: "独立游戏开发 / Unity / Godot",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=5",
    tags: ["游戏", "Unity"],
  },
  {
    name: "运维老张",
    url: "https://example.com",
    description: "DevOps / K8s / 云原生",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=6",
    tags: ["运维", "K8s"],
  },
];

export default function FriendsPage() {
  const { tr } = useT();
  const [showApply, setShowApply] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 py-24">
      <SectionTitle title={tr("友情链接")} subtitle={tr("互联网上的好朋友们 🤝")} />

      {/* Friends Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {friends.map((friend, i) => (
          <motion.a
            key={friend.name}
            href={friend.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="glass glass-hover p-6 flex items-start gap-4 group"
          >
            <img
              src={friend.avatar}
              alt={friend.name}
              className="w-12 h-12 rounded-full ring-2 ring-indigo-200 dark:ring-indigo-800 group-hover:ring-indigo-400 transition-all"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold flex items-center gap-2">
                {tr(friend.name)}
                <ExternalLink size={12} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tr(friend.description)}</p>
              <div className="flex gap-1.5 mt-2">
                {friend.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    {tr(tag)}
                  </span>
                ))}
              </div>
            </div>
          </motion.a>
        ))}
      </div>

      {/* Apply Section */}
      <GlassCard className="text-center">
        <h3 className="font-semibold text-lg mb-2 flex items-center justify-center gap-2">
          <Heart size={18} className="text-red-400" /> {tr("申请友链")}
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {tr("如果你也有一个有趣的博客，欢迎交换友链！")}
        </p>
        {!showApply ? (
          <button
            onClick={() => setShowApply(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 inline-flex items-center gap-2"
          >
            <Plus size={16} /> {tr("申请添加")}
          </button>
        ) : (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="max-w-md mx-auto space-y-3 text-left"
          >
            <input placeholder={tr("用户昵称")} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/50" />
            <input placeholder={tr("博客地址")} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/50" />
            <input placeholder={tr("一句话介绍")} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/50" />
            <button className="w-full py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors">
              {tr("提交申请")}
            </button>
          </motion.form>
        )}
      </GlassCard>
    </div>
  );
}
