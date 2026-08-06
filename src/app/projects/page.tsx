// src/app/projects/page.tsx
"use client";
import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import GlassCard from "@/components/ui/GlassCard";
import { Star, GitFork, GitBranch, ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/ui/BrandIcons";

const projects = [
  {
    name: "kirameku",
    description: "✨ 高颜值全栈个人博客系统 - Next.js + FastAPI + PostgreSQL",
    language: "TypeScript",
    langColor: "#3178c6",
    stars: 128,
    forks: 23,
    topics: ["blog", "nextjs", "fastapi", "fullstack"],
    url: "https://github.com/username/kirameku",
    pinned: true,
  },
  {
    name: "ai-search-engine",
    description: "🔍 基于 pgvector 的语义搜索引擎，支持自然语言查询",
    language: "Python",
    langColor: "#3572A5",
    stars: 256,
    forks: 45,
    topics: ["ai", "search", "pgvector", "nlp"],
    url: "#",
    pinned: true,
  },
  {
    name: "rust-wasm-game",
    description: "🎮 用 Rust + WebAssembly 编写的像素风小游戏引擎",
    language: "Rust",
    langColor: "#dea584",
    stars: 89,
    forks: 12,
    topics: ["rust", "wasm", "game"],
    url: "#",
    pinned: false,
  },
  {
    name: "homelab-infra",
    description: "🏠 HomeLab 基础设施即代码 - Terraform + Ansible + K8s",
    language: "HCL",
    langColor: "#844FBA",
    stars: 67,
    forks: 18,
    topics: ["homelab", "terraform", "kubernetes"],
    url: "#",
    pinned: false,
  },
  {
    name: "photo-organizer",
    description: "📷 AI 驱动的照片整理工具，自动分类 + EXIF 提取 + 去重",
    language: "Python",
    langColor: "#3572A5",
    stars: 145,
    forks: 32,
    topics: ["ai", "photo", "cli"],
    url: "#",
    pinned: false,
  },
  {
    name: "vue3-admin",
    description: "🎛️ 通用后台管理模板 - Vue3 + Element Plus + Pinia",
    language: "Vue",
    langColor: "#41b883",
    stars: 312,
    forks: 78,
    topics: ["vue3", "admin", "template"],
    url: "#",
    pinned: true,
  },
];

export default function ProjectsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-24">
      <SectionTitle title="开源项目" subtitle="在 GitHub 上的代码与贡献" />

      {/* GitHub Stats Card */}
      <GlassCard className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <GithubIcon className="text-white" size={32} />
          </div>
          <div>
            <h3 className="font-bold text-lg">YourName</h3>
            <p className="text-sm text-gray-500">Full-Stack Developer · Open Source Enthusiast</p>
          </div>
        </div>
        <div className="flex gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-indigo-500">12</div>
            <div className="text-xs text-gray-500">仓库</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-500">897</div>
            <div className="text-xs text-gray-500">Stars</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-500">208</div>
            <div className="text-xs text-gray-500">Forks</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-500">1,234</div>
            <div className="text-xs text-gray-500">Contributions</div>
          </div>
        </div>
      </GlassCard>

      {/* Project Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, i) => (
          <GlassCard key={project.name} delay={i * 0.08} className="relative group">
            {project.pinned && (
              <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                📌 Pinned
              </span>
            )}
            <div className="mb-3">
              <h3 className="font-semibold text-lg flex items-center gap-2 group-hover:text-indigo-500 transition-colors">
                <GitBranch size={16} className="text-gray-400" />
                {project.name}
              </h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.topics.map((topic) => (
                <span key={topic} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  {topic}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: project.langColor }} />
                {project.language}
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Star size={12} /> {project.stars}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork size={12} /> {project.forks}
                </span>
                <a href={project.url} target="_blank" className="hover:text-indigo-500 transition-colors">
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Contribution Graph Placeholder */}
      <GlassCard className="mt-10 text-center py-8">
        <p className="text-gray-400 text-sm mb-4">📊 年度贡献热力图</p>
        <div className="flex justify-center gap-0.5 flex-wrap max-w-lg mx-auto">
          {Array.from({ length: 365 }).map((_, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-sm"
              style={{
                backgroundColor: [
                  "rgba(99,102,241,0.1)",
                  "rgba(99,102,241,0.3)",
                  "rgba(99,102,241,0.5)",
                  "rgba(99,102,241,0.8)",
                ][Math.floor(Math.random() * 4)],
              }}
            />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}