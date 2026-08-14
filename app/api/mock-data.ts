interface MockProject {
  code: string;
  id: string;
  name: string;
  status: string;
  updatedAt: string;
}

interface MockPriority {
  id: number;
  name: string;
}

interface MockUser {
  email: string;
  id: number;
  isActive: boolean;
  name: string;
}

interface MockWorkItem {
  assigneeUserId?: number;
  dueDate?: string | null;
  id: string;
  priorityId?: number;
  projectId: string;
  status: string;
  subject: string;
  updatedAt: string;
}

interface MockSprint {
  createdAt: string;
  endDate: string | null;
  id: string;
  name: string;
  projectId: string;
  startDate: string | null;
  status: string;
  statusId: number;
}

const priorities: MockPriority[] = [
  { id: 1, name: "Low" },
  { id: 2, name: "Normal" },
  { id: 3, name: "High" },
  { id: 4, name: "Urgent" },
];

const users: MockUser[] = [
  { email: "mchen@example.com", id: 1, isActive: true, name: "Morgan Chen" },
  { email: "jlee@example.com", id: 2, isActive: true, name: "Jamie Lee" },
  { email: "akim@example.com", id: 3, isActive: true, name: "Alex Kim" },
  { email: "sparker@example.com", id: 4, isActive: true, name: "Sam Parker" },
];

const projects: MockProject[] = [
  {
    code: "MIG",
    id: "42",
    name: "Next.js migration",
    status: "Active",
    updatedAt: "2026-08-12T10:00:00Z",
  },
  {
    code: "MOB",
    id: "51",
    name: "Mobile release",
    status: "Planning",
    updatedAt: "2026-08-11T15:30:00Z",
  },
  {
    code: "OPS",
    id: "63",
    name: "Operations reliability",
    status: "Active",
    updatedAt: "2026-08-10T09:15:00Z",
  },
  {
    code: "WEB",
    id: "77",
    name: "Customer workspace",
    status: "On hold",
    updatedAt: "2026-08-08T13:45:00Z",
  },
];

const workItems: MockWorkItem[] = [
  {
    id: "101",
    projectId: "42",
    status: "In progress",
    subject: "Map the project list contract",
    updatedAt: "2026-08-12T10:00:00Z",
  },
  {
    id: "102",
    projectId: "42",
    status: "Open",
    subject: "Migrate the work-item table",
    updatedAt: "2026-08-11T15:30:00Z",
  },
  {
    id: "103",
    projectId: "42",
    status: "Open",
    subject: "Create the authentication screen",
    updatedAt: "2026-08-10T09:15:00Z",
  },
  {
    id: "104",
    projectId: "51",
    status: "Open",
    subject: "Prepare mobile release notes",
    updatedAt: "2026-08-11T11:20:00Z",
  },
];

const sprints: MockSprint[] = [
  {
    createdAt: "2026-08-13T10:00:00.000Z",
    endDate: "2026-09-14T00:00:00.000Z",
    id: "7",
    name: "September delivery",
    projectId: "42",
    startDate: "2026-09-01T00:00:00.000Z",
    status: "Active",
    statusId: 2,
  },
];

