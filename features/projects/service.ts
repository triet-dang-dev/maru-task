import { getPublicEnv } from "@/utils/env";
import { fetchWithSession } from "@/services/api/session-fetch";

import type { ProjectDetail, ProjectsResponse } from "./types";

export type CreateProjectInput = {
  code?: string | null;
  description?: string | null;
  name: string;
};

export async function getProjects(): Promise<ProjectsResponse> {
  const { NEXT_PUBLIC_API_BASE_URL } = getPublicEnv();
  const response = await fetchWithSession(`${NEXT_PUBLIC_API_BASE_URL}/v1/projects`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch projects: ${response.status}`);
  }

  return response.json();
}

export async function getProject(projectId: string): Promise<ProjectDetail> {
  const { NEXT_PUBLIC_API_BASE_URL } = getPublicEnv();
  const response = await fetchWithSession(
    `${NEXT_PUBLIC_API_BASE_URL}/v1/projects/${encodeURIComponent(projectId)}`,
    {
      cache: "no-store",
      headers: { Accept: "application/json" },
    },
  );
  if (!response.ok) throw new Error(`Unable to fetch project: ${response.status}`);
  return response.json();
}

export async function createProject(input: CreateProjectInput): Promise<ProjectDetail> {
  const { NEXT_PUBLIC_API_BASE_URL } = getPublicEnv();
  const response = await fetchWithSession(`${NEXT_PUBLIC_API_BASE_URL}/v1/projects`, {
    body: JSON.stringify(input),
    cache: "no-store",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) throw new Error(`Unable to create project: ${response.status}`);
  return response.json();
}
