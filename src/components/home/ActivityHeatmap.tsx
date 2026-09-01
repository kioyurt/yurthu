// src/components/home/ActivityHeatmap.tsx
"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { useT } from "@/hooks/useT";

interface ActivityData {
  date: string;
  count: number;
}

interface Props {
  data: ActivityData[];
}

const COLORS = [
  "bg-gray-100 dark:bg-gray-800",
  "bg-indigo-200 dark:bg-indigo-900/60",
  "bg-indigo-300 dark:bg-indigo-700/60",
  "bg-indigo-500 dark:bg-indigo-500/80",
  "bg-indigo-700 dark:bg-indigo-400",
];

export default function ActivityHeatmap({ data }: Props) {
  const { tr } = useT();
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  // 将数据按周分组（7天一行）
  const weeks = useMemo(() => {
    const result: ActivityData[][] = [];
    for (let i = 0; i < data.length; i += 7) {
      result.push(data.slice(i, i + 7));
    }
    return result;
  }, [data]);

  const totalContributions = useMemo(() => data.reduce((s, d) => s + d.count, 0), [data]);

  const getColor = (count: number) => {
    if (count === 0) return COLORS[0];
    if (count <= 2) return COLORS[1];
    if (count <= 4) return COLORS[2];
    if (count <= 6) return COLORS[3];
    return COLORS[4];
  };

  return (
    <GlassCard className="!p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          {tr("活跃度")}
        </h3>
        <span className="text-xs text-gray-400">
          {tr("过去 16 周")} · {totalContributions} {tr("次贡献")}
        </span>
      </div>

      {/* 热力图网格 */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <motion.div
                key={day.date}
                whileHover={{ scale: 1.4 }}
                className={`w-3 h-3 rounded-[3px] ${getColor(day.count)} cursor-pointer transition-colors`}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({ date: day.date, count: day.count, x: rect.x, y: rect.y - 36 });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* 图例 */}
      <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-gray-400">
        <span>{tr("少")}</span>
        {COLORS.map((c, i) => (
          <span key={i} className={`w-2.5 h-2.5 rounded-[2px] ${c}`} />
        ))}
        <span>{tr("多")}</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-[11px] rounded-md shadow-lg pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.date} · {tooltip.count} {tr("次")}
        </div>
      )}
    </GlassCard>
  );
}