function pageItems<TItem>(items: TItem[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function getMockProjects({
  page,
  pageSize,
  search,
  sortBy,
  sortDir,
}: {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}) {
  const query = search?.toLocaleLowerCase();
  const filtered = query
    ? projects.filter((project) =>
        [project.code, project.name, project.status].some((value) =>
          value.toLocaleLowerCase().includes(query),
        ),
      )
    : projects;
  const sorted = [...filtered].sort((first, second) => {
    const field =
      sortBy === "code" || sortBy === "status" || sortBy === "updatedAt" ? sortBy : "name";
    const comparison = first[field].localeCompare(second[field]);
    return sortDir === "desc" ? -comparison : comparison;
  });

  return { items: pageItems(sorted, page, pageSize), page, pageSize, total: sorted.length };
}

export function getMockProject(projectId: string) {
  const project = projects.find((item) => item.id === projectId);
  if (!project) return null;

  return {
    ...project,
    createdAt: project.updatedAt,
    description: `Workspace for ${project.name.toLocaleLowerCase()} planning and delivery.`,
  };
}

export function getMockWorkItems({
  page,
  pageSize,
  projectId,
}: {
  page: number;
  pageSize: number;
  projectId?: string;
}) {
  const projectItems = projectId
    ? workItems.filter((item) => item.projectId === projectId)
    : workItems;
  return {
    items: pageItems(projectItems, page, pageSize).map((item) => ({
      ...item,
      assignee: item.assigneeUserId ? `User ${item.assigneeUserId}` : "",
      assigneeUserId: item.assigneeUserId ? String(item.assigneeUserId) : null,
      priority: item.priorityId ? `Priority ${item.priorityId}` : "Normal",
      projectName: projects.find((project) => project.id === item.projectId)?.name ?? "",
    })),
    page,
    pageSize,
    total: projectItems.length,
  };
}

export function getMockSprints({
  page,
  pageSize,
  projectId,
}: {
  page: number;
  pageSize: number;
  projectId: string;
}) {
  const projectSprints = sprints.filter((sprint) => sprint.projectId === projectId);
  return {
    items: pageItems(projectSprints, page, pageSize).map((sprint) => ({
      endDate: sprint.endDate,
      createdAt: sprint.createdAt,
      id: sprint.id,
      name: sprint.name,
      projectId: sprint.projectId,
      startDate: sprint.startDate,
      status: sprint.status,
      statusId: sprint.statusId,
    })),
    page,
    pageSize,
    total: projectSprints.length,
  };
}

export function createMockSprint({
  endDate,
  name,
  projectId,
  startDate,
}: {
  endDate: string | null;
  name: string;
  projectId: string;
  startDate: string | null;
}) {
  const nextId = String(Math.max(0, ...sprints.map((sprint) => Number(sprint.id))) + 1);
  const sprint: MockSprint = {
    createdAt: new Date().toISOString(),
    endDate,
    id: nextId,
    name,
    projectId,
    startDate,
    status: "Planned",
    statusId: 1,
  };

  sprints.unshift(sprint);
  return sprint;
}

export function createMockWorkItem({ projectId, title }: { projectId: string; title: string }) {
  const item: MockWorkItem = {
    id: String(Math.max(...workItems.map((workItem) => Number(workItem.id))) + 1),
    projectId,
    status: "Open",
    subject: title,
    updatedAt: new Date().toISOString(),
  };
  workItems.unshift(item);
  return item;
}

export function getMockWorkItem(workItemId: string) {
  const item = workItems.find((workItem) => workItem.id === workItemId);
  if (!item) return null;

  return {
    ...item,
    assignee: item.assigneeUserId ? `User ${item.assigneeUserId}` : "Morgan Chen",
    assigneeUserId: String(item.assigneeUserId ?? 1),
    author: "Morgan Chen",
    authorUserId: "1",
    commentCount: 0,
    createdAt: item.updatedAt,
    description: `Details for ${item.subject}.`,
    dueDate: item.dueDate ?? null,
    parentSummary: null,
    priority: item.priorityId ? `Priority ${item.priorityId}` : "Normal",
    projectName: projects.find((project) => project.id === item.projectId)?.name ?? "",
    relationCount: 0,
    type: "Task",
  };
}

export function updateMockWorkItem(
  workItemId: string,
  input: {
    assigneeUserId?: number;
    description?: string;
    dueDate?: string | null;
    priorityId?: number;
    subject?: string;
  },
) {
  const item = workItems.find((workItem) => workItem.id === workItemId);
  if (!item) return null;

  if (input.subject !== undefined) item.subject = input.subject;
  if (input.assigneeUserId !== undefined) item.assigneeUserId = input.assigneeUserId;
  if (input.dueDate !== undefined) item.dueDate = input.dueDate;
  if (input.priorityId !== undefined) item.priorityId = input.priorityId;
  item.updatedAt = new Date().toISOString();

  const detail = getMockWorkItem(workItemId);
  return detail ? { ...detail, description: input.description ?? detail.description } : null;
}

export function deleteMockWorkItem(workItemId: string) {
  const index = workItems.findIndex((workItem) => workItem.id === workItemId);
  if (index < 0) return false;

  workItems.splice(index, 1);
  return true;
}

export function createMockWorkItemComment({
  body,
  workItemId,
}: {
  body: string;
  workItemId: string;
}) {
  const item = workItems.find((workItem) => workItem.id === workItemId);
  if (!item) return null;

  return {
    authorUserId: "1",
    body,
    createdAt: new Date().toISOString(),
    id: String(Date.now()),
    isDeleted: false,
    updatedAt: null,
    workItemId,
  };
}

export function createMockWorkItemRelation({
  relatedWorkItemId,
  relationType,
  workItemId,
}: {
  relatedWorkItemId: string;
  relationType: string | null;
  workItemId: string;
}) {
  const sourceWorkItem = workItems.find((workItem) => workItem.id === workItemId);
  const targetWorkItem = workItems.find((workItem) => workItem.id === relatedWorkItemId);
  if (!sourceWorkItem || !targetWorkItem) return null;

  return {
    createdAt: new Date().toISOString(),
    id: String(Date.now()),
    relationType,
    sourceWorkItemId: workItemId,
    targetWorkItemId: relatedWorkItemId,
  };
}

export function createMockWorkItemWatcher({
  userId,
  workItemId,
}: {
  userId: string;
  workItemId: string;
}) {
  const item = workItems.find((workItem) => workItem.id === workItemId);
  if (!item) return null;

  return {
    id: String(Date.now()),
    subscribedAt: new Date().toISOString(),
    userId,
    workItemId,
  };
}

export function createMockWorkItemAttachment({
  contentType,
  fileName,
  sizeInBytes,
  storagePath,
  workItemId,
}: {
  contentType: string;
  fileName: string;
  sizeInBytes: number;
  storagePath: string;
  workItemId: string;
}) {
  const item = workItems.find((workItem) => workItem.id === workItemId);
  if (!item) return null;

  return {
    contentType,
    fileName,
    id: String(Date.now()),
    linkedAt: new Date().toISOString(),
    linkedByUserId: "1",
    sizeInBytes,
    storagePath,
    workItemId,
  };
}

export function getMockAuthData(actionPath: string) {
  if (actionPath === "me") {
    return {
      data: { displayName: "Morgan Chen", role: "ProjectManager", userId: 1 },
      errorCode: "",
      success: true,
    };
  }

  return { data: null, errorCode: "", success: true };
}

export function getMockPriorities() {
  return { items: priorities.map((p) => ({ id: p.id, name: p.name })), total: priorities.length };
}

export function getMockUsers({ search }: { search?: string }) {
  const query = search?.toLocaleLowerCase();
  const filtered = query
    ? users.filter(
        (u) =>
          u.name.toLocaleLowerCase().includes(query) || u.email.toLocaleLowerCase().includes(query),
      )
    : users;
  return {
    items: filtered.map((u) => ({
      createdAt: "2026-01-01T00:00:00.000Z",
      email: u.email,
      id: String(u.id),
      isActive: u.isActive,
      isEmailConfirmed: true,
      lastLoginAt: null,
      name: u.name,
      role: u.id === 1 ? 1 : 2,
      roleName: u.id === 1 ? "Admin" : "Member",
    })),
    total: filtered.length,
  };
}
