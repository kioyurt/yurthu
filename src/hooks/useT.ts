// src/hooks/useT.ts
"use client";
import { useCallback } from "react";
import { useSettings } from "@/context/SettingsContext";
import { t, type Locale } from "@/lib/i18n";

export function useT() {
  const { settings } = useSettings();
  const locale = settings.language as Locale;

  const tr = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      t(key, locale, params),
    [locale],
  );

  return { tr, locale };
}