import { fetchGitHubData } from "@/lib/github";
import ProjectsClient from "./ProjectsClient";

export const revalidate = 3600; // 每小时自动重新拉取

export default async function ProjectsPage() {
  const { user, repos } = await fetchGitHubData();
  return <ProjectsClient user={user} repos={repos} />;
}