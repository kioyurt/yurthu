// src/components/home/StatsSection.tsx
"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { useT } from "@/hooks/useT";
import { FileText, Camera, Music, TrendingUp } from "lucide-react";
import { GithubIcon } from "@/components/ui/BrandIcons";

interface StatItem {
  label: string;
  value: number;
  icon: string;
  href: string;
  trend?: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  Camera,
  Music,
  Github: GithubIcon,
};

export default function StatsSection({ stats }: { stats: StatItem[] }) {
  const { tr } = useT();
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = ICON_MAP[stat.icon] || FileText;
        return (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <GlassCard
              delay={i * 0.1}
              onClick={() => router.push(stat.href)}
              className="text-center cursor-pointer hover:border-indigo-400/50 transition-colors"
            >
              <Icon className="mx-auto mb-2 text-indigo-500" size={24} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-gray-500">{tr(stat.label)}</div>
              {stat.trend && stat.trend > 0 && (
                <div className="flex items-center justify-center gap-0.5 mt-1 text-[10px] text-green-500">
                  <TrendingUp size={10} />
                  +{stat.trend} {tr("本周")}
                </div>
              )}
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}