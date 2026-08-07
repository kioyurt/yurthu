// src/components/ui/GlassCard.tsx
"use client";
import { motion } from "framer-motion";
import { ReactNode, MouseEvent } from "react"; // 1. 引入 MouseEvent 类型

export default function GlassCard({
  children,
  className = "",
  delay = 0,
  onClick, // 2. 在这里接收 onClick 属性
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void; // 3. 声明 onClick 的类型（可选）
}) {
  return (
    <motion.div
      onClick={onClick} // 4. 将 onClick 绑定到真实的 DOM 元素上
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`glass glass-hover p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}