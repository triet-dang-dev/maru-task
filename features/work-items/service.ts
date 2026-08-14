import { getPublicEnv } from "@/utils/env";
import { fetchWithSession } from "@/services/api/session-fetch";

import type {
  PriorityItem,
  UserItem,
  WorkItemAttachment,
  WorkItemComment,
  WorkItemDetail,
  WorkItemRelation,
  WorkItemWatcher,
  WorkItemsResponse,
  WorkItemsViewModel,
} from "./types";

function mapWorkItemsResponse(response: WorkItemsResponse): WorkItemsViewModel {
  return {
    hasItems: response.items.length > 0,
    items: response.items,
    page: response.page,
    pageSize: response.pageSize,
    total: response.total,
  };
}

export async function getWorkItems(projectId: string): Promise<WorkItemsViewModel> {
  const { NEXT_PUBLIC_API_BASE_URL } = getPublicEnv();
  const response = await fetchWithSession(
    `${NEXT_PUBLIC_API_BASE_URL}/v1/work-items?projectId=${encodeURIComponent(projectId)}`,
    {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to fetch work items: ${response.status}`);
  }

  const payload: WorkItemsResponse = await response.json();
  return mapWorkItemsResponse(payload);
}

export async function createWorkItem(input: { projectId: string; title: string }): Promise<void> {
  const response = await fetchWithSession("/api/v1/work-items", {
    body: JSON.stringify({ projectId: input.projectId, title: input.title }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : `Unable to create work item: ${response.status}`;

    throw new Error(message);
  }
}

export async function getWorkItem(workItemId: string): Promise<WorkItemDetail> {
  const response = await fetchWithSession(`/api/v1/work-items/${encodeURIComponent(workItemId)}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch work item: ${response.status}`);
  }

  return response.json();
}

export async function updateWorkItem(
  workItemId: string,
  input: {
    assigneeUserId?: string;
    description?: string;
    dueDate?: string | null;
    priorityId?: string;
    subject?: string;
  },
): Promise<void> {
  const response = await fetchWithSession(`/api/v1/work-items/${encodeURIComponent(workItemId)}`, {
    body: JSON.stringify(input),
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    method: "PATCH",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : `Unable to update work item: ${response.status}`;
    throw new Error(message);
  }
}

export async function deleteWorkItem(workItemId: string): Promise<void> {
  const response = await fetchWithSession(`/api/v1/work-items/${encodeURIComponent(workItemId)}`, {
    headers: { Accept: "application/json" },
    method: "DELETE",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : `Unable to delete work item: ${response.status}`;
    throw new Error(message);
  }
}

export async function createWorkItemComment(
  workItemId: string,
  body: string,
): Promise<WorkItemComment> {
  const response = await fetchWithSession(
    `/api/v1/work-items/${encodeURIComponent(workItemId)}/comments`,
    {
      body: JSON.stringify({ body }),
      headers: { Accept: "application/json", "Content-Type": "application/json" },
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
        : `Unable to add comment: ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export async function createWorkItemRelation(
  workItemId: string,
  input: { relatedWorkItemId: string; relationType: string },
): Promise<WorkItemRelation> {
  const response = await fetchWithSession(
    `/api/v1/work-items/${encodeURIComponent(workItemId)}/relations`,
    {
      body: JSON.stringify(input),
      headers: { Accept: "application/json", "Content-Type": "application/json" },
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
        : `Unable to add relation: ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export async function createWorkItemWatcher(
  workItemId: string,
  userId: string,
): Promise<WorkItemWatcher> {
  const response = await fetchWithSession(
    `/api/v1/work-items/${encodeURIComponent(workItemId)}/watchers`,
    {
      body: JSON.stringify({ userId }),
      headers: { Accept: "application/json", "Content-Type": "application/json" },
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
        : `Unable to add watcher: ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export async function createWorkItemAttachment(
  workItemId: string,
  input: {
    contentType: string;
    fileName: string;
    sizeInBytes: string;
    storagePath: string;
  },
): Promise<WorkItemAttachment> {
  const response = await fetchWithSession(
    `/api/v1/work-items/${encodeURIComponent(workItemId)}/attachments`,
    {
      body: JSON.stringify(input),
      headers: { Accept: "application/json", "Content-Type": "application/json" },
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
        : `Unable to link attachment: ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export async function getPriorities(): Promise<PriorityItem[]> {
  const response = await fetchWithSession("/api/v1/priorities", {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch priorities: ${response.status}`);
  }

  const payload: { items: PriorityItem[]; total: number } = await response.json();
  return payload.items;
}

export async function getUsers(search?: string): Promise<UserItem[]> {
  const url = new URL("/api/v1/users", window.location.origin);
  if (search?.trim()) url.searchParams.set("search", search.trim());

  const response = await fetchWithSession(url.toString(), {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch users: ${response.status}`);
  }

  const payload: { items: UserItem[]; total: number } = await response.json();
  return payload.items;
}
