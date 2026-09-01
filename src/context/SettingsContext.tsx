"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface Settings {
  animations: boolean;
  particles: boolean;
  sound: boolean;
  notifications: boolean;
  compactMode: boolean;
  showReadingTime: boolean;
  accentColor: string;
  language: string;
}

const defaults: Settings = {
  animations: true,
  particles: true,
  sound: false,
  notifications: true,
  compactMode: false,
  showReadingTime: true,
  accentColor: "#6366f1",
  language: "zh-CN",
};

const STORAGE_KEY = "kioyurt-settings";

interface SettingsContextValue {
  settings: Settings;
  loaded: boolean;
  updateSettings: (partial: Partial<Settings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: defaults,
  loaded: false,
  updateSettings: () => {},
  resetSettings: () => {},
});

/**
 * 🔧 将 hex 颜色转为 HSL 分量，用于生成 Tailwind 兼容的 CSS 变量
 * 返回 { h, s, l } 数值
 */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * 🔧 根据主色生成一组色阶（50~950），写入 CSS 变量
 * 这样 Tailwind 的 bg-accent-500、text-accent-400 等都能动态生效
 */
function applyAccentColor(hex: string) {
  const { h, s } = hexToHsl(hex);
  const root = document.documentElement;

  // 定义色阶的亮度映射（模拟 Tailwind 的 50~950）
  const lightnessMap: Record<string, number> = {
    "50": 97, "100": 94, "200": 86, "300": 77,
    "400": 66, "500": 55, "600": 48, "700": 39,
    "800": 31, "900": 24, "950": 14,
  };

  Object.entries(lightnessMap).forEach(([shade, l]) => {
    // 高亮度时降低饱和度，避免 pastel 色太艳
    const adjustedS = l > 80 ? Math.round(s * 0.6) : l > 60 ? Math.round(s * 0.85) : s;
    root.style.setProperty(`--accent-${shade}`, `${h} ${adjustedS}% ${l}%`);
  });

  // 同时设置原始 hex 方便直接用
  root.style.setProperty("--accent-raw", hex);
  root.style.setProperty("--accent-h", String(h));
  root.style.setProperty("--accent-s", `${s}%`);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [loaded, setLoaded] = useState(false);

  // 从 localStorage 恢复
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings({ ...defaults, ...parsed });
      }
    } catch {}
    setLoaded(true);
  }, []);

  // 🔧 关键修复：settings 变化时 → 写入 CSS 变量 + 持久化
  useEffect(() => {
    if (!loaded) return;

    // 1. 写入主题色 CSS 变量
    applyAccentColor(settings.accentColor);

    // 2. 持久化到 localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings, loaded]);

  // 🔧 首次加载也要应用一次（防止刷新后 CSS 变量丢失）
  useEffect(() => {
    if (loaded) {
      applyAccentColor(settings.accentColor);
    }
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ 新增：语言变化时同步 <html lang> 属性
  useEffect(() => {
    if (loaded) {
      document.documentElement.lang = settings.language;
      document.documentElement.classList.add("notranslate");
      document.documentElement.setAttribute("translate", "no");
      document.body?.setAttribute("translate", "no");
    }
  }, [settings.language, loaded]);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaults);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loaded, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);