// src/components/ui/T.tsx
"use client";
import { useT } from "@/hooks/useT";

export default function T({
  k,
  params,
}: {
  k: string;
  params?: Record<string, string | number>;
}) {
  const { tr } = useT();
  return <>{tr(k, params)}</>;
}