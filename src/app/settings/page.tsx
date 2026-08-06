// src/app/settings/page.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import GlassCard from "@/components/ui/GlassCard";
import { useTheme } from "next-themes";
import {
  Sun, Moon, Monitor, Palette, Bell, Globe,
  Shield, Volume2, Type, Sparkles, Save, Check
} from "lucide-react";

const accentColors = [
  { name: "Indigo", value: "#6366f1", class: "bg-indigo-500" },
  { name: "Blue", value: "#3b82f6", class: "bg-blue-500" },
  { name: "Green", value: "#10b981", class: "bg-emerald-500" },
  { name: "Rose", value: "#f43f5e", class: "bg-rose-500" },
  { name: "Amber", value: "#f59e0b", class: "bg-amber-500" },
  { name: "Purple", value: "#a855f7", class: "bg-purple-500" },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [accentColor, setAccentColor] = useState("#6366f1");
  const [settings, setSettings] = useState({
    animations: true,
    particles: true,
    sound: false,
    notifications: true,
    compactMode: false,
    showReadingTime: true,
  });

  useState(() => setMounted(true));

  const toggleSetting = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-24">
      <SectionTitle title="设置" subtitle="自定义你的浏览体验" />

      <div className="space-y-6">
        {/* Theme */}
        <GlassCard>
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Palette size={18} className="text-indigo-500" /> 主题
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "light", label: "浅色", icon: Sun },
              { value: "dark", label: "深色", icon: Moon },
              { value: "system", label: "跟随系统", icon: Monitor },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  theme === t.value
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                    : "border-gray-200 dark:border-gray-700 hover:border-indigo-300"
                }`}
              >
                <t.icon className="mx-auto mb-2" size={20} />
                <span className="text-sm">{t.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Accent Color */}
        <GlassCard>
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-purple-500" /> 主题色
          </h3>
          <div className="flex gap-3 flex-wrap">
            {accentColors.map((color) => (
              <button
                key={color.name}
                onClick={() => setAccentColor(color.value)}
                className={`w-10 h-10 rounded-full ${color.class} transition-all ${
                  accentColor === color.value
                    ? "ring-4 ring-offset-2 ring-indigo-500/30 scale-110"
                    : "hover:scale-110"
                }`}
                title={color.name}
              />
            ))}
          </div>
        </GlassCard>

        {/* Toggles */}
        <GlassCard>
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Bell size={18} className="text-green-500" /> 偏好设置
          </h3>
          <div className="space-y-4">
            {[
              { key: "animations", label: "页面动画", desc: "启用 Framer Motion 过渡效果" },
              { key: "particles", label: "粒子背景", desc: "首页粒子动画效果" },
              { key: "sound", label: "音效", desc: "交互音效反馈" },
              { key: "notifications", label: "通知提醒", desc: "新文章/评论通知" },
              { key: "compactMode", label: "紧凑模式", desc: "减小间距，显示更多内容" },
              { key: "showReadingTime", label: "阅读时间", desc: "在文章卡片上显示预计阅读时间" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <button
                  onClick={() => toggleSetting(item.key)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    settings[item.key as keyof typeof settings]
                      ? "bg-indigo-500"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <motion.div
                    animate={{ x: settings[item.key as keyof typeof settings] ? 24 : 2 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                  />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Language */}
        <GlassCard>
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Globe size={18} className="text-blue-500" /> 语言
          </h3>
          <select className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/50">
            <option>简体中文</option>
            <option>English</option>
            <option>日本語</option>
          </select>
        </GlassCard>

        {/* Save Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
        >
          <Save size={18} /> 保存设置
        </motion.button>
      </div>
    </div>
  );
}