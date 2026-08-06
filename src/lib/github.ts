import { GITHUB_USERNAME, type GitHubRepo, type GitHubUser } from "./github-types";

/**
 * 服务端获取 GitHub 数据，缓存 1 小时。
 * 可选：在 .env.local 里加 GITHUB_TOKEN=ghp_xxx 提升限流额度（不加也能用）
 */
export async function fetchGitHubData(): Promise<{
  user: GitHubUser | null;
  repos: GitHubRepo[];
}> {
  const headers: Record<string, string> = {
    "User-Agent": "kioyurt-blog",
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
        next: { revalidate: 3600 },
        headers,
      }),
      fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=pushed`,
        { next: { revalidate: 3600 }, headers }
      ),
    ]);

    const user = userRes.ok ? ((await userRes.json()) as GitHubUser) : null;
    const repos = reposRes.ok ? ((await reposRes.json()) as GitHubRepo[]) : [];
    return { user, repos };
  } catch (e) {
    console.error("GitHub 数据获取失败：", e);
    return { user: null, repos: [] };
  }
}