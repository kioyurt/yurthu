// src/app/about/page.tsx
"use client";
import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import GlassCard from "@/components/ui/GlassCard";
import {
  MapPin, Mail, Globe,
  CodeXml, Palette, Camera, Music, Coffee, BookOpen
} from "lucide-react";
import { GithubIcon, TwitterIcon } from "@/components/ui/BrandIcons";

const skills = [
  { name: "React / Next.js", level: 92, color: "from-blue-400 to-blue-600" },
  { name: "TypeScript", level: 88, color: "from-indigo-400 to-indigo-600" },
  { name: "Python / FastAPI", level: 85, color: "from-green-400 to-green-600" },
  { name: "Rust", level: 65, color: "from-orange-400 to-orange-600" },
  { name: "Docker / K8s", level: 78, color: "from-cyan-400 to-cyan-600" },
  { name: "UI/UX Design", level: 72, color: "from-purple-400 to-purple-600" },
];

const hobbies = [
  { icon: CodeXml, label: "编程" },
  { icon: Camera, label: "摄影" },
  { icon: Music, label: "音乐" },
  { icon: Coffee, label: "咖啡" },
  { icon: BookOpen, label: "阅读" },
  { icon: Palette, label: "设计" },
];

const timeline = [
  { period: "2020 - 2022", title: "计算机科学学士", desc: "某大学 · 计算机学院" },
  { period: "2022 - 2024", title: "前端开发工程师", desc: "某互联网公司 · 基础架构组" },
  { period: "2024 - 2025", title: "全栈开发工程师", desc: "某创业公司 · 核心开发" },
  { period: "2025 - 至今", title: "独立开发者 / 自由职业", desc: "做自己的产品，写自己的代码" },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24">
      <SectionTitle title="关于我" subtitle="一个热爱创造的开发者" />

      {/* Profile Card */}
      <GlassCard className="mb-10 text-center py-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto mb-4 flex items-center justify-center text-4xl shadow-xl shadow-indigo-500/20"
        >
          👨‍💻
        </motion.div>
        <h2 className="text-2xl font-bold mb-1">Your Name</h2>
        <p className="text-indigo-500 font-medium mb-3">Full-Stack Developer</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
          热爱技术，喜欢用代码创造美好的事物。相信开源的力量，
          享受学习和分享的过程。白天写代码，晚上看星星。✨
        </p>
        <div className="flex items-center justify-center gap-3 text-sm text-gray-400 mb-6">
          <span className="flex items-center gap-1"><MapPin size={14} /> 中国 · 上海</span>
          <span className="flex items-center gap-1"><Mail size={14} /> hello@example.com</span>
        </div>
        <div className="flex justify-center gap-4">
          {[GithubIcon, TwitterIcon, Globe].map((Icon, i) => (
            <a key={i} href="#" className="p-2.5 rounded-xl glass hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors text-gray-500 hover:text-indigo-500">
              <Icon size={18} />
            </a>
          ))}
        </div>
      </GlassCard>

      {/* Skills */}
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-indigo-500 rounded-full" /> 技能
      </h3>
      <GlassCard className="mb-10 space-y-5">
        {skills.map((skill, i) => (
          <div key={skill.name}>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">{skill.name}</span>
              <span className="text-gray-400">{skill.level}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${skill.level}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className={`h-full rounded-full bg-gradient-to-r ${skill.color}`}
              />
            </div>
          </div>
        ))}
      </GlassCard>

      {/* Hobbies */}
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-purple-500 rounded-full" /> 兴趣爱好
      </h3>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-10">
        {hobbies.map((hobby, i) => (
          <motion.div
            key={hobby.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -5 }}
            className="glass p-4 text-center"
          >
            <hobby.icon className="mx-auto mb-2 text-indigo-500" size={24} />
            <span className="text-xs font-medium">{hobby.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Timeline */}
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-pink-500 rounded-full" /> 经历
      </h3>
      <div className="relative pl-6">
        <div className="absolute left-1 top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-500 to-pink-500" />
        {timeline.map((item, i) => (
          <motion.div
            key={item.period}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="relative mb-8 pl-6"
          >
            <div className="absolute -left-1 top-1.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white dark:border-gray-900" />
            <span className="text-xs text-indigo-500 font-mono">{item.period}</span>
            <h4 className="font-semibold mt-1">{item.title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
