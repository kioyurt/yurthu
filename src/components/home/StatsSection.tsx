// src/components/home/StatsSection.tsx

"use client";

import type { ElementType } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import {
  Camera,
  Eye,
  FileText,
  MessageCircle,
} from "lucide-react";

import GlassCard from "@/components/ui/GlassCard";
import { useT } from "@/hooks/useT";

interface StatItem {
  label: string;
  value: number;
  icon: string;
  href: string;
}

const ICON_MAP: Record<string, ElementType> = {
  FileText,
  Camera,
  Eye,
  MessageCircle,
};

export default function StatsSection({
  stats,
}: {
  stats: StatItem[];
}) {
  const { tr } = useT();
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon =
          ICON_MAP[stat.icon] ||
          FileText;

        return (
          <motion.div
            key={`${stat.label}-${index}`}
            whileHover={{
              scale: 1.03,
              y: -2,
            }}
            whileTap={{
              scale: 0.97,
            }}
          >
            <GlassCard
              delay={index * 0.1}
              onClick={() =>
                router.push(stat.href)
              }
              className="text-center cursor-pointer hover:border-indigo-400/50 transition-colors"
            >
              <Icon
                className="mx-auto mb-2 text-indigo-500"
                size={24}
              />

              <div className="text-2xl font-bold">
                {stat.value.toLocaleString()}
              </div>

              <div className="text-sm text-gray-500">
                {tr(stat.label)}
              </div>
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}