// src/components/home/RecentTimeline.tsx
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { useT } from "@/hooks/useT";
import { FileText, Code2, Camera, Music4, Clock } from "lucide-react";

interface TimelineItem {
  id: string;
  type: "article" | "code" | "photo" | "music";
  title: string;
  date: string;
  href: string;
}

const TYPE_CONFIG = {
  article: { icon: FileText, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
  code: { icon: Code2, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
  photo: { icon: Camera, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-900/20" },
  music: { icon: Music4, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
};

export default function RecentTimeline({ items }: { items: TimelineItem[] }) {
  const { tr } = useT();

  return (
    <GlassCard className="!p-5">
      <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
        <Clock size={14} className="text-indigo-500" />
        {tr("最近动态")}
      </h3>

      <div className="space-y-0">
        {items.map((item, i) => {
          const config = TYPE_CONFIG[item.type];
          const Icon = config.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className="group flex items-start gap-3 relative"
            >
              {/* 时间线竖线 */}
              {i < items.length - 1 && (
                <div className="absolute left-[13px] top-8 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
              )}

              {/* 图标 */}
              <div className={`w-7 h-7 rounded-full ${config.bg} flex items-center justify-center shrink-0 z-10`}>
                <Icon size={13} className={config.color} />
              </div>

              {/* 内容 */}
              <div className="pb-4 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-indigo-500 transition-colors">
                  {item.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </GlassCard>
  );
}