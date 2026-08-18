export interface PriorityItem {
  id: number;
  name: string;
}

export interface UserItem {
  createdAt?: string;
  email: string;
  id: string;
  isActive: boolean;
  isEmailConfirmed?: boolean;
  lastLoginAt?: string | null;
  name: string;
  role?: number;
  roleName?: string;
}

export interface WorkItemListItem {
  assignee?: string;
  assigneeUserId?: string | null;
  dueDate?: string | null;
  id: string;
  priority?: string;
  projectId: string;
  projectName?: string;
  startDate?: string | null;
  status: string;
  subject: string;
  type?: string;
  updatedAt: string;
}

export interface WorkItemsResponse {
  items: WorkItemListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface WorkItemsViewModel {
  items: WorkItemListItem[];
  total: number;
  page: number;
  pageSize: number;
  hasItems: boolean;
}

export interface WorkItemDetail {
  id: string;
  projectId: string;
  projectName: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  authorUserId?: string | null;
  author: string;
  assigneeUserId: string | null;
  assignee: string;
  dueDate: string | null;
  parentSummary: string | null;
  relationCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkItemComment {
  id: string;
  workItemId: string;
  authorUserId: string;
  body: string;
  createdAt: string;
  isDeleted?: boolean;
  updatedAt: string | null;
}

export interface WorkItemRelation {
  id: string;
  sourceWorkItemId: string;
  targetWorkItemId: string;
  relationType: string | null;
  createdAt: string;
}

export interface WorkItemWatcher {
  id: string;
  workItemId: string;
  userId: string;
  subscribedAt: string;
}

export interface WorkItemAttachment {
  id: string;
  workItemId: string;
  fileName: string;
  contentType: string;
  sizeInBytes: number;
  storagePath: string;
  linkedAt: string;
  linkedByUserId?: string;
}
