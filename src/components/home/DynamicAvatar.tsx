// src/components/home/DynamicAvatar.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import type { TimePeriod } from "@/hooks/useVisitorContext";

interface Props {
  timePeriod: TimePeriod;
}

// 不同时间段使用不同的动画/表情
const AVATAR_CONFIG: Record<TimePeriod, { emoji: string; glowColor: string; ringColor: string }> = {
  dawn: { emoji: "🌅", glowColor: "shadow-amber-500/30", ringColor: "ring-amber-300" },
  morning: { emoji: "☀️", glowColor: "shadow-yellow-500/30", ringColor: "ring-yellow-300" },
  afternoon: { emoji: "🌤️", glowColor: "shadow-sky-500/30", ringColor: "ring-sky-300" },
  evening: { emoji: "🌆", glowColor: "shadow-orange-500/30", ringColor: "ring-orange-300" },
  night: { emoji: "🦉", glowColor: "shadow-purple-500/30", ringColor: "ring-purple-400" },
};

export default function DynamicAvatar({ timePeriod }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const config = AVATAR_CONFIG[timePeriod];

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
      whileHover={{ scale: 1.05, rotate: 5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`
        relative w-28 h-28 rounded-full mx-auto mb-6
        bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500
        flex items-center justify-center text-5xl
        ${config.glowColor} shadow-2xl
        ring-4 ${config.ringColor}
        cursor-pointer select-none
      `}
    >
      {/* 主表情 */}
      <motion.span
        animate={isHovered ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        {config.emoji}
      </motion.span>

      {/* 呼吸光环 */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 -z-10"
      />

      {/* 悬浮时的粒子效果 */}
      {isHovered && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: Math.cos((i / 6) * Math.PI * 2) * 50,
                y: Math.sin((i / 6) * Math.PI * 2) * 50,
              }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="absolute text-lg pointer-events-none"
            >
              ✦
            </motion.span>
          ))}
        </>
      )}

      {/* 在线状态指示器 */}
      <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800" />
    </motion.div>
  );
}
