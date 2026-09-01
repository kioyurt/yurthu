"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import GlassCard from "@/components/ui/GlassCard";
import { useSettings, type Settings } from "@/context/SettingsContext";
import { useT } from "@/hooks/useT";
import {
  Sun, Moon, Monitor, Palette, Bell, Globe,
  Sparkles, RotateCcw, Check,
} from "lucide-react";

const accentColors = [
  { name: "Indigo", value: "#6366f1" },
  { name: "Blue",   value: "#3b82f6" },
  { name: "Green",  value: "#10b981" },
  { name: "Rose",   value: "#f43f5e" },
  { name: "Amber",  value: "#f59e0b" },
  { name: "Purple", value: "#a855f7" },
];

// 简易点击音效
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

// 🔧 空订阅 + 常量快照：安全检测"是否已挂载客户端"
function subscribeNoop() {
  return () => {};
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { settings, loaded, updateSettings, resetSettings } = useSettings();
  const { tr } = useT();
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [savedTip, setSavedTip] = useState(false);
  const timer = useRef<number | null>(null);
  // 🔧 修复：跳过首次加载，只有用户真正修改设置后才显示"已自动保存"
  const skipTip = useRef(true);

  // 自动保存提示
  // 🔧 修复：加载完成后首次触发（来自 localStorage 恢复）不弹提示；
  //    后续每次用户修改设置才提示，并在组件卸载时清理定时器。
  useEffect(() => {
    if (!loaded) return;
    if (skipTip.current) {
      skipTip.current = false;
      return;
    }
    setSavedTip(true);
    if (timer.current !== null) {
      clearTimeout(timer.current);
    }
    timer.current = window.setTimeout(() => setSavedTip(false), 1500);
  }, [settings, loaded]);

  useEffect(() => {
    return () => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  const toggle = (key: keyof Settings) => {
    if (settings.sound) playClick();
    updateSettings({ [key]: !settings[key] } as Partial<Settings>);
  };

  const toggleItems: { key: keyof Settings; label: string; desc: string }[] = [
    { key: "animations", label: tr("页面动画"), desc: tr("启用 Framer Motion 过渡效果") },
    { key: "particles", label: tr("粒子背景"), desc: tr("首页粒子动画效果") },
    { key: "sound", label: tr("音效"), desc: tr("交互音效反馈") },
    { key: "notifications", label: tr("通知提醒"), desc: tr("新文章/评论通知") },
    { key: "compactMode", label: tr("紧凑模式"), desc: tr("减小间距，显示更多内容") },
    { key: "showReadingTime", label: tr("阅读时间"), desc: tr("在文章卡片上显示预计阅读时间") },
  ];

  // 🔧 当前选中色的 ring 颜色直接用 inline style
  const currentAccent = settings.accentColor;

  return (
    <div className="max-w-2xl mx-auto px-4 py-24">
      <SectionTitle title={tr("设置")} subtitle={tr("所有修改自动保存，刷新后依然生效")} />

      <div className="space-y-6">
        {/* ===== 深浅色主题 ===== */}
        <GlassCard>
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Palette size={18} className="accent-text" /> {tr("主题")}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "light", label: tr("浅色"), icon: Sun },
              { value: "dark", label: tr("深色"), icon: Moon },
              { value: "system", label: tr("跟随系统"), icon: Monitor },
            ].map((t) => {
              const isSelected = mounted && theme === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    isSelected
                      ? "border-transparent"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                  style={isSelected ? {
                    borderColor: currentAccent,
                    backgroundColor: `${currentAccent}15`,  // 15 = ~8% opacity hex
                  } : undefined}
                >
                  <t.icon
                    className="mx-auto mb-2"
                    size={20}
                    style={isSelected ? { color: currentAccent } : undefined}
                  />
                  <span
                    className="text-sm"
                    style={isSelected ? { color: currentAccent, fontWeight: 600 } : undefined}
                  >
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* ===== 主题色 ===== */}
        <GlassCard>
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Sparkles size={18} className="accent-text" /> {tr("主题色")}
          </h3>
          <div className="flex gap-3 flex-wrap">
            {accentColors.map((color) => {
              const isSelected = settings.accentColor === color.value;
              return (
                <button
                  key={color.name}
                  onClick={() => updateSettings({ accentColor: color.value })}
                  className="w-10 h-10 rounded-full transition-all relative"
                  style={{
                    backgroundColor: color.value,
                    transform: isSelected ? "scale(1.15)" : "scale(1)",
                    boxShadow: isSelected
                      ? `0 0 0 3px white, 0 0 0 6px ${color.value}60`
                      : "none",
                  }}
                  title={color.name}
                >
                  {isSelected && (
                    <Check
                      size={16}
                      className="absolute inset-0 m-auto text-white"
                      strokeWidth={3}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-gray-400">
            {tr("当前：")}
            <span className="font-medium" style={{ color: currentAccent }}>
              {currentAccent}
            </span>
            {" "}· {tr("全站主题色已同步更新")}
          </p>
        </GlassCard>

        {/* ===== 偏好开关 ===== */}
        <GlassCard>
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Bell size={18} className="text-green-500" /> {tr("偏好设置")}
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
                    className="w-12 h-6 rounded-full transition-colors relative shrink-0"
                    style={{
                      backgroundColor: on ? currentAccent : undefined,
                    }}
                    data-on={on}
                  >
                    {/* 用 CSS 控制关闭态颜色 */}
                    {!on && (
                      <span className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700" />
                    )}
                    <motion.div
                      animate={{ x: on ? 24 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-4 h-4 rounded-full bg-white shadow z-10"
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* ===== 语言 ===== */}
        <GlassCard>
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Globe size={18} className="text-blue-500" /> {tr("语言")}
          </h3>
          <select
            value={settings.language}
            onChange={(e) => updateSettings({ language: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 transition-shadow"
            style={{ "--tw-ring-color": `${currentAccent}80` } as React.CSSProperties}
          >
            <option value="zh-CN">简体中文</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </select>
        </GlassCard>

        {/* ===== 底部操作区 ===== */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={resetSettings}
            className="flex-1 py-4 text-white rounded-xl font-medium shadow-lg flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${currentAccent}, ${currentAccent}cc)`,
              boxShadow: `0 8px 24px ${currentAccent}30`,
            }}
          >
            <RotateCcw size={18} /> {tr("恢复默认设置")}
          </motion.button>
          <span
            className={`flex items-center gap-1 text-sm transition-opacity ${
              savedTip ? "opacity-100" : "opacity-0"
            }`}
            style={{ color: "#10b981" }}
          >
            <Check size={16} /> {tr("已自动保存")}
          </span>
        </div>
      </div>
    </div>
  );
}
