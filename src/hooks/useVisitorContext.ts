// src/hooks/useVisitorContext.ts
import { useState, useEffect } from "react";

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

export function useVisitorContext(): VisitorContext {
  const [context, setContext] = useState<VisitorContext>({
    timePeriod: "morning",
    referrerType: "direct",
    device: "desktop",
    greeting: "你好 👋",
    subtitle: "",
    theme: "day",
  });

  useEffect(() => {
    const timePeriod = getTimePeriod();
    const referrerType = getReferrerType();
    const device = getDeviceType();
    const timeGreeting = GREETINGS[timePeriod];
    const referrerMsg = REFERRER_MESSAGES[referrerType];

    // 组合问候语：时间问候 + 来源欢迎
    const greeting = referrerType === "direct"
      ? timeGreeting.greeting
      : `${referrerMsg} ${timeGreeting.greeting}`;

    setContext({
      timePeriod,
      referrerType,
      device,
      greeting,
      subtitle: timeGreeting.subtitle,
      theme: timeGreeting.theme,
    });
  }, []);

  return context;
}