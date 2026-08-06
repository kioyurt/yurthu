"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { MotionConfig } from "framer-motion";

export interface Settings {
  accentColor: string;
  animations: boolean;
  particles: boolean;
  sound: boolean;
  notifications: boolean;
  compactMode: boolean;
  showReadingTime: boolean;
  language: string;
}

export const defaultSettings: Settings = {
  accentColor: "#6366f1",
  animations: true,
  particles: true,
  sound: false,
  notifications: true,
  compactMode: false,
  showReadingTime: true,
  language: "zh-CN",
};

interface SettingsContextValue {
  settings: Settings;
  loaded: boolean;
  updateSettings: (patch: Partial<Settings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);
const STORAGE_KEY = "yurthu-settings";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  // ① 首次进入：从 localStorage 恢复设置
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings((prev) => ({ ...prev, ...JSON.parse(raw) }));
    } catch (e) {
      console.warn("读取设置失败", e);
    }
    setLoaded(true);
  }, []);

  // ② 设置变化：持久化 + 应用到页面
  useEffect(() => {
    if (!loaded) return;

    const root = document.documentElement;

    // 主题色 → CSS 变量，全站可用 var(--accent)
    root.style.setProperty("--accent", settings.accentColor);

    // 开关 → 挂在 <html> 上的 class，配合 globals.css 生效
    root.classList.toggle("no-animations", !settings.animations);
    root.classList.toggle("no-particles", !settings.particles);
    root.classList.toggle("compact-mode", settings.compactMode);

    // 语言
    root.lang = settings.language;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings, loaded]);

  const updateSettings = (patch: Partial<Settings>) =>
    setSettings((prev) => ({ ...prev, ...patch }));

  const resetSettings = () => setSettings(defaultSettings);

  return (
    <SettingsContext.Provider
      value={{ settings, loaded, updateSettings, resetSettings }}
    >
      {/* 关闭动画时，全局禁用 framer-motion 动效 */}
      <MotionConfig reducedMotion={settings.animations ? "never" : "always"}>
        {children}
      </MotionConfig>
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings 必须在 <SettingsProvider> 内使用");
  return ctx;
}