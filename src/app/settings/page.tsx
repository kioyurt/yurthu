"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import GlassCard from "@/components/ui/GlassCard";
import { useSettings, type Settings } from "@/context/SettingsContext";
import {
  Sun, Moon, Monitor, Palette, Bell, Globe,
  Sparkles, RotateCcw, Check,
} from "lucide-react";

const accentColors = [
  { name: "Indigo", value: "#6366f1", class: "bg-indigo-500" },
  { name: "Blue",   value: "#3b82f6", class: "bg-blue-500" },
  { name: "Green",  value: "#10b981", class: "bg-emerald-500" },
  { name: "Rose",   value: "#f43f5e", class: "bg-rose-500" },
  { name: "Amber",  value: "#f59e0b", class: "bg-amber-500" },
  { name: "Purple", value: "#a855f7", class: "bg-purple-500" },
];

// 简易点击音效（开启"音效"后生效）
let audioCtx: AudioContext | null = null;
function playClick() {
  try {
    audioCtx ??= new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = 660;
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } catch {}
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { settings, loaded, updateSettings, resetSettings } = useSettings();
  const [mounted, setMounted] = useState(false);
  const [savedTip, setSavedTip] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => setMounted(true), []);

  // 自动保存提示
  useEffect(() => {
    if (!loaded) return;
    setSavedTip(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSavedTip(false), 1500);
  }, [settings, loaded]);

  const toggle = (key: keyof Settings) => {
    if (settings.sound) playClick();
    updateSettings({ [key]: !settings[key] } as Partial<Settings>);
  };

  const toggleItems: { key: keyof Settings; label: string; desc: string }[] = [
    { key: "animations", label: "页面动画", desc: "启用 Framer Motion 过渡效果" },
    { key: "particles", label: "粒子背景", desc: "首页粒子动画效果" },
    { key: "sound", label: "音效", desc: "交互音效反馈" },
    { key: "notifications", label: "通知提醒", desc: "新文章/评论通知" },
    { key: "compactMode", label: "紧凑模式", desc: "减小间距，显示更多内容" },
    { key: "showReadingTime", label: "阅读时间", desc: "在文章卡片上显示预计阅读时间" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-24">
      <SectionTitle title="设置" subtitle="所有修改自动保存，刷新后依然生效" />

      <div className="space-y-6">
        {/* 深浅色主题 */}
        <GlassCard>
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Palette size={18} className="accent-text" /> 主题
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
                  mounted && theme === t.value
                    ? "accent-border bg-indigo-50 dark:bg-indigo-500/10"
                    : "border-gray-200 dark:border-gray-700 hover:border-indigo-300"
                }`}
              >
                <t.icon className="mx-auto mb-2" size={20} />
                <span className="text-sm">{t.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* 主题色 */}
        <GlassCard>
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Sparkles size={18} className="accent-text" /> 主题色
          </h3>
          <div className="flex gap-3 flex-wrap">
            {accentColors.map((color) => (
              <button
                key={color.name}
                onClick={() => updateSettings({ accentColor: color.value })}
                className={`w-10 h-10 rounded-full ${color.class} transition-all ${
                  settings.accentColor === color.value
                    ? "ring-4 ring-offset-2 ring-indigo-500/30 scale-110"
                    : "hover:scale-110"
                }`}
                title={color.name}
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-400">
            当前：<span className="accent-text font-medium">{settings.accentColor}</span>
            ，页面上带 <code>accent-*</code> 类的元素会同步变色
          </p>
        </GlassCard>

        {/* 偏好开关 */}
        <GlassCard>
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Bell size={18} className="text-green-500" /> 偏好设置
          </h3>
          <div className="space-y-4">
            {toggleItems.map((item) => {
              const on = Boolean(settings[item.key]);
              return (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => toggle(item.key)}
                    className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                      on ? "accent-bg" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    <motion.div
                      animate={{ x: on ? 24 : 2 }}
                      className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* 语言 */}
        <GlassCard>
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Globe size={18} className="text-blue-500" /> 语言
          </h3>
          <select
            value={settings.language}
            onChange={(e) => updateSettings({ language: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="zh-CN">简体中文</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </select>
        </GlassCard>

        {/* 底部操作区 */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={resetSettings}
            className="flex-1 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} /> 恢复默认设置
          </motion.button>
          <span
            className={`flex items-center gap-1 text-sm text-green-500 transition-opacity ${
              savedTip ? "opacity-100" : "opacity-0"
            }`}
          >
            <Check size={16} /> 已自动保存
          </span>
        </div>
      </div>
    </div>
  );
}