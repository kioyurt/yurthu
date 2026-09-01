// src/hooks/useVisitorContext.ts
import { useMemo, useSyncExternalStore } from "react";
import { useT } from "@/hooks/useT";

export type TimePeriod = "dawn" | "morning" | "afternoon" | "evening" | "night";
export type ReferrerType = "github" | "twitter" | "google" | "direct" | "other";
export type DeviceType = "mobile" | "tablet" | "desktop";

interface VisitorContext {
  timePeriod: TimePeriod;
  referrerType: ReferrerType;
  device: DeviceType;
  greeting: string;
  subtitle: string;
  theme: "day" | "night";
}

function getTimePeriod(): TimePeriod {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 23) return "evening";
  return "night";
}

function getReferrerType(): ReferrerType {
  if (typeof window === "undefined") return "direct";
  const ref = document.referrer.toLowerCase();
  if (ref.includes("github.com")) return "github";
  if (ref.includes("twitter.com") || ref.includes("x.com")) return "twitter";
  if (ref.includes("google.com") || ref.includes("bing.com")) return "google";
  if (ref === "") return "direct";
  return "other";
}

function getDeviceType(): DeviceType {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

// 中文原文作为翻译 key，实际显示由 tr() 处理
const GREETINGS: Record<TimePeriod, { greeting: string; subtitle: string; theme: "day" | "night" }> = {
  dawn: {
    greeting: "早安，早起的人 🌅",
    subtitle: "新的一天，从代码开始",
    theme: "day",
  },
  morning: {
    greeting: "早上好 ☀️",
    subtitle: "精力充沛，适合写点东西",
    theme: "day",
  },
  afternoon: {
    greeting: "下午好 🌤️",
    subtitle: "来杯咖啡，看看最近的技术动态",
    theme: "day",
  },
  evening: {
    greeting: "晚上好 🌆",
    subtitle: "忙碌一天，来点轻松的内容",
    theme: "night",
  },
  night: {
    greeting: "夜猫子模式已开启 🦉",
    subtitle: "深夜写代码，灵感最旺盛的时候",
    theme: "night",
  },
};

const REFERRER_MESSAGES: Record<ReferrerType, string | null> = {
  github: "欢迎 fellow developer 🐙 从 GitHub 过来的你一定很酷",
  twitter: "嘿，Twitter 的朋友 👋 感谢关注",
  google: "搜索达人，欢迎找到这里 🔍",
  direct: "老朋友，欢迎回来 ✨",
  other: "欢迎新朋友 🎉",
};

/* ============================================================
   🔧 用 useSyncExternalStore 派生访客上下文，替代 effect + setState：
   - 服务端/水合阶段返回稳定的默认快照（与服务端 HTML 一致）
   - 挂载后自动切换到真实的时间段/来源/设备，无多余渲染
   ============================================================ */
interface RawContext {
  timePeriod: TimePeriod;
  referrerType: ReferrerType;
  device: DeviceType;
}

const SERVER_CONTEXT: RawContext = {
  timePeriod: "morning",
  referrerType: "direct",
  device: "desktop",
};

// 客户端快照在挂载期间保持不变（时间/来源/设备在一次页面会话内固定）
let cachedClientContext: RawContext | null = null;

function computeRawContext(): RawContext {
  if (typeof window === "undefined") return SERVER_CONTEXT;
  if (!cachedClientContext) {
    cachedClientContext = {
      timePeriod: getTimePeriod(),
      referrerType: getReferrerType(),
      device: getDeviceType(),
    };
  }
  return cachedClientContext;
}

function subscribeNoop() {
  return () => {};
}

export function useVisitorContext(): VisitorContext {
  const { tr } = useT();
  const raw = useSyncExternalStore(subscribeNoop, computeRawContext, () => SERVER_CONTEXT);

  return useMemo(() => {
    const timeGreeting = GREETINGS[raw.timePeriod];
    const referrerMsg = REFERRER_MESSAGES[raw.referrerType];

    // 组合问候语：来源欢迎 + 时间问候（分段翻译，保证多语言生效）
    const greeting = raw.referrerType === "direct" || !referrerMsg
      ? tr(timeGreeting.greeting)
      : `${tr(referrerMsg)} ${tr(timeGreeting.greeting)}`;

    return {
      timePeriod: raw.timePeriod,
      referrerType: raw.referrerType,
      device: raw.device,
      greeting,
      subtitle: tr(timeGreeting.subtitle),
      theme: timeGreeting.theme,
    };
  }, [raw, tr]);
}
