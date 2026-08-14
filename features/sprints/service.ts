import { getPublicEnv } from "@/utils/env";
import { fetchWithSession } from "@/services/api/session-fetch";

import type { SprintsResponse } from "./types";

export async function getSprints(projectId: string): Promise<SprintsResponse> {
  const { NEXT_PUBLIC_API_BASE_URL } = getPublicEnv();
  const response = await fetchWithSession(
    `${NEXT_PUBLIC_API_BASE_URL}/v1/projects/${encodeURIComponent(projectId)}/sprints`,
    {
      cache: "no-store",
      headers: { Accept: "application/json" },
    },
  );

  if (!response.ok) throw new Error(`Unable to fetch sprints: ${response.status}`);
  return response.json();
}

export async function createSprint(
  projectId: string,
  input: { endDate: string | null; name: string; startDate: string | null },
): Promise<void> {
  const response = await fetchWithSession(
    `/api/v1/projects/${encodeURIComponent(projectId)}/sprints`,
    {
      body: JSON.stringify(input),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : `Unable to create sprint: ${response.status}`;

    throw new Error(message);
  }
}
