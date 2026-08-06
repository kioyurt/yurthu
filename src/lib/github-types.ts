// GitHub 数据类型与常量（不含服务端逻辑，可安全被客户端引用）

export const GITHUB_USERNAME = "kioyurt";
export const GITHUB_URL = `https://github.com/${GITHUB_USERNAME}`;

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  html_url: string;
  blog: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  fork: boolean;
  archived: boolean;
  pushed_at: string;
}

// 常见语言颜色（GitHub 官方色）
export const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Vue: "#41b883",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Java: "#b07219",
  Go: "#00ADD8",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Shell: "#89e051",
  Dockerfile: "#384d54",
  HCL: "#844FBA",
  Jupyter: "#DA5B0B",
  Markdown: "#083fa1",
};
export const DEFAULT_LANG_COLOR = "#8b8b8b";