"use client";

import { useState } from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import GlassCard from "@/components/ui/GlassCard";
import { useSettings } from "@/context/SettingsContext";
import { useT } from "@/hooks/useT";
import {
  Star, GitFork, GitBranch, ExternalLink, Users, BookOpen,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/BrandIcons";
import {
  GITHUB_USERNAME, GITHUB_URL, LANG_COLORS, DEFAULT_LANG_COLOR,
  type GitHubUser, type GitHubRepo,
} from "@/lib/github-types";

// 想手动置顶就填仓库名，如 ["kirameku"]；留空 = 按 Star 数自动取前 3
const PINNED_REPOS: string[] = [];
const MAX_REPOS = 9;

export default function ProjectsClient({
  user,
  repos,
}: {
  user: GitHubUser | null;
  repos: GitHubRepo[];
}) {
  const { settings } = useSettings();
  const { tr } = useT();
  const [chartFailed, setChartFailed] = useState(false);
  const accent = settings.accentColor.replace("#", ""); // 热力图跟随主题色

  // 只展示自己的、未归档的仓库，按 Star 排序
  const sorted = repos
    .filter((r) => !r.fork && !r.archived)
    .sort((a, b) => b.stargazers_count - a.stargazers_count);
  const shown = sorted.slice(0, MAX_REPOS);
  const pinnedNames = PINNED_REPOS.length
    ? PINNED_REPOS
    : sorted.slice(0, 3).map((r) => r.name);

  const totalStars = sorted.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = sorted.reduce((s, r) => s + r.forks_count, 0);

  const stats = [
    { label: "仓库", value: user?.public_repos ?? 0, color: "text-indigo-500", icon: BookOpen },
    { label: "Stars", value: totalStars, color: "text-green-500", icon: Star },
    { label: "Forks", value: totalForks, color: "text-purple-500", icon: GitFork },
    { label: "关注者", value: user?.followers ?? 0, color: "text-orange-500", icon: Users },
  ];

  // —— 网络失败兜底 ——
  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24">
        <SectionTitle title={tr("开源项目")} subtitle={tr("在 GitHub 上的代码与贡献")} />
        <GlassCard className="text-center py-16">
          <GithubIcon size={40} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-400 mb-6">
            {tr("GitHub 数据暂时无法加载（网络或 API 限流），请稍后刷新。")}
          </p>
          <a
            href={GITHUB_URL}
            target="_blank"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl accent-bg text-white"
          >
            <ExternalLink size={16} /> {tr("直接访问 GitHub")}
          </a>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-24">
      <SectionTitle
        title={tr("开源项目")}
        subtitle={`@${user.login} · ${tr("数据来自 GitHub，每小时自动更新")}`}
      />

      {/* 真实用户卡片 */}
      <GlassCard className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar_url}
            alt={user.login}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-full ring-2 ring-indigo-500/40"
          />
          <div>
            <h3 className="font-bold text-lg">{user.name ?? user.login}</h3>
            <p className="text-sm text-gray-500">{user.bio ?? tr("这个人很懒，什么都没写")}</p>
            <a
              href={user.html_url}
              target="_blank"
              className="text-xs accent-text hover:underline inline-flex items-center gap-1 mt-1"
            >
              <ExternalLink size={12} /> {user.html_url}
            </a>
          </div>
        </div>
        <div className="flex gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className={`text-2xl font-bold ${s.color}`}>
                {Number(s.value).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">{tr(s.label)}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* 真实仓库列表 */}
      {shown.length === 0 ? (
        <GlassCard className="text-center py-12 text-gray-400">
          {tr("还没有公开仓库，去 GitHub 写第一个项目吧 →")}
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shown.map((repo, i) => (
            <GlassCard key={repo.name} delay={i * 0.08} className="relative group flex flex-col">
              {pinnedNames.includes(repo.name) && (
                <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  {tr("📌 Pinned")}
                </span>
              )}
              <a href={repo.html_url} target="_blank" className="mb-3">
                <h3 className="font-semibold text-lg flex items-center gap-2 group-hover:text-indigo-500 transition-colors">
                  <GitBranch size={16} className="text-gray-400" />
                  {repo.name}
                </h3>
              </a>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                {repo.description ?? tr("暂无描述")}
              </p>
              {repo.topics?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {repo.topics.slice(0, 4).map((topic) => (
                    <span
                      key={topic}
                      className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-auto flex items-center justify-between text-xs text-gray-400 pt-2">
                <span className="flex items-center gap-1">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        LANG_COLORS[repo.language ?? ""] ?? DEFAULT_LANG_COLOR,
                    }}
                  />
                  {repo.language ?? "—"}
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Star size={12} /> {repo.stargazers_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork size={12} /> {repo.forks_count}
                  </span>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    className="hover:text-indigo-500 transition-colors"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* 真实贡献热力图（跟随主题色） */}
      <GlassCard className="mt-10 py-8 text-center">
        <p className="text-gray-400 text-sm mb-4">{tr("📊 年度贡献热力图")}</p>
        {!chartFailed ? (
          <img
            src={`https://ghchart.rshah.org/${accent}/${GITHUB_USERNAME}`}
            onError={() => setChartFailed(true)}
            alt="GitHub 贡献热力图"
            className="w-full max-w-4xl mx-auto"
          />
        ) : (
          <a
            href={user.html_url}
            target="_blank"
            className="text-sm accent-text hover:underline"
          >
            {tr("热力图加载失败，去 GitHub 查看 →")}
          </a>
        )}
      </GlassCard>
    </div>
  );
